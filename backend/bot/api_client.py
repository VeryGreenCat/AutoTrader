import os
import httpx
from dotenv import load_dotenv

load_dotenv() # Load env vars from .env

GO_BACKEND_URL = os.getenv("GO_BACKEND_URL", "http://localhost:5000") # Match your Go port
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET")

# Common headers for all internal requests
API_HEADERS = {
    "X-Internal-Secret": INTERNAL_API_SECRET,
    "Content-Type": "application/json"
}

def post_llm_analysis(symbol, data):
    """
    Send LLM analysis results to the Go backend.
    The Go backend is responsible for saving this to the LLM_trans table in Supabase.
    """
    endpoint = f"{GO_BACKEND_URL}/api/llmTrans/postLLMTrans"
    
    # Mapping the LLM features to the Go model structure
    payload = {
        "currency": symbol,
        "logic": data.get("reasoning"),
        "bias_score": float(data.get("bias_score", 0.0)),
        "confidence": float(data.get("confidence", 0.0)),
        "volatility": float(data.get("volatility", 0.0)),
        "trend_strength": float(data.get("trend_strength", 0.0)),
        "momentum": float(data.get("momentum", 0.0)),
        "skip_flag": float(data.get("skip_flag", 0.0))
    }
    
    print(f"Piping LLM analysis for {symbol} to Go API...")
    try:
        response = httpx.post(endpoint, json=payload, headers=API_HEADERS, timeout=15.0)
        if response.status_code == 200 or response.status_code == 201:
            print("Go backend successfully saved LLM context.")
            return True
        else:
            print(f"Go API error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Failed to connect to Go backend: {e}")
        return False

def get_latest_market_context(symbol):
    """
    Fetch the latest LLM context from the Go backend.
    The Go backend will query the Supabase LLM_trans table.
    """
    # Adjust this endpoint to match your Go router
    endpoint = f"{GO_BACKEND_URL}/api/llmTrans/getLLMTrans?currency={symbol}"
    
    print(f"Fetching market context for {symbol} from Go API...")
    try:
        response = httpx.get(endpoint, headers=API_HEADERS, timeout=10.0)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            print(f"No existing context found for {symbol} in DB.")
            return None
        else:
            print(f"Go API error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Failed to fetch context from Go: {e}")
        return None

def send_trade_signal(symbol, version, action_str):
    """
    Send the PPO prediction to Go.
    Go will then distribute it to all online MT5 accounts.
    action_str: "BUY" | "SELL" | "HOLD"
    """
    endpoint = f"{GO_BACKEND_URL}/api/trade/signal"
    
    payload = {
        "currency": symbol,
        "version": version,
        "action": action_str
    }
    
    print(f"Piping Signal ({action_str}) to Go API...")
    try:
        response = httpx.post(endpoint, json=payload, headers=API_HEADERS, timeout=10.0)
        if response.status_code == 200:
            print("Signal successfully delivered to Go backend.")
            return True
        else:
            print(f"Go API Signal error: {response.status_code}")
            return False
    except Exception as e:
        print(f"Failed to send signal to Go: {e}")
        return False
