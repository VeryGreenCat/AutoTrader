import pandas as pd
import numpy as np
import pandas_ta as ta


def run_feature_pipeline(df):
    # Ensure any trailing spaces in headers are stripped
    df.columns = df.columns.str.strip()

    # If 'datetime' exists (from mt5_connector), ensure it's the index
    if "datetime" in df.columns:
        if not isinstance(df.index, pd.DatetimeIndex):
            df["datetime"] = pd.to_datetime(df["datetime"])
            df = df.set_index("datetime")
    elif "Time (EET)" in df.columns: # Support for CSV fallback if needed
        df = df.set_index("Time (EET)")
    
    df.sort_index(inplace=True)

    # Ensure numeric for indicators
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # ---- Technicals ----
    # RSI and ATR (already scale-invariant-ish)
    df["rsi_14"] = ta.rsi(df["Close"], length=14)
    df["atr_14"] = ta.atr(df["High"], df["Low"], df["Close"], length=14)

    # Moving averages
    df["ma_20"] = ta.sma(df["Close"], length=20)
    df["ma_50"] = ta.sma(df["Close"], length=50)

    # Slopes of the MAs
    df["ma_20_slope"] = df["ma_20"].diff()
    df["ma_50_slope"] = df["ma_50"].diff()

    # Distance of price from each MA (relative level)
    df["close_ma20_diff"] = df["Close"] - df["ma_20"]
    df["close_ma50_diff"] = df["Close"] - df["ma_50"]

    # MA divergence: MA20 vs MA50
    df["ma_spread"] = df["ma_20"] - df["ma_50"]
    df["ma_spread_slope"] = df["ma_spread"].diff()

    # Drop initial NaNs from indicators
    df.dropna(inplace=True)

    # Columns the AGENT should see (no raw price levels / raw MAs)
    feature_cols = [
        "rsi_14",
        "atr_14",
        "ma_20_slope",
        "ma_50_slope",
        "close_ma20_diff",
        "close_ma50_diff",
        "ma_spread",
        "ma_spread_slope",
        "bias_score",
        "confidence",
        "volatility",
        "trend_strength",
        "momentum",
        "skip_flag",
    ]

    return df, feature_cols