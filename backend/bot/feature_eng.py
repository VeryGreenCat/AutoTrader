import pandas as pd
import numpy as np
import pandas_ta as ta

# ── PRICE ACTION ─────────────────────────────────────────────────────────────
def add_price_features(df):
    df = df.copy()

    # 3 log returns: 1h / 6h / 24h
    df["log_return_1"] = np.log(df["Close"] / df["Close"].shift(1))
    df["log_return_6"] = np.log(df["Close"] / df["Close"].shift(6))
    df["log_return_24"] = np.log(df["Close"] / df["Close"].shift(24))

    candle_range = (df["High"] - df["Low"]).replace(0, np.nan)

    # body ratio: +1=full bull, -1=full bear, 0=doji
    df["body_ratio"] = (df["Close"] - df["Open"]) / candle_range

    # wick ratios [0, 1]
    df["upper_wick"] = (df["High"] - df[["Open", "Close"]].max(axis=1)) / candle_range
    df["lower_wick"] = (df[["Open", "Close"]].min(axis=1) - df["Low"]) / candle_range

    # gap from previous close
    df["gap"] = (df["Open"] - df["Close"].shift(1)) / df["Close"].shift(1)

    return df

# ── TREND ─────────────────────────────────────────────────────────────────────
def ema(series, span):
    return series.ewm(span=span, adjust=False).mean()


def add_trend_features(df):
    df = df.copy()

    for span in [8, 21, 50, 200]:
        df[f"ema_{span}"] = ema(df["Close"], span)

    # only slow EMA slope — fast slopes already captured in log returns
    e50 = df["ema_50"]
    df["ema_50_slope"] = (e50 - e50.shift(3)) / e50.shift(3)

    # crossover signals (-1, 0, +1)
    df["cross_8_21"] = np.sign(df["ema_8"] - df["ema_21"])
    df["cross_21_50"] = np.sign(df["ema_21"] - df["ema_50"])

    # full trend alignment: -1 fully bearish → +1 fully bullish
    cross_50_200 = np.sign(df["ema_50"] - df["ema_200"])
    df["trend_alignment"] = (df["cross_8_21"] + df["cross_21_50"] + cross_50_200) / 3.0

    return df

# ── MOMENTUM ──────────────────────────────────────────────────────────────────
def rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / period, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / period, adjust=False).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def add_momentum_features(df):
    df = df.copy()

    # RSI normalised [-1, 1]
    df["rsi_14"] = (rsi(df["Close"], 14) - 50) / 50

    # MACD histogram only (line - signal = net momentum), normalised by price
    macd_line = ema(df["Close"], 12) - ema(df["Close"], 26)
    macd_signal = ema(macd_line, 9)
    df["macd_hist"] = (macd_line - macd_signal) / df["Close"]

    # single ROC at 12-bar (half-day)
    df["roc_12"] = df["Close"].pct_change(12)

    # stochastic %K [-1, 1]
    low_14 = df["Low"].rolling(14).min()
    high_14 = df["High"].rolling(14).max()
    stoch_k = (df["Close"] - low_14) / (high_14 - low_14).replace(0, np.nan)
    df["stoch_k"] = (stoch_k - 0.5) * 2

    return df

# ── VOLATILITY ────────────────────────────────────────────────────────────────
def atr(df, period=14):
    tr = pd.concat(
        [
            df["High"] - df["Low"],
            (df["High"] - df["Close"].shift(1)).abs(),
            (df["Low"] - df["Close"].shift(1)).abs(),
        ],
        axis=1,
    ).max(axis=1)
    return tr.ewm(alpha=1 / period, adjust=False).mean()


def add_volatility_features(df):
    df = df.copy()

    df["atr_14"] = atr(df, 14)
    df["atr_6"] = atr(df, 6)

    df["atr_pct"] = df["atr_14"] / df["Close"]  # dimensionless vol
    df["atr_ratio"] = df["atr_6"] / df["atr_14"]  # >1 = expanding

    bb_mid = df["Close"].rolling(20).mean()
    bb_std = df["Close"].rolling(20).std()
    df["bb_width"] = (2 * bb_std) / bb_mid
    df["bb_pos"] = (df["Close"] - bb_mid) / (2 * bb_std + 1e-9)

    log_ret = np.log(df["Close"] / df["Close"].shift(1))
    df["realised_vol_24"] = log_ret.rolling(24).std()

    df["vol_regime"] = np.sign(df["atr_14"] - df["atr_14"].rolling(50).mean())

    return df

