import numpy as np
import pandas as pd
from stable_baselines3 import PPO

def load_model(model_path):
    """
    Load the trained PPO model.
    """
    try:
        model = PPO.load(model_path)
        print(f"Successfully loaded PPO model from: {model_path}")
        return model
    except Exception as e:
        print(f"Error loading PPO model: {e}")
        return None

def predict_action(model, features_df, window_size=60):
    """
    Predict an action given the last 'window_size' bars of features.
    """
    if model is None:
        return 0, 0.0

    # Ensure we have enough data for the window
    if len(features_df) < window_size:
        print(f"Not enough data for prediction (have {len(features_df)}, need {window_size})")
        return 0, 0.0

    # Extract the window (e.g. 60, 17)
    window_features = features_df.iloc[-window_size:].values
    
    # SB3 needs (window_size, num_features)
    action, _states = model.predict(window_features, deterministic=True)
    
    # SB3 predict returns either a scalar or an array depending on environment/input
    # Using np.asarray(action).flatten() handles any nesting or scalar types
    action = int(np.asarray(action).flatten()[0])

    return action, 1.0  # Returning 1.0 confidence as a placeholder



  