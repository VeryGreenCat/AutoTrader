import pandas as pd
import numpy as np
import time
import schedule
import MetaTrader5 as mt5
from llm import add_llm_features
from feature_eng import run_feature_pipeline
from ppo_agent import load_model, predict_action
from mt5_connector import get_ohlc_data, shutdown_mt5, get_mt5_state_features
from api_client import post_llm_analysis, get_latest_market_context, send_trade_signal, register_model, get_active_bot_states
from model_config import ModelConfig, MODEL_REGISTRY

def run_12hourly_update(cfg: ModelConfig):
    """
    Perform 12 hourly LLM-based pattern analysis and pipe it to Go.
    """
    print(f"\n--- RUNNING 12 HOURLY LLM ANALYSIS FOR {cfg.symbol} ({cfg.version}) ---")
    
    # 1. Fetch data
    ohlc_df = get_ohlc_data(cfg.symbol, cfg.timeframe, cfg.weekly_bars)
    if ohlc_df is None:
        print("Failed to fetch data for 12 hourly update.")
        return False
    
    # 2. Run LLM analysis
    llm_features = add_llm_features(ohlc_df)
    
    # 3. Send to Go backend (Go will save it to Supabase)
    success = post_llm_analysis(cfg.symbol, llm_features)
    if success:
        print("12 hourly LLM analysis complete and delivered to Go backend.")
    return success

