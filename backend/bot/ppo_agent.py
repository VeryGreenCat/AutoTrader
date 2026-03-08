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

def predict_action(model, features_df):
    """
    Predict an action given the engineered features.
    
    Returns:
        action: The predicted action (e.g., 0=Hold, 1=Buy, 2=Sell)
        confidence: A placeholder for confidence (SB3 PPO doesn't provide it directly without extra steps)
    """
    if model is None:
        return 0, 0.0

    # Ensure we only use the last row for the latest prediction
    latest_features = features_df.iloc[-1:].values
    
    action, _states = model.predict(latest_features, deterministic=True)
    
    # SB3 PPO returns an array/scalar depending on the number of envs. 
    # Usually it's a numpy array with one element if flattened.
    if isinstance(action, (np.ndarray, list)):
        action = int(action[0])
    else:
        action = int(action)

    return action, 1.0  # Returning 1.0 confidence as a placeholder

# model = PPO.load("ppo.zip")


if __name__ == "__main__":
    model = load_model("ppo.zip")
    print(model.observation_space)   # tells you shape and bounds
    print(model.action_space)        # tells you output format
    print(model.policy)              # full policy architecture