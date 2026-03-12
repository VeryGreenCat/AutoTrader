import numpy as np
import pandas as pd
import torch
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

def predict_action(model, features_df, window_size=120):
    """
    Predict an action given the last 'window_size' bars of features.
    Returns: (action_int, action_probs_dict)
      action_probs_dict maps action index -> probability, e.g. {0: 0.85, 1: 0.10, 2: 0.05}
    """
    if model is None:
        return 0, {0: 1.0, 1: 0.0, 2: 0.0}

    # Ensure we have enough data for the window
    if len(features_df) < window_size:
        print(f"Not enough data for prediction (have {len(features_df)}, need {window_size})")
        return 0, {0: 1.0, 1: 0.0, 2: 0.0}

    # Extract the window (e.g. 60, 17)
    window_features = features_df.iloc[-window_size:].values
    
    # SB3 needs (window_size, num_features)
    action, _states = model.predict(window_features, deterministic=True)
    
    # SB3 predict returns either a scalar or an array depending on environment/input
    action = int(np.asarray(action).flatten()[0])

    # --- Extract raw action probabilities from the policy ---
    action_probs = {}
    try:
        obs_tensor = torch.as_tensor(window_features, dtype=torch.float32).unsqueeze(0)
        with torch.no_grad():
            dist = model.policy.get_distribution(obs_tensor)
            probs = dist.distribution.probs.cpu().numpy().flatten()
            action_probs = {i: float(p) for i, p in enumerate(probs)}
    except Exception as e:
        print(f"  [WARN] Could not extract action probabilities: {e}")
        action_probs = {action: 1.0}

    return action, action_probs



  