# ── VOLUME ────────────────────────────────────────────────────────────────────
def add_volume_features(df):
    df = df.copy()

    # vol vs 20-bar average (OBV dropped — unreliable on forex tick volume)
    vol_ma = df["Volume"].rolling(20).mean().replace(0, np.nan)
    df["vol_ratio"] = df["Volume"] / vol_ma

    return df

# ── MARKET STRUCTURE ──────────────────────────────────────────────────────────
def add_structure_features(df):
    df = df.copy()
    atr14 = atr(df, 14)

    # swing detection (internal use only, not added as columns)
    swing_high_mask = df["High"] == df["High"].rolling(10, center=True).max()
    swing_low_mask = df["Low"] == df["Low"].rolling(10, center=True).min()

    last_sh = df["High"].where(swing_high_mask).ffill()
    last_sl = df["Low"].where(swing_low_mask).ffill()

    # distance to swing H/L in ATR units (natural SL/TP reference)
    df["dist_to_swing_high"] = (last_sh - df["Close"]) / atr14
    df["dist_to_swing_low"] = (df["Close"] - last_sl) / atr14

    # where is price in its 48-bar range [-1, 1]
    roll_high = df["High"].rolling(48).max()
    roll_low = df["Low"].rolling(48).min()
    roll_range = (roll_high - roll_low).replace(0, np.nan)
    df["price_in_range"] = ((df["Close"] - roll_low) / roll_range - 0.5) * 2

    # distance from EMA 8/21/50 in ATR units (ema_200 dropped — too slow for H1)
    for span in [8, 21, 50]:
        df[f"dist_ema_{span}"] = (df["Close"] - df[f"ema_{span}"]) / atr14

    return df

# ── SESSION ───────────────────────────────────────────────────────────────────
def add_session_features(df):
    df = df.copy()
    hour = df["datetime"].dt.hour
    dow = df["datetime"].dt.dayofweek

    # cyclic encoding — no arbitrary ordinal breaks
    df["hour_sin"] = np.sin(2 * np.pi * hour / 24)
    df["hour_cos"] = np.cos(2 * np.pi * hour / 24)
    df["dow_sin"] = np.sin(2 * np.pi * dow / 5)
    df["dow_cos"] = np.cos(2 * np.pi * dow / 5)

    # only London/NY overlap flag (highest-vol, most predictable session)
    df["session_overlap"] = ((hour >= 12) & (hour < 16)).astype(int)

    return df

# ── LLM FEATURES ─────────────────────────────────────────────────────────────
def add_llm_features(df):
    df = df.copy()

    df["llm_bias_score"] = df["bias_score"]  # [-1, 1]
    df["llm_confidence"] = df["confidence"] / 100.0  # [0, 1]
    df["llm_volatility"] = df["volatility"] / 2.0  # [0, 1]
    df["llm_trend_strength"] = df["trend_strength"]  # [0, 1]
    df["llm_momentum"] = df["momentum"]  # [-1, 1]
    df["llm_skip_flag"] = df["skip_flag"].astype(float)  # 0/1

    df = df.drop(
        columns=[
            "bias_score",
            "confidence",
            "volatility",
            "trend_strength",
            "momentum",
            "skip_flag",
        ]
    )
    return df
# above func is not used in currnet pipeline
# ── PIPELINE ──────────────────────────────────────────────────────────────────
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
    # print("Adding price features...")
    # df = add_price_features(df)

    # print("Adding trend features...")
    # df = add_trend_features(df)

    # print("Adding momentum features...")
    # df = add_momentum_features(df)

    # print("Adding volatility features...")
    # df = add_volatility_features(df)

    # print("Adding volume features...")
    # df = add_volume_features(df)

    # print("Adding market structure features...")
    # df = add_structure_features(df)

    # print("Adding session features...")
    # df = add_session_features(df)

    # print("Normalising LLM features...")
    # df = add_llm_features(df)

    # # drop helper columns not needed in observation space
    # df = df.drop(columns=["ema_8", "ema_21", "ema_50", "ema_200", "atr_14", "atr_6"])

    # # drop warmup rows (ema_200 needs 200 bars to stabilise)
    # df = df.iloc[200:].reset_index(drop=True)

    # df = df.replace([np.inf, -np.inf], np.nan)
    # df = df.ffill().fillna(0)

    # print(f"\nDone! Shape: {df.shape}")
    # return df    
