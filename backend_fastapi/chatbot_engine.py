import json
import joblib
import random
import re
from dataclasses import dataclass, asdict
from typing import Optional, Tuple, List
from difflib import SequenceMatcher
import os
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

load_dotenv()

# ================= CONFIG =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
INTENTS_PATH = os.path.join(DATA_DIR, "intents chatbot nd4.json")
MODEL_PATH = os.path.join(DATA_DIR, "intent_model_best_final.joblib")
FLOW_PATH = os.path.join(DATA_DIR, "chat_flow.json")
SHOW_DEBUG = False
TOPK = 3
MIN_CONF = 0.30
RE_WS = re.compile(r"\s+")
RE_NON_WORD = re.compile(r'[^\w\s]')

# ================= LOAD =================
with open(INTENTS_PATH, "r", encoding="utf-8") as f:
    intents_json = json.load(f)

RESPONSES = {i["tag"]: i.get("responses", []) for i in intents_json.get("intents", [])}

with open(FLOW_PATH, "r", encoding="utf-8") as f:
    CHAT_FLOW = json.load(f)

bundle = joblib.load(MODEL_PATH)
model = bundle["pipeline"]
MERGE_MAP = bundle.get("merge_map", {})
CONF_THRESHOLD = float(bundle.get("confidence_threshold", MIN_CONF))
FACT_TAG = bundle.get("fact_tag", "fact")
CLASSES: List[str] = model.classes_.tolist()

# ================= GEMINI SETUP =================
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY and GEMINI_KEY != "your_api_key_here":
    genai.configure(api_key=GEMINI_KEY)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    gemini_model = None

# ================= STATE =================
@dataclass
class ChatState:
    topic: Optional[str] = None           # loneliness / grief / distress / love / general
    expecting: Optional[str] = "start"    # Maps to a node in chat_flow.json
    emotion: Optional[str] = None
    last_user: Optional[str] = None
    last_bot: Optional[str] = None
    talk_topic: Optional[str] = None
    talk_stage: int = 0
    talk_last_question: Optional[str] = None
    last_coping_tip: Optional[str] = None

# ================= TEXT HELPERS =================
def norm(text: str) -> str:
    if not text: return ""
    return RE_WS.sub(" ", text.strip())

def low(text: str) -> str:
    return norm(text).lower()

