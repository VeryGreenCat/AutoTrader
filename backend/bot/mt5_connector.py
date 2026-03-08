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

def shutdown_mt5():
    """
    Shutdown MT5 connection.
    """
    mt5.shutdown()
