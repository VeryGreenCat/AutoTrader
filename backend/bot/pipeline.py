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
WEEKLY_BARS = 48    # 2 days of H1 as requested for LLM
HOURLY_BARS = 300   # Enough bars for feature_eng warming up (needs ~200)
MODEL_PATH = "models/model_eurusd_best.zip"
BOT_VERSION = "v1"

def run_weekly_update():
    """
    Perform weekly LLM-based pattern analysis and pipe it to Go.
    """
    print(f"\n--- RUNNING WEEKLY LLM ANALYSIS FOR {SYMBOL} ---")
    
    # 1. Fetch data
    ohlc_df = get_ohlc_data(SYMBOL, TIMEFRAME, WEEKLY_BARS)
    if ohlc_df is None:
        print("Failed to fetch data for weekly update.")
        return False
    
    # 2. Run LLM analysis
    llm_features = add_llm_features(ohlc_df)
    
    # 3. Send to Go backend (Go will save it to Supabase)
    success = post_llm_analysis(SYMBOL, llm_features)
    if success:
        print("Weekly LLM analysis complete and delivered to Go backend.")
    return success

def run_hourly_step():
    """
    Perform hourly trading step using context from Go backend.
    """
    print(f"\n--- RUNNING HOURLY TRADING STEP FOR {SYMBOL} ---")
    
    # 1. Fetch context from Go API
    llm_context = get_latest_market_context(SYMBOL)
    if llm_context is None:
        print("Market context not found in DB via Go. Running weekly update first...")
        if not run_weekly_update():
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
        
        # Predict
        action, _ = predict_action(model, final_features, window_size=60)
        
        # Map and Send
        action_map = {0: "CLOSE", 1: "BUY", 2: "SELL"}
        action_str = action_map.get(int(action), "CLOSE")
        
        if send_trade_signal(SYMBOL, BOT_VERSION, action_str, mt5_id=mt5_id):
            success_count += 1
            print(f"  > Signal {action_str} sent to MT5 {mt5_id}")

    print(f"Completed hourly step. Distributed {success_count} personalized signals.")
    return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "weekly":
            run_weekly_update()
            shutdown_mt5()
        elif command == "hourly":
            run_hourly_step()
            shutdown_mt5()
        elif command == "auto":
            print("Starting automatic bot scheduler...")
            
            # Schedule weekly update on Sunday at midnight
            schedule.every().sunday.at("00:00").do(run_weekly_update)
            
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
            
            run_weekly_update()
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
            print("Unknown command. Use 'weekly', 'hourly', or 'auto'.")
            shutdown_mt5()
    else:
        # Default behavior: run hourly
        run_hourly_step()
        shutdown_mt5()