def run_hourly_step(cfg: ModelConfig):
    """
    Perform hourly trading step using context from Go backend.
    """
    print(f"\n--- RUNNING HOURLY TRADING STEP FOR {cfg.symbol} ({cfg.version}) ---")
    
    # 1. Fetch context from Go API
    llm_context = get_latest_market_context(cfg.symbol)
    if llm_context is None:
        print("Market context not found in DB via Go. Running 12 hourly update first...")
        if not run_12hourly_update(cfg):
            return False
        llm_context = get_latest_market_context(cfg.symbol)

    if llm_context is None:
        print("CRITICAL: Failed to retrieve market context from Go backend.")
        return False

    # 2. Fetch latest OHLC data for feature engineering
    ohlc_df = get_ohlc_data(cfg.symbol, cfg.timeframe, cfg.hourly_bars)
    if ohlc_df is None:
        print("Failed to fetch data for hourly step.")
        return False

    # 3. Add LLM context to the dataframe
    # map API fields back to feature_eng column names
    for key, value in llm_context.items():
        if key in ["bias_score", "confidence", "volatility", "trend_strength", "momentum", "skip_flag"]:
            ohlc_df[key] = value

    # 4. Run feature engineering pipeline
    try:
        featured_df, feature_cols = run_feature_pipeline(ohlc_df)
    except Exception as e:
        print(f"Error in feature engineering: {e}")
        import traceback
        traceback.print_exc()
        return False

    # 5. Fetch Active User States from Go
    user_states = get_active_bot_states(cfg.symbol, cfg.version)
    if not user_states:
        print(f"No active online users found for {cfg.symbol} {cfg.version}. Skipping prediction.")
        return True

    # 6. Load model (once)
    model = load_model(cfg.model_path)
    if model is None:
        print("Failed to load PPO model.")
        return False

    success_count = 0
    
    # 7. Iterate and predict for EACH user
    for user in user_states:
        mt5_id = user.get("mt5_id")
        open_positions = user.get("open_positions", [])
        
        # Calculate state features for this specific user
        pos_val = 0.0
        time_val = 0.0
        pnl_val = 0.0
        
        if open_positions:
            # Assume one trade per symbol for the PPO agent's state
            pos = open_positions[0]
            pos_val = 1.0 if pos.get("type") == "BUY" else -1.0
            
            # Logic for time (approx using 1 hour as bar unit)
            # In a real setup, you'd send the 'entry_time' in the DTO, 
            # for now we'll use a placeholder or assume the EA sends enough info.
            # Simplified: if in trade, we set it to a representative hold value
            time_val = 0.05 # placeholder for "In a trade"
            pnl_val = float(pos.get("profit", 0.0)) / 10.0 # simple scaling
        
        # 1. Prepare base features for the window (120 bars)
        window_df = featured_df.iloc[-cfg.observation_window:].copy()
        
        # 2. Prepare LLM features for the window (Using raw values as requested)
        llm_cols = ["bias_score", "confidence", "volatility", "trend_strength", "momentum", "skip_flag"]

        # 3. Calculate DYNAMIC state features for this specific user
        # We need to build a 120-bar history of their current position
        window_len = cfg.observation_window
        pos_series = np.zeros(window_len)
        time_series = np.zeros(window_len)
        pnl_series = np.zeros(window_len)

        if open_positions:
            pos = open_positions[0]
            pos_val = 1.0 if pos.get("type") == "BUY" else -1.0
            entry_price = float(pos.get("entry", 0.0))
            
            # Use current prices from the window to calculate what the PnL WAS at each bar
            close_prices = window_df["Close"].values
            
            # Simplified point/pip calculation (keeping it robust)
            if pos_val == 1.0:
                pips_history = (close_prices - entry_price) / cfg.pip_size
            else:
                pips_history = (entry_price - close_prices) / cfg.pip_size
            
            # Fill the arrays
            pos_series.fill(pos_val)
            pnl_series = pips_history / 100.0 # Scaling used in environment
            
            # Time in trade (increments per bar)
            # We don't have exact entry bar, but we can estimate or use current bars_elapsed
            import time as pytime
            entry_time = int(pos.get("time", pytime.time())) # Assuming EA provides this, otherwise fallback
            current_time = int(pytime.time())
            total_bars_in_trade = (current_time - entry_time) // 3600
            
            # Backfill the time series
            for i in range(window_len):
                dist_from_now = (window_len - 1) - i
                bar_time_in_trade = total_bars_in_trade - dist_from_now
                if bar_time_in_trade > 0:
                    time_series[i] = bar_time_in_trade / 1000.0  # Scaling used in env

        # 4. Attach state features to window
        window_df["position_state"] = pos_series
        window_df["time_in_trade_state"] = time_series
        window_df["unrealized_pnl_state"] = pnl_series
        
        final_features = window_df[feature_cols + ["position_state", "time_in_trade_state", "unrealized_pnl_state"]]
        
        # ── PPO Input State Debug ──────────────────────────────────────
        last_row = final_features.iloc[-1]
        print(f"\n{'='*55}")
        print(f"  PPO INPUT STATE  |  MT5 ID: {mt5_id}")
        print(f"{'='*55}")
        print(f"  [Account]")
        print(f"    Balance         : {user.get('balance', 'N/A'):.2f}")
        print(f"    Equity          : {user.get('equity', 'N/A'):.2f}")
        print(f"  [RL State Features (Last Bar)]")
        print(f"    position_state       : {last_row['position_state']:+.4f}")
        print(f"    time_in_trade_state  : {last_row['time_in_trade_state']:+.4f}")
        print(f"    unrealized_pnl_state : {last_row['unrealized_pnl_state']:+.4f}")
        print(f"  [LLM Context (Normalized)]")
        for col in llm_cols:
            print(f"    {col:<22}: {last_row[col]:+.4f}")
        print(f"{'='*55}\n")
        # ──────────────────────────────────────────────────────────────

        # Predict
        action, action_probs = predict_action(model, final_features, window_size=cfg.observation_window)
        
        # Map and Send
        action_map_list = cfg.build_action_map()
        act_tuple = action_map_list[int(action)]
        act_type = act_tuple[0]
        
        if act_type == "HOLD":
            action_str = "HOLD"
        elif act_type == "CLOSE":
            action_str = "CLOSE"
        elif act_type == "OPEN":
            direction_val = act_tuple[1]
            action_str = "BUY" if direction_val == 1 else "SELL"
        else:
            action_str = "HOLD"

        # ── PPO Action Probabilities Debug ─────────────────────────────
        print(f"  [PPO Action Probabilities] (130 distinct actions)")
        print(f"    Chosen Action ID: {action}")
        print(f"    Action Type: {act_type}")
        if act_type == "OPEN":
            print(f"    Direction: {'BUY' if act_tuple[1] == 1 else 'SELL'}, SL: {act_tuple[2]}, TP: {act_tuple[3]}")
        print()
        # ───────────────────────────────────────────────────────────────
        
        if act_type == "OPEN":
            sl_pips = act_tuple[2]
            tp_pips = act_tuple[3]
        else:
            sl_pips = 0.0
            tp_pips = 0.0
            
        if send_trade_signal(cfg.symbol, cfg.version, action_str, sl_pips, tp_pips, mt5_id=mt5_id):
            success_count += 1
            print(f"  > Signal {action_str} sent to MT5 {mt5_id} (SL={sl_pips}, TP={tp_pips})")

    print(f"Completed hourly step. Distributed {success_count} personalized signals.")
    return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "12hr":
            for cfg in MODEL_REGISTRY:
                run_12hourly_update(cfg)
            shutdown_mt5()
        elif command == "hr":
            for cfg in MODEL_REGISTRY:
                run_hourly_step(cfg)
            shutdown_mt5()
        elif command == "auto":
            print("Starting automatic bot scheduler...")
            print(f"Loaded {len(MODEL_REGISTRY)} model(s): {[c.symbol + ' ' + c.version for c in MODEL_REGISTRY]}")
            
            # Register & schedule each model
            for cfg in MODEL_REGISTRY:
                register_model(
                    name=cfg.name,
                    version=cfg.version,
                    currency=cfg.symbol,
                    description=cfg.description,
                )
                schedule.every(cfg.llm_interval_hours).hours.do(run_12hourly_update, cfg)
                schedule.every().hour.at(cfg.trade_interval).do(run_hourly_step, cfg)
            
            # Run initial executions
            print("Running initial setup...")
            for cfg in MODEL_REGISTRY:
                run_12hourly_update(cfg)
                run_hourly_step(cfg)
            
            print("Scheduler is now running! Waiting for the next scheduled job...")
            try:
                while True:
                    schedule.run_pending()
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nScheduler stopped by user.")
            finally:
                shutdown_mt5()
        else:
            print("Unknown command. Use '12hr', 'hr', or 'auto'.")
            shutdown_mt5()
    else:   
        # Default behavior: run hourly for all models
        for cfg in MODEL_REGISTRY:
            run_hourly_step(cfg)
        shutdown_mt5()
