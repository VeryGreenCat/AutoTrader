import MetaTrader5 as mt5
import pandas as pd
import numpy as np
from datetime import datetime

def initialize_mt5():
    """
    Initialize connection to MT5.
    """
    if not mt5.initialize():
        print("MT5 initialization failed. Error:", mt5.last_error())
        return False
    return True

def get_ohlc_data(symbol, timeframe, n_bars):
    """
    Fetch n_bars of OHLC data for a given symbol and timeframe.
    Timeframe should be one of mt5.TIMEFRAME_H1, etc.
    """
    if not initialize_mt5():
        return None

    # Fetch bars
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, n_bars)
    
    if rates is None or len(rates) == 0:
        print(f"Failed to fetch data for {symbol}. Error:", mt5.last_error())
        return None

    # Convert to DataFrame
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    
    # Rename columns to match what feature_eng expects
    # MetaTrader5 returns: time, open, high, low, close, tick_volume, spread, real_volume
    df = df.rename(columns={
        'time': 'datetime',
        'open': 'Open',
        'high': 'High',
        'low': 'Low',
        'close': 'Close',
        'tick_volume': 'Volume'
    })
    
    # Select only relevant columns
    df = df[['datetime', 'Open', 'High', 'Low', 'Close', 'Volume']]
    
    return df

def get_mt5_state_features(symbol):
    """
    Fetch real-time state features from MT5 for the given symbol.
    Returns [pos, t_norm, unreal_scaled]
    """
    if not initialize_mt5():
        return 0.0, 0.0, 0.0

    positions = mt5.positions_get(symbol=symbol)
    if positions is None or len(positions) == 0:
        return 0.0, 0.0, 0.0

    # Assume one position for simplicity (matching RL model)
    pos = positions[0]
    
    # 1. Position type
    # mt5.POSITION_TYPE_BUY = 0, mt5.POSITION_TYPE_SELL = 1
    pos_type = 1.0 if pos.type == mt5.POSITION_TYPE_BUY else -1.0
    
    # 2. Time in trade (normalized by 1000)
    # Get bars since open. Assuming current timeframe is H1 (3600 seconds)
    open_time = pos.time
    import time
    current_time = int(time.time())
    seconds_elapsed = max(0, current_time - open_time)
    bars_elapsed = seconds_elapsed / 3600.0 
    t_norm = bars_elapsed / 1000.0
    
    # 3. Unrealized PnL in pips (scaled by 100)
    current_price = pos.price_current
    open_price = pos.price_open
    
    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        return pos_type, t_norm, 0.0
    
    # Calculate pips correctly based on digits (0.0001 for 5-digit, 0.01 for 3-digit)
    point = symbol_info.point
    pip_value = point * 10 if symbol_info.digits in [3, 5] else point
    
    if pos.type == mt5.POSITION_TYPE_BUY:
        pips = (current_price - open_price) / pip_value
    else:
        pips = (open_price - current_price) / pip_value
        
    unreal_scaled = pips / 100.0
    
    return pos_type, t_norm, unreal_scaled

def shutdown_mt5():
    """
    Shutdown MT5 connection.
    """
    mt5.shutdown()
