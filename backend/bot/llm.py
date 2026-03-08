# input a 2 week ohlc as json -> 
# H1 img (48 candles) -> 
# pattern_embedding pred top 3 names -> 
# use name to get info knowledge (info) ->
# use llm to pred value in json from (info) ->
# output as json/dataframe

import io
import json
import textwrap
import ollama
import numpy as np
import pandas as pd
import mplfinance as mpf
import MetaTrader5 as mt5
from PIL import Image
from sentence_transformers import SentenceTransformer

visual_embed_model = SentenceTransformer('./tuned_embed_visual_model')

# step 1 receive ohlc.json return dataframe
def receive_ohlc(ohlc):
  return pd.read_json(ohlc)


# step 2 converet dataframe to temp image
def dataframe_to_image(df, img_path=None):
  # Ensure DataFrame has a DatetimeIndex for mplfinance
  if not isinstance(df.index, pd.DatetimeIndex):
    if "datetime" in df.columns:
      df = df.set_index("datetime")
    elif "time" in df.columns:
      df = df.set_index("time")

  mc = mpf.make_marketcolors(
    up="#26a69a", down="#ef5350", edge="inherit", wick="inherit"
  )
  s = mpf.make_mpf_style(
    marketcolors=mc,
    gridstyle="",
    figcolor="none",
    facecolor="none",
    rc={
      "axes.spines.bottom": False,
      "axes.spines.left": False,
      "axes.spines.right": False,
      "axes.spines.top": False,
      "xtick.bottom": False,
      "ytick.left": False,
    },
  )

  # If no path is given, we use a BytesIO buffer
  target = img_path if img_path else io.BytesIO()

  # Plot and save
  mpf.plot(
    df,
    type="candle",
    style=s,
    axisoff=True,
    volume=False,
    savefig=dict(
      fname=target,          # This will be either the path or the buffer
      format='png',          # Always specify PNG for the buffer
      transparent=True, 
      dpi=150, 
      pad_inches=0, 
      facecolor="none"
    ),
    closefig=True,
  )

  # Handle the return value
  if img_path:
    print(f"Image successfully saved to: {img_path}")
    return None
  else:
    target.seek(0)  # Reset buffer for reading
    return target


# step 3 predict the img and return top 3 pattern info
_pattern_names = None
_pattern_matrix = None
_knowledge_data = None


def load_pattern_embeddings(load_path="pattern_embeddings.npz"):
  data = np.load(load_path, allow_pickle=True)
  return data["names"], data["vectors"]


def load_knowledge(load_path="knowledge/info.json"):
  with open(load_path, "r", encoding="utf-8") as f:
    data = json.load(f)
  return {row.get("name"): row for row in data if "name" in row}


def _init_resources():
  global _pattern_names, _pattern_matrix, _knowledge_data
  if _pattern_matrix is None:
    _pattern_names, _pattern_matrix = load_pattern_embeddings()
  if _knowledge_data is None:
    _knowledge_data = load_knowledge()


def get_image_embedding(image_path):
  try:
    image = Image.open(image_path).convert("RGB")
    return visual_embed_model.encode([image], normalize_embeddings=True)[0]
  except Exception as e:
    print(f"Error embedding {image_path}: {e}")
  return None


def predict_pattern(img_path, top_n=3):
  _init_resources()
  query_vec = get_image_embedding(img_path)
  
  if query_vec is None or _pattern_matrix is None:
    return []
    
  similarities = np.dot(_pattern_matrix, query_vec)
  top_indices = np.argsort(similarities)[::-1][:top_n]
  
  return [
    {
      "pattern": _pattern_names[i],
      "confidence": round(float(similarities[i]) * 100, 2),
    }
    for i in top_indices
  ]


def get_knowledge(pattern_name):
  _init_resources()
  row = _knowledge_data.get(pattern_name)
  if row:
    print(f"  received: {pattern_name}")
    return row
  print(f"  {pattern_name} not found.")
  return None