def tokens(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z']+", low(text))

def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

def fuzzy_word_in_text(text: str, target: str, thresh: float = 0.78) -> bool:
    for tok in tokens(text):
        if similarity(tok, target) >= thresh:
            return True
    return False

def contains_any_phrase(text: str, phrases) -> bool:
    t = low(text)
    return any(p in t for p in phrases)

def safe_return(msg: Optional[str]) -> str:
    if not msg or not msg.strip():
        return "I’m here with you. What would help most right now — **talk**, **coping tips**, or **information**?"
    return msg

# ================= MODEL HELPERS =================
def normalize_tag(tag: str) -> str:
    if re.fullmatch(r"fact-\d+", tag or ""):
        return FACT_TAG
    return MERGE_MAP.get(tag, tag)

def predict_topk(text: str, k: int = TOPK) -> List[Tuple[str, float]]:
    probs = model.predict_proba([text])[0]
    idxs = probs.argsort()[::-1][:k]
    return [(normalize_tag(CLASSES[int(i)]), float(probs[int(i)])) for i in idxs]

def predict_intent(text: str) -> Tuple[str, float, List[Tuple[str, float]]]:
    topk = predict_topk(text, TOPK)
    best_tag, best_conf = topk[0]
    return best_tag, best_conf, topk

def pick_response(tag: str, default: str) -> str:
    if tag in RESPONSES and RESPONSES[tag]:
        return random.choice(RESPONSES[tag])
    if "fallback" in RESPONSES and RESPONSES["fallback"]:
        return random.choice(RESPONSES["fallback"])
    return default

def is_crisis(text: str) -> bool:
    t = low(text)
    return any(word in t for word in SELF_HARM_PHRASES)

def gemini_fallback(user_text: str) -> str:
    if not gemini_model:
        return "I'm having a little trouble connecting to my creative side right now, but I'm here for you. 💙"
    
    prompt = f"""
You are Pandora AI inside the Mental Scope app.
You are supportive, calm, friendly, empathetic and safe.
If the user asks about mental health, respond gently and terapeutically.
If user asks general knowledge or other questions, answer clearly while maintaining your supportive persona.
Never encourage self-harm.

User: {user_text}
"""
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "I'm here for you. Tell me more about what's on your mind."

# ================= LEXICONS =================
YES = {"yes", "yeah", "yup", "ok", "okay", "sure", "haan", "y"}
NO = {"no", "nope", "nah"}
SELF_HARM_PHRASES = {"kill myself", "suicide", "want to die", "end it all", "hurt myself", "cut myself"}
GRIEF_PHRASES = {"died", "passed away", "death", "funeral", "lost my", "rip"}
PET_WORDS = {"cat", "dog", "pet", "puppy", "kitten", "hamster", "parrot"}
LONELY_PHRASES = {"no one talks to me", "nobody talks to me", "no one cares", "nobody cares", "i feel alone", "lonely", "i feel lonely"}
NEG_WORDS = {"sad", "depressed", "anxious", "overwhelmed", "stressed", "stress", "lost"}
COPING_WORDS = {"coping", "cope", "tips", "technique", "help"}
INFO_WORDS = {"information", "info", "explain", "meaning"}
LOVE_WORDS = {"in love", "love", "crush", "romantic", "relationship"}

def is_yes(s: str) -> bool:
    s = low(s)
    return s in YES or any(p in s for p in YES)

def is_no(s: str) -> bool:
    s = low(s)
    return s in NO or any(p in s for p in NO)

def detect_topic_from_text(text: str) -> str:
    t = low(text)
    if contains_any_phrase(t, SELF_HARM_PHRASES): return "crisis"
    if contains_any_phrase(t, GRIEF_PHRASES) and any(w in t for w in PET_WORDS): return "grief"
    if ("alone" in t) or ("lonely" in t) or contains_any_phrase(t, LONELY_PHRASES): return "loneliness"
    if contains_any_phrase(t, LOVE_WORDS): return "love"
    if any(w in t for w in NEG_WORDS): return "distress"
    return "general"

# ================= HANDLERS (Stateless) =================

def show_help_menu(state: ChatState) -> str:
    state.expecting = "help_menu"
    return "What would help most right now — **talk**, **coping tips**, or **information**?"

def handle_help_menu(user_text: str, state: ChatState) -> str:
    s = low(user_text)
    if "talk" in s:
        topic = state.topic or detect_topic_from_text(user_text)
        return start_talk_mode(topic if topic != "crisis" else "general", state)
    if "coping" in s or "tips" in s or any(w in s for w in COPING_WORDS):
        topic = state.topic or detect_topic_from_text(user_text)
        return start_coping_tip(topic, state)
    if "info" in s or "information" in s or any(w in s for w in INFO_WORDS):
        topic = state.topic or detect_topic_from_text(user_text)
        return start_info_menu(topic, state)
    return show_help_menu(state)

def start_info_menu(topic: str, state: ChatState) -> str:
    state.expecting = "info_menu"
    state.topic = topic
    return "What kind of info do you want?\n1) **Why I might feel this way**\n2) **What to do next**\n3) **Signs it’s getting serious**\n4) **Back**"

def handle_info_menu(user_text: str, state: ChatState) -> str:
    s = low(user_text)
    if s in {"4", "back"}: return show_help_menu(state)
    topic = state.topic or "general"
    if s == "1" or "why" in s:
        if topic == "love": return "Being in love can feel intense because your brain is in **reward + attachment** mode. Does it feel more **exciting**, **calm**, or **anxious**?"
        if topic == "loneliness": return "Loneliness often spikes after rejection. Your brain reads it like a threat to belonging. Want to tell me what happened?"
        return "These feelings can come from unmet needs (rest, support, belonging). What’s been happening lately?"
    if s == "2" or "next" in s:
        if topic == "distress":
            state.expecting = "distress_info_nextsteps"
            return "Next steps:\n• Pick top 1 task\n• Break it down\nWhich part is hardest: **tasks**, **people**, or **pressure**?"
        return "Tell me what you want to change first — feelings, situation, or both?"
    return "Reply 1/2/3/4."

def start_talk_mode(topic: str, state: ChatState) -> str:
    state.expecting = "talk_mode"
    state.talk_topic = topic
    state.talk_stage = 0
    state.talk_last_question = None
    return talk_mode_reply("", state)

def talk_mode_reply(user_text: str, state: ChatState) -> str:
    s = low(user_text)
    if state.talk_stage == 0:
        state.talk_stage = 1
        if state.talk_topic == "loneliness":
            state.talk_last_question = "lonely_where"
            return "I’m here. When do you feel alone the most—**at home**, **at work**, or **online**?"
        return "I’m listening. What’s been weighing on you the most?"
    return "I’m with you. Tell me a bit more."

def start_coping_tip(topic: Optional[str], state: ChatState) -> str:
    state.expecting = "coping_followup"
    state.topic = topic or state.topic or "general"
    tip = "Reset: inhale 4, hold 2, exhale 6 — three times. Can you try that now?"
    state.last_coping_tip = tip
    return tip

def handle_coping_followup(user_text: str, state: ChatState) -> str:
    if is_yes(user_text):
        state.expecting = "coping_menu"
        return "Pick one:\n1) **Breathing**\n2) **Grounding**\n3) **Back**"
    return "That’s okay. I'm here if you need anything else."

def respond(user_text: str, state_dict: dict) -> Tuple[str, dict, List[dict]]:
    state = ChatState(**state_dict)
    text = norm(user_text)
    s = low(text)

    # --- 0. Start Session ---
    if s == "__start__":
        node = CHAT_FLOW.get("start", CHAT_FLOW[list(CHAT_FLOW.keys())[0]])
        state.expecting = "start"
        return node["message"], asdict(state), node.get("options", [])

    # --- 1. Decision Tree Matching (Highest Priority if expecting) ---
    current_node_id = state.expecting or "start"
    if current_node_id in CHAT_FLOW:
        node = CHAT_FLOW[current_node_id]
        options = node.get("options", [])
        
        # Clean text for comparison (remove emojis/extra space)
        clean_s = RE_NON_WORD.sub('', s).strip()
        
        for opt in options:
            clean_label = RE_NON_WORD.sub('', low(opt["label"])).strip()
            
            # Match if exact clean match (ignoring emojis)
            if clean_label == clean_s:
                # Transition to next node
                next_node_id = opt["next"]
                state.expecting = next_node_id
                next_node = CHAT_FLOW.get(next_node_id)
                state.expecting = next_node_id
                next_node = CHAT_FLOW.get(next_node_id)
                
                if not next_node:
                    next_node = CHAT_FLOW["start"]
                    state.expecting = "start"

                # If the next node has a tag, use a response from the dataset
                tag = next_node.get("tag")
                if tag and tag in RESPONSES:
                    reply = pick_response(tag, next_node["message"])
                else:
                    reply = next_node["message"]

                return reply, asdict(state), next_node.get("options", [])

    # --- 2. Crisis Override ---
    if is_crisis(text):
        state.expecting = "start"
        state.topic = "crisis"
        return (
            "I'm really sorry you're feeling this way. 💛\n"
            "Please don’t hurt yourself. You matter.\n\n"
            "📞 If you are in India, call: 9152987821 (AASRA)\n"
            "Or dial 112 immediately.\n\n"
            "I'm here for you. Are you in a safe place right now?"
        ), asdict(state), CHAT_FLOW["start"]["options"]

    # --- 3. Intent Model / Dataset ---
    tag, conf, _ = predict_intent(text)
    if conf >= CONF_THRESHOLD:
        reply = pick_response(tag, "I'm here for you.")
        # If we successfully recognized a topic, maybe reset to start options or stay in flow
        state.expecting = "start"
        return reply, asdict(state), CHAT_FLOW["start"]["options"]

    # --- 4. Gemini Fallback ---
    reply = gemini_fallback(text)
    state.expecting = "start"
    return reply, asdict(state), CHAT_FLOW["start"]["options"]
