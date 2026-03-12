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

# Configuration
SYMBOL = "EURUSD"
TIMEFRAME = mt5.TIMEFRAME_H1
WEEKLY_BARS = 60    # 2 days of H1 as requested for LLM
HOURLY_BARS = 300   # Enough bars for feature_eng warming up (needs ~200)
MODEL_PATH = "models/model_eurusd_best_6.zip"
BOT_VERSION = "v1"

def run_12hourly_update():
    """
    Perform 12 hourly LLM-based pattern analysis and pipe it to Go.
    """
    print(f"\n--- RUNNING 12 HOURLY LLM ANALYSIS FOR {SYMBOL} ---")
    
    # 1. Fetch data
    ohlc_df = get_ohlc_data(SYMBOL, TIMEFRAME, WEEKLY_BARS)
    if ohlc_df is None:
        print("Failed to fetch data for 12 hourly update.")
        return False
    
    # 2. Run LLM analysis
    llm_features = add_llm_features(ohlc_df)
    
    # 3. Send to Go backend (Go will save it to Supabase)
    success = post_llm_analysis(SYMBOL, llm_features)
    if success:
        print("12 hourly LLM analysis complete and delivered to Go backend.")
    return success

def run_hourly_step():
    """
    Perform hourly trading step using context from Go backend.
    """
    print(f"\n--- RUNNING HOURLY TRADING STEP FOR {SYMBOL} ---")
    
    # 1. Fetch context from Go API
    llm_context = get_latest_market_context(SYMBOL)
    if llm_context is None:
        print("Market context not found in DB via Go. Running 12 hourly update first...")
        if not run_12hourly_update():
            return False
        llm_context = get_latest_market_context(SYMBOL)

    if llm_context is None:
        print("CRITICAL: Failed to retrieve market context from Go backend.")
        return False

    # 2. Fetch latest OHLC data for feature engineering
    ohlc_df = get_ohlc_data(SYMBOL, TIMEFRAME, HOURLY_BARS)
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
    user_states = get_active_bot_states(SYMBOL, BOT_VERSION)
    if not user_states:
        print(f"No active online users found for {SYMBOL} {BOT_VERSION}. Skipping prediction.")
        return True

    # 6. Load model (once)
    model = load_model(MODEL_PATH)
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
        
        # Prepare observation
        user_df = featured_df.copy()
        user_df["position_state"] = pos_val
        user_df["time_in_trade_state"] = time_val
        user_df["unrealized_pnl_state"] = pnl_val
        
        final_features = user_df[feature_cols + ["position_state", "time_in_trade_state", "unrealized_pnl_state"]]
        
        # ── PPO Input State Debug ──────────────────────────────────────
        last_row = final_features.iloc[-1]
        print(f"\n{'='*55}")
        print(f"  PPO INPUT STATE  |  MT5 ID: {mt5_id}")
        print(f"{'='*55}")
        print(f"  [Account]")
        print(f"    Balance         : {user.get('balance', 'N/A'):.2f}")
        print(f"    Equity          : {user.get('equity', 'N/A'):.2f}")
        print(f"    Realized Today  : {user.get('realized_today', 'N/A'):.2f}")
        print(f"    Realized Week   : {user.get('realized_week', 'N/A'):.2f}")
        print(f"  [Open Position]")
        if open_positions:
            pos = open_positions[0]
            print(f"    Pair            : {pos.get('pair', 'N/A')}")
            print(f"    Type            : {pos.get('type', 'N/A')}")
            print(f"    Entry Price     : {pos.get('entry', 'N/A')}")
            print(f"    Current Price   : {pos.get('current', 'N/A')}")
            print(f"    Lot Size        : {pos.get('lot', 'N/A')}")
            print(f"    Raw Profit      : {pos.get('profit', 0.0):.2f}")
        else:
            print(f"    (no open positions)")
        print(f"  [RL State Features]")
        print(f"    position_state       : {pos_val:+.4f}  (1=BUY, -1=SELL, 0=flat)")
        print(f"    time_in_trade_state  : {time_val:+.4f}  (0=flat, 0.05=in trade)")
        print(f"    unrealized_pnl_state : {pnl_val:+.4f}  (scaled profit / 10)")
        print(f"  [LLM Context  —  last row]")
        for col in ["bias_score", "confidence", "volatility", "trend_strength", "momentum", "skip_flag"]:
            if col in last_row.index:
                print(f"    {col:<22}: {last_row[col]:+.4f}")
        print(f"  [Technical Features  —  last row  ({len(feature_cols)} cols)]")
        for col in feature_cols:
            print(f"    {col:<22}: {last_row[col]:+.6f}")
        print(f"{'='*55}\n")
        # ──────────────────────────────────────────────────────────────

        # Predict
        action, action_probs = predict_action(model, final_features, window_size=120)
        
        # Map and Send
        # Reconstruct the action space map from the training environment
        sl_opts = [5, 10, 15, 25, 30, 60, 90, 120]
        tp_opts = [5, 10, 15, 25, 30, 60, 90, 120]
        action_map_list = [("HOLD", None, None, None), ("CLOSE", None, None, None)]
        for direction in [0, 1]:  # 0=short, 1=long
            for sl in sl_opts:
                for tp in tp_opts:
                    action_map_list.append(("OPEN", direction, float(sl), float(tp)))
                    
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
            
        if send_trade_signal(SYMBOL, BOT_VERSION, action_str, sl_pips, tp_pips, mt5_id=mt5_id):
            success_count += 1
            print(f"  > Signal {action_str} sent to MT5 {mt5_id} (SL={sl_pips}, TP={tp_pips})")

    print(f"Completed hourly step. Distributed {success_count} personalized signals.")
    return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "12hourly":
            run_12hourly_update()
            shutdown_mt5()
        elif command == "hourly":
            run_hourly_step()
            shutdown_mt5()
        elif command == "auto":
            print("Starting automatic bot scheduler...")
            
            # Schedule 12 hourly update everyday
            schedule.every(12).hours.do(run_12hourly_update)
            
            # Schedule hourly step at the beginning of every hour
            schedule.every().hour.at(":00").do(run_hourly_step)
            
            # Run initial executions so it doesn't wait for the next scheduled time
            print("Running initial setup...")
            
            # 1. Register the model automatically
            register_model(
                name="PPO RL Agent", 
                version=BOT_VERSION, 
                currency=SYMBOL, 
                description="PPO Reinforcement Learning model with technical features and LLM bias context."
            )
            
            run_12hourly_update()
            run_hourly_step()
            
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
            print("Unknown command. Use '12hourly', 'hourly', or 'auto'.")
            shutdown_mt5()
    else:
        # Default behavior: run hourly
        run_hourly_step()
        shutdown_mt5()