def top3_pattern(img, top_n=3):
  classification_result = predict_pattern(img, top_n)
  
  for r in classification_result:
    print(f"  {r['pattern']}: {r['confidence']}%")

  knowledge_texts = []
  for k in classification_result:
    obj = get_knowledge(k["pattern"])
    if obj is None:
      continue
    
    # Use textwrap.dedent to avoid giant indentations in the prompt LLM receives
    # Use .get() to prevent KeyError if the info JSON is missing some keys
    text = textwrap.dedent(f"""\
      PATTERN DATA: {obj.get('name', 'Unknown')} (matched confidence: {k['confidence']}%)

      [CORE IDENTITY]
      Type: {obj.get('type', 'N/A')} | Bias: {obj.get('bias', 'N/A')}
      Consolidation: {obj.get('consolidation', 'N/A')} | Typically Breaks: {obj.get('typically_breaks', 'N/A')}
      Principal: {obj.get('principal', 'N/A')}

      [VISUAL IDENTIFICATION]
      Characteristics: {obj.get('characteristics', 'N/A')}
      Description: {obj.get('description', 'N/A')}
      Definition: {obj.get('definition_and_identification', 'N/A')}

      [MARKET PSYCHOLOGY]
      {obj.get('pattern_psychology', 'N/A')}

      [STATISTICS]
      Reliability: {obj.get('reliability', 'N/A')}
      Stats: {obj.get('reliability_stats', 'N/A')}

      [TRADING STRATEGY]
      Entry: {obj.get('entry', 'N/A')}
      Stop: {obj.get('stop', 'N/A')}
      Target: {obj.get('target', 'N/A')}
      Plan: {obj.get('trade_plan', 'N/A')}
      Invalidation: {obj.get('invalidation', 'N/A')}

      [NUANCE]
      Traps: {obj.get('nuances_and_common_traps', 'N/A')}
      Skip when: {obj.get('when_to_skip', 'N/A')}

      [SUMMARY]
      {obj.get('summary', 'N/A')}
    """)
    knowledge_texts.append(text)

  return "\\n".join(knowledge_texts)


# step 4 send top3 info to llm and return json
NEUTRAL_DEFAULTS = {
    "bias_score": 0.0,
    "confidence": 50.0,
    "volatility": 1,
    "trend_strength": 0.5,
    "momentum": 0.0,
    "skip_flag": 0,
    "reasoning": "Neutral market context - no clear pattern detected."
}


def validate_llm_output(data: dict) -> dict:
  return {
    "bias_score": max(-1.0, min(1.0, float(data.get("bias_score", 0.0)))),
    "confidence": max(0.0, min(100.0, float(data.get("confidence", 50.0)))),
    "volatility": (
      int(data.get("volatility", 1)) if data.get("volatility") in [0, 1, 2] else 1
    ),
    "trend_strength": max(0.0, min(1.0, float(data.get("trend_strength", 0.5)))),
    "momentum": max(-1.0, min(1.0, float(data.get("momentum", 0.0)))),
    "skip_flag": int(bool(data.get("skip_flag", 0))),
    "reasoning": str(data.get("reasoning", "No reasoning provided.")),
  }


def build_prompt(info: str) -> str:
  return f"""
  You are a quantitative technical analyst. You are given:
  1. A 2-day EURUSD candlestick chart (H1 candles, 48 candles total)
  2. Retrieved pattern knowledge from a RAG system

  Output a SINGLE valid JSON object — numeric features for a PPO trading agent.
  The agent trades EURUSD H1, holds up to 3 positions. Your output guides but does not control it.

  RETURN ONLY THIS JSON (no markdown, no explanation, no extra keys):
  {{
    "bias_score":     <float -1.0 to 1.0 | -1=strongly bearish, 0=neutral, 1=strongly bullish>,
    "confidence":     <float 0.0 to 100.0 | how clearly identifiable the pattern is>,
    "volatility":     <int 0=low 1=medium 2=high | based on candle body sizes and wick lengths>,
    "trend_strength": <float 0.0 to 1.0 | 0=choppy/ranging, 1=strong clean trend>,
    "momentum":       <float -1.0 to 1.0 | -1=strong selling pressure, 1=strong buying pressure>,
    "skip_flag":      <int 0=tradeable, 1=avoid this window>
    "reasoning":      <string | explain your reasoning in 1-2 sentences>
  }}

  RULES:
  - Choppy chart with no clear pattern → skip_flag=1, confidence<30, bias_score near 0
  - bias_score = pattern-based direction | momentum = raw candle pressure (can differ)
  - All values must be numbers only. No extra keys.

  RETRIEVED PATTERN KNOWLEDGE:
  {info}
"""


def pred_from_info(info):
  prompt = build_prompt(info)
  client = ollama.Client()

  for attempt in range(1, 6):
    try:
      response = client.chat(
        model="qwen2.5:0.5b",  # fastest local model
        messages=[{"role": "user", "content": prompt}],
      )

      raw = (
        response.message.content.strip()
        .replace("```json", "")
        .replace("```", "")
        .strip()
      )
      
      return validate_llm_output(json.loads(raw))
    except json.JSONDecodeError:
      print(f"  [WARN] Attempt {attempt}/5: JSON parse failed.")
    except Exception as e:
      print(f"  [WARN] Attempt {attempt}/5: LLM error - {e}")

  print(f"  [ERROR] Failed to get valid JSON from LLM after 5 attempts. Using neutral defaults.")
  return NEUTRAL_DEFAULTS.copy()


def add_llm_features(ohlc_df):
  """
  receive ohlc dataframe, return llm features as a dictionary.
  This allows for easy caching.
  """
  img = dataframe_to_image(ohlc_df)
  top3_info = top3_pattern(img)
  result_json = pred_from_info(top3_info)
  
  return result_json
