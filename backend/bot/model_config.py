"""
Centralized model configuration registry.

Each ModelConfig represents one trading model (symbol + version + model file).
Add new entries to MODEL_REGISTRY to run multiple models in parallel.
"""

from dataclasses import dataclass, field
from typing import List
import MetaTrader5 as mt5


@dataclass
class ModelConfig:
    """All parameters needed to run a single model in the pipeline."""

    # ── Identity ─────────────────────────────────────────────────────
    name: str                          # Human-readable name, e.g. "PPO RL Agent"
    version: str                       # Bot version tag, e.g. "v1"
    description: str                   # Shown when registering with the Go backend

    # ── Market ───────────────────────────────────────────────────────
    symbol: str                        # MT5 symbol, e.g. "EURUSD"
    timeframe: int = mt5.TIMEFRAME_H1  # MT5 timeframe constant
    pip_size: float = 0.0001           # Pip value for this symbol (0.0001 for most FX, 0.01 for JPY pairs)

    # ── Data windows ─────────────────────────────────────────────────
    weekly_bars: int = 60              # Bars fetched for 12-hourly LLM analysis
    hourly_bars: int = 300             # Bars fetched for feature engineering warm-up
    observation_window: int = 120      # PPO lookback window (must match training)

    # ── Model file ───────────────────────────────────────────────────
    model_path: str = ""               # Path to the .zip model file

    # ── Action space (must match training env) ───────────────────────
    sl_options: List[int] = field(default_factory=lambda: [30, 50, 80])
    tp_options: List[int] = field(default_factory=lambda: [60, 100, 160])

    # ── Scheduling ───────────────────────────────────────────────────
    llm_interval_hours: int = 12       # How often to refresh LLM analysis
    trade_interval: str = ":00"        # Cron-style minute offset for hourly step

    def build_action_map(self) -> list:
        """Reconstruct the full action map from SL/TP options."""
        action_map = [
            ("HOLD", None, None, None),
            ("CLOSE", None, None, None),
        ]
        for direction in [0, 1]:  # 0=short, 1=long
            for sl in self.sl_options:
                for tp in self.tp_options:
                    action_map.append(("OPEN", direction, float(sl), float(tp)))
        return action_map


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MODEL REGISTRY  –  Add new models here
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODEL_REGISTRY: List[ModelConfig] = [
    ModelConfig(
        name="PPO RL Agent v5",
        version="v5",
        description="PPO Reinforcement Learning model with technical features and LLM bias context.",
        symbol="EURUSD",
        timeframe=mt5.TIMEFRAME_H1,
        pip_size=0.0001,
        weekly_bars=60,
        hourly_bars=300,
        observation_window=120,
        model_path="models/model_eurusd_best_5.zip",
        sl_options=[30, 50, 80],
        tp_options=[60, 100, 160],
    ),
    ModelConfig(
        name="PPO RL Agent v6",
        version="v6",
        description="PPO Reinforcement Learning model with technical features and LLM bias context.",
        symbol="EURUSD",
        timeframe=mt5.TIMEFRAME_H1,
        pip_size=0.0001,
        weekly_bars=60,
        hourly_bars=300,
        observation_window=120,
        model_path="models/model_eurusd_best_6.zip",
        sl_options=[30, 50, 80],
        tp_options=[60, 100, 160],
    ),
]


def get_config(symbol: str, version: str) -> ModelConfig | None:
    """Look up a specific model config by symbol + version."""
    for cfg in MODEL_REGISTRY:
        if cfg.symbol == symbol and cfg.version == version:
            return cfg
    return None
