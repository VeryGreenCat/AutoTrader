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
    "bias_score": 0.5,
    "confidence": 0.0,
    "volatility": 0.5,
    "trend_strength": 0.0,
    "momentum": 0.5,
    "skip_flag": 1.0,
    "reasoning": "Neutral market context - no clear pattern detected."
}


def validate_llm_output(data: dict) -> dict:
    required_keys = [
        "bias_score",
        "confidence",
        "volatility",
        "trend_strength",
        "momentum",
        "skip_flag",
        "reasoning"
    ]
    validated = {}
    for key in required_keys:
        val = data.get(key)
        if key == "reasoning":
            validated[key] = str(val) if val is not None else "No reasoning provided."
            continue
            
        if val is None:
            raise ValueError(f"Missing required field: {key}")
        try:
            val = float(val)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid value for {key}: must be numeric, got {val}")
        if not (0.0 <= val <= 1.0):
            raise ValueError(
                f"Value for {key} out of range: {val}, must be between 0.0 and 1.0"
            )
        validated[key] = val
    return validated



def build_prompt(info: str) -> str:
    return f"""You are a quantitative technical analyst. 
    You are given: A top 3 retrieved pattern knowledge from a RAG system

Output a SINGLE valid JSON object — numeric features as a guideline for a PPO trading agent.
The agent trades EURUSD H1, holds up to 1 positions. Your output guides but does not control it.


SCORING RULES:
    1. If the patterns provide conflicting directions, 'confidence' must be below 0.4.
    2. 'bias_score' should stay near 0.5 (neutral) unless all 3 patterns show strong directional alignment. however, take the matched confidence into account.
    3. 'skip_flag' should be high (0.7+) if volatility is extreme or pattern confidence is too low (< 0.35).
    4.  All values must be numbers only. No extra keys.


RETURN ONLY THIS JSON (no markdown, no explanation, no extra keys):
{{
    "bias_score":     <float 0.0 to 1.0 | 0=strongly bearish, 0.5=neutral, 1=strongly bullish>,
    "confidence":     <float 0.0 to 1.0 | how confidence are you for an agent to trust this json output. BE CONSERVATIVE. 0.9 is nearly impossible in FX>,
    "volatility":     <float 0.0 to 1.0 | 0=low, 0.5=medium, 1=high | based on top 3 pattern matches and their properties>,
    "trend_strength": <float 0.0 to 1.0 | based on matched confidence, if top match has >70% confidence, then 0.7-1.0, if top match is weak pattern or confidence is 50-80% then 0.5-0.8, otherwise 0-0.5>,
    "momentum":       <float 0.0 to 1.0 | 0=strong selling pressure, 1=strong buying pressure>,
    "skip_flag":      <float 0.0 to 1.0 | 0=tradeable, 0.5=fine 1=avoid this window>
    "reasoning":      <string | explain your reasoning in 1-2 sentences>
}}

RETRIEVED PATTERN KNOWLEDGE (use this as a reference for your analysis, do not repeat verbatim, synthesize and extract insights):
{info}
"""



def pred_from_info(info):
  prompt = build_prompt(info)
  client = ollama.Client()

  for attempt in range(1, 11):
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
      print(f"  [WARN] Attempt {attempt}/10: JSON parse failed.")
    except Exception as e:
      print(f"  [WARN] Attempt {attempt}/10: LLM error - {e}")

  print(f"  [ERROR] Failed to get valid JSON from LLM after 10 attempts. Using neutral defaults.")
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
