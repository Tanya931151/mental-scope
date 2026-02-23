import json
import joblib
import random
import re
from dataclasses import dataclass
from typing import Optional, Tuple, List
from difflib import SequenceMatcher

# ================= CONFIG =================
INTENTS_PATH = "intents chatbot nd4.json"
MODEL_PATH = "intent_model_best_final.joblib"
SHOW_DEBUG = False
TOPK = 3
MIN_CONF = 0.30
# ========================================

# ================= LOAD =================
with open(INTENTS_PATH, "r", encoding="utf-8") as f:
    intents_json = json.load(f)

RESPONSES = {i["tag"]: i.get("responses", []) for i in intents_json.get("intents", [])}

bundle = joblib.load(MODEL_PATH)
model = bundle["pipeline"]
MERGE_MAP = bundle.get("merge_map", {})
CONF_THRESHOLD = float(bundle.get("confidence_threshold", MIN_CONF))
FACT_TAG = bundle.get("fact_tag", "fact")
CLASSES: List[str] = model.classes_.tolist()

print("✅ Pandora loaded successfully")

# ================= STATE =================
@dataclass
class State:
    topic: Optional[str] = None           # loneliness / grief / distress / love / general
    expecting: Optional[str] = None       # help_menu / talk_mode / coping_followup / coping_menu / info_menu / distress_info_nextsteps
    emotion: Optional[str] = None

    last_user: Optional[str] = None
    last_bot: Optional[str] = None

    # Talk mode
    talk_topic: Optional[str] = None
    talk_stage: int = 0
    talk_last_question: Optional[str] = None

    # Coping mode
    last_coping_tip: Optional[str] = None

state = State()

# ================= TEXT HELPERS =================
def norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())

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

# ================= LEXICONS =================
YES = {"yes", "yeah", "yup", "ok", "okay", "sure", "haan", "y"}
NO = {"no", "nope", "nah"}

SELF_HARM_PHRASES = {"kill myself", "suicide", "want to die", "end it all", "hurt myself", "cut myself"}

GRIEF_PHRASES = {"died", "passed away", "death", "funeral", "lost my", "rip"}
PET_WORDS = {"cat", "dog", "pet", "puppy", "kitten", "hamster", "parrot"}

LONELY_PHRASES = {
    "no one talks to me", "nobody talks to me", "no one cares", "nobody cares",
    "i feel alone", "i am alone", "i'm alone", "lonely", "i feel lonely",
    "left out", "excluded", "not included", "no one calls me",
    "no one loves me", "nobody loves me", "left me", "my best friend left me", "best friend left me"
}
FRIEND_EXCLUDE_CUES = {"included", "exclude", "ignored", "left out", "ghost", "stopped talking", "distant"}

NEG_WORDS = {"sad", "depressed", "anxious", "overwhelmed", "stressed", "stress", "empty", "emptiness", "numb", "lost"}

COPING_WORDS = {"coping", "cope", "tips", "technique", "techniques", "help"}
CALM_WORDS = {"calm", "calming", "breath", "breathe", "breathing", "ground", "grounding"}
WORK_WORDS = {"deadline", "deadlines", "work", "workload", "tasks", "project", "manager", "office", "assignment", "submit", "submission"}

TALK_PHRASES = {"talk", "talking", "share", "vent", "tell you", "talk about it"}
INFO_WORDS = {"information", "info", "explain", "meaning"}

LOVE_WORDS = {
    "in love", "i am in love", "i'm in love",
    "love", "crush", "liking", "like someone",
    "butterflies", "romantic", "relationship", "dating"
}

def is_yes(s: str) -> bool:
    s = low(s)
    return s in YES or any(p in s for p in YES)

def is_no(s: str) -> bool:
    s = low(s)
    return s in NO or any(p in s for p in NO)

# ================= TOPIC DETECTION =================
def detect_topic_from_text(text: str) -> str:
    t = low(text)

    if contains_any_phrase(t, SELF_HARM_PHRASES):
        return "crisis"

    if contains_any_phrase(t, GRIEF_PHRASES) and any(w in t for w in PET_WORDS):
        return "grief"

    if ("alone" in t) or ("lonely" in t) or contains_any_phrase(t, LONELY_PHRASES) or any(w in t for w in FRIEND_EXCLUDE_CUES):
        return "loneliness"

    if contains_any_phrase(t, LOVE_WORDS) or ("crush" in t) or ("in love" in t):
        return "love"

    # Distress/work + typo-tolerant "overwhelmed"
    if any(w in t for w in WORK_WORDS):
        return "distress"
    if "overwhelmed" in t or fuzzy_word_in_text(t, "overwhelmed", 0.76):
        return "distress"
    if any(w in t for w in NEG_WORDS):
        return "distress"

    return "general"

# ================= MENUS =================
def show_help_menu() -> str:
    state.expecting = "help_menu"
    return "What would help most right now — **talk**, **coping tips**, or **information**?"

def handle_help_menu(user_text: str) -> str:
    s = low(user_text)

    if "talk" in s:
        topic = state.topic or detect_topic_from_text(user_text)
        return start_talk_mode(topic if topic != "crisis" else "general")

    if "coping" in s or "tips" in s or any(w in s for w in COPING_WORDS):
        topic = state.topic or detect_topic_from_text(user_text)
        return start_coping_tip(topic)

    if "info" in s or "information" in s or any(w in s for w in INFO_WORDS):
        topic = state.topic or detect_topic_from_text(user_text)
        return start_info_menu(topic)

    return show_help_menu()

def start_info_menu(topic: str) -> str:
    state.expecting = "info_menu"
    state.topic = topic
    return (
        "What kind of info do you want?\n"
        "1) **Why I might feel this way**\n"
        "2) **What to do next**\n"
        "3) **Signs it’s getting serious**\n"
        "4) **Back**"
    )

def handle_info_menu(user_text: str) -> str:
    s = low(user_text)

    if s in {"4", "back"}:
        return show_help_menu()

    topic = state.topic or "general"

    # ---- WHY ----
    if s == "1" or "why" in s:
        if topic == "love":
            return (
                "Being in love can feel intense because your brain is in **reward + attachment** mode.\n"
                "It can be exciting, calming, or anxious depending on uncertainty.\n\n"
                "Does it feel more **exciting**, **calm**, or **anxious/uncertain**?"
            )
        if topic == "loneliness":
            return (
                "Loneliness often spikes after rejection/being left out. Your brain reads it like a threat to belonging.\n"
                "It doesn’t mean you’re unlovable — it means you need safety + connection right now.\n\n"
                "Want to tell me what happened in 1–2 lines?"
            )
        if topic == "grief":
            return (
                "Grief comes in waves (sadness, numbness, anger, guilt). That’s normal after a real loss.\n"
                "What time of day hits you the hardest?"
            )
        if topic == "distress":
            return (
                "Overwhelm happens when **demand > time/energy** and your brain treats everything as urgent.\n"
                "Missing deadlines can add shame/anxiety, which makes focus worse.\n\n"
                "Is your biggest issue **tasks**, **people**, or **pressure/expectations**?"
            )
        return "These feelings can come from unmet needs (rest, support, belonging). What’s been happening lately?"

    # ---- NEXT STEPS ----
    if s == "2" or "next" in s or "do" in s:
        if topic == "distress":
            # ✅ IMPORTANT: switch state so reply 'pressure' works
            state.expecting = "distress_info_nextsteps"
            return (
                "Next steps:\n"
                "• Pick the **top 1 task** for today\n"
                "• Break it into **15-minute steps**\n"
                "• Ask for help or renegotiate timelines if needed.\n"
                "Which part is hardest: **tasks**, **people**, or **pressure**?"
            )

        if topic == "loneliness":
            return (
                "Next steps:\n"
                "• Reach out to **one safe person**\n"
                "• Spend time in **one place you feel seen**\n"
                "• Don’t chase everyone — focus on **one real connection**.\n\n"
                "Do you want a message you can send (soft or direct)?"
            )

        if topic == "love":
            return (
                "Next steps (healthy love):\n"
                "• Go slow: build **trust + consistency**\n"
                "• Communicate clearly (don’t mind-read)\n"
                "• Keep your routine/self-respect intact.\n\n"
                "Want help drafting a message (flirty/soft/direct)?"
            )

        if topic == "grief":
            return (
                "Next steps:\n"
                "• Tiny routine (water/food/sleep)\n"
                "• Talk to someone safe\n"
                "• Allow the waves — don’t judge them.\n\n"
                "Do you want **talk** or **coping tips**?"
            )

        return "Tell me what you want to change first — feelings, situation, or both?"

    # ---- SIGNS ----
    if s == "3" or "sign" in s or "serious" in s:
        if topic == "love":
            return (
                "If love becomes obsession, constant anxiety, losing sleep, or ignoring boundaries—slow down.\n"
                "Healthy love feels mostly **safe**, **respectful**, and **consistent**.\n\n"
                "Do you feel safe with them?"
            )
        return (
            "If sleep/appetite crash, you isolate completely, panic daily, or you have self-harm thoughts — get extra support.\n"
            "If you’re in immediate danger, contact local emergency services or a trusted person.\n\n"
            "Do you want **talk** or **coping tips**?"
        )

    return "Reply 1/2/3/4 (or type ‘back’)."

# ✅ handles the “tasks/people/pressure” follow-up inside info -> 2 (distress)
def handle_distress_info_nextsteps(user_text: str) -> str:
    s = low(user_text)

    if "task" in s:
        state.expecting = "help_menu"
        return (
            "Okay—**tasks**.\n"
            "Try this:\n"
            "1) List everything due\n"
            "2) Pick **Top 1** (closest deadline/impact)\n"
            "3) Do a **15-minute first step**\n\n"
            "Want **talk**, **coping tips**, or more **information**?"
        )

    if "people" in s:
        state.expecting = "help_menu"
        return (
            "Okay—**people**.\n"
            "Send a short unblock message:\n"
            "“Hey, I’m stuck on X. Can you confirm Y by (time) so I can finish Z?”\n\n"
            "Want **talk**, **coping tips**, or more **information**?"
        )

    if "pressure" in s or "expect" in s:
        state.expecting = "help_menu"
        return (
            "Okay—**pressure**.\n"
            "Quick reducer:\n"
            "• Define the *minimum acceptable output* for today\n"
            "• Timebox: **25 min focus + 5 min break** (2 rounds)\n"
            "• If needed: “I can deliver A today, B tomorrow.”\n\n"
            "Want **talk**, **coping tips**, or more **information**?"
        )

    return "Just reply **tasks**, **people**, or **pressure**."

# ================= COPING MENU =================
def start_coping_menu() -> str:
    state.expecting = "coping_menu"
    return (
        "Pick one:\n"
        "1) **Breathing**\n"
        "2) **Grounding**\n"
        "3) **Practical next steps**\n"
        "4) **Back**"
    )

def handle_coping_menu(user_text: str) -> str:
    s = low(user_text)

    if s in {"4", "back"}:
        return show_help_menu()

    if s == "1" or "breath" in s:
        state.expecting = "coping_menu"
        return (
            "Breathing (30 sec):\n"
            "• Inhale 4\n• Hold 2\n• Exhale 6\n"
            "Repeat 3 times.\n\n"
            "Want **grounding**, **practical next steps**, or **back**?"
        )

    if s == "2" or "ground" in s:
        state.expecting = "coping_menu"
        return (
            "Grounding (5-4-3-2-1):\n"
            "5 things you can **see**\n"
            "4 things you can **feel**\n"
            "3 things you can **hear**\n"
            "2 things you can **smell**\n"
            "1 thing you can **taste**\n\n"
            "Want **breathing**, **practical next steps**, or **back**?"
        )

    if s == "3" or "practical" in s or "next" in s:
        state.expecting = "coping_menu"
        return (
            "Practical reset:\n"
            "1) Write top 3 things stressing you\n"
            "2) Circle the **one** you can act on today\n"
            "3) Do a 10-minute first step\n\n"
            "Want **breathing**, **grounding**, or **back**?"
        )

    return "Reply 1/2/3/4 (or type ‘back’)."

# ================= TALK MODE =================
def start_talk_mode(topic: str) -> str:
    state.expecting = "talk_mode"
    state.talk_topic = topic
    state.talk_stage = 0
    state.talk_last_question = None
    return talk_mode_reply("")

def talk_mode_reply(user_text: str) -> str:
    s = low(user_text)

    # allow switching inside talk mode
    if "coping" in s or "tips" in s or any(w in s for w in COPING_WORDS):
        topic = state.talk_topic or state.topic or detect_topic_from_text(user_text)
        state.topic = topic
        return start_coping_tip(topic)

    if "info" in s or "information" in s or any(w in s for w in INFO_WORDS):
        topic = state.talk_topic or state.topic or detect_topic_from_text(user_text)
        state.topic = topic
        return start_info_menu(topic)

    # --- Loneliness flow ---
    if state.talk_last_question == "lonely_where" and s:
        state.talk_last_question = "lonely_what"
        return "Got it. What’s been happening—**no one reaches out**, **you’re left out**, or **disconnected even around people**?"

    if state.talk_last_question == "lonely_what" and s:
        state.talk_last_question = "lonely_next"
        return "That hurts. What would help most right now—**being heard**, **advice**, **coping tips**, or **information**?"

    # --- Distress/work flow ---
    if state.talk_last_question == "distress_open" and s:
        state.talk_last_question = "distress_bucket"
        return "Got it. Is the main issue **tasks**, **people**, or **pressure/expectations**?"

    if state.talk_last_question == "distress_bucket":
        if "task" in s:
            state.talk_last_question = "distress_tasks"
            return "Okay—tasks. What’s worse: **too many tasks**, **unclear priority**, or **not enough time**?"
        if "people" in s:
            state.talk_last_question = "distress_people"
            return "Okay—people. Is it more **unsupported**, **conflict**, or **fear of judgment**?"
        if "pressure" in s or "expect" in s:
            state.talk_last_question = "distress_pressure"
            return "Okay—pressure. Is it pressure from **yourself**, from **others**, or from **deadlines**?"
        return "Just reply: **tasks**, **people**, or **pressure**."

    if state.talk_last_question == "distress_tasks":
        state.talk_last_question = "distress_nextstep"
        return "Thanks. What’s the **closest deadline** (today/this week/later)?"

    if state.talk_last_question == "distress_people":
        state.talk_last_question = "distress_nextstep"
        return "Got it. What’s one example of what they did/said that hurt or blocked you?"

    if state.talk_last_question == "distress_pressure":
        state.talk_last_question = "distress_nextstep"
        return "Okay. When pressure hits, do you go into **freeze**, **panic**, or **perfectionism**?"

    if state.talk_last_question == "distress_nextstep" and s:
        state.talk_last_question = "distress_offer"
        return "I’m here. Do you want me to help you **plan the next 30 minutes**, or do you want **coping tips** first?"

    # --- Love flow ---
    if state.talk_last_question == "love_open" and s:
        state.talk_last_question = "love_feel"
        return "Aww ❤️ Is it feeling more **exciting**, **calm/safe**, or **anxious/uncertain**?"

    if state.talk_last_question == "love_feel" and s:
        state.talk_last_question = "love_next"
        return "Do you want to **talk** more, get **information**, or **coping tips** if it feels anxious?"

    # --- Grief simple ---
    if state.talk_last_question == "grief_open" and s:
        state.talk_last_question = "grief_follow"
        return "I’m really sorry. Has it been **recent**, or building for a while?"

    if state.talk_last_question == "grief_follow" and s:
        state.talk_last_question = "grief_next"
        return "What time of day hits the hardest—**mornings**, **nights**, or **reminders**?"

    # stage 0 opener
    if state.talk_stage == 0:
        state.talk_stage = 1
        if state.talk_topic == "loneliness":
            state.talk_last_question = "lonely_where"
            return "I’m here. When do you feel alone the most—**at home**, **in college/work**, or **online**?"
        if state.talk_topic == "distress":
            state.talk_last_question = "distress_open"
            return "I’m listening. What’s been weighing on you the most?"
        if state.talk_topic == "love":
            state.talk_last_question = "love_open"
            return "Aww okay ❤️ Tell me—what happened that made you realize you’re in love?"
        if state.talk_topic == "grief":
            state.talk_last_question = "grief_open"
            return "I’m here. What happened, and what’s been the hardest part for you?"
        return "I’m listening. What’s been weighing on you the most?"

    return "I’m with you. Tell me a bit more."

# ================= COPING (YES/NO START) =================
def start_coping_tip(topic: Optional[str]) -> str:
    state.expecting = "coping_followup"
    state.topic = topic or state.topic or "general"
    tip = "Reset: inhale 4, hold 2, exhale 6 — three times. Can you try that now?"
    state.last_coping_tip = tip
    return tip

def handle_coping_followup(user_text: str) -> str:
    if is_yes(user_text):
        return start_coping_menu()
    if is_no(user_text):
        return "That’s okay. Type **breathing**, **grounding**, or **back**."
    return "Just reply **yes** or **no** — did you manage to try it?"

# ================= INTERRUPTS =================
def interrupt_checks(user_text: str) -> Optional[str]:
    s = low(user_text)
    if contains_any_phrase(s, SELF_HARM_PHRASES):
        state.expecting = None
        state.topic = "crisis"
        state.emotion = "crisis"
        return "I’m really sorry you’re feeling this way. Are you in immediate danger right now?"
    return None

# ================= MAIN RESPONDER =================
def respond(user_text: str) -> str:
    text = norm(user_text)
    s = low(text)

    inter = interrupt_checks(text)
    if inter is not None:
        return safe_return(inter)

    # handle active states FIRST
    if state.expecting == "help_menu":
        return safe_return(handle_help_menu(text))
    if state.expecting == "coping_followup":
        return safe_return(handle_coping_followup(text))
    if state.expecting == "coping_menu":
        return safe_return(handle_coping_menu(text))
    if state.expecting == "info_menu":
        return safe_return(handle_info_menu(text))
    if state.expecting == "distress_info_nextsteps":
        return safe_return(handle_distress_info_nextsteps(text))
    if state.expecting == "talk_mode":
        return safe_return(talk_mode_reply(text))

    # detect topic
    topic = detect_topic_from_text(text)
    state.topic = topic

    # route emotional topics to help menu
    if topic in {"loneliness", "grief", "distress", "love"}:
        state.expecting = "help_menu"
        if topic == "love":
            return "Aww okay ❤️ What would help most right now — **talk**, **coping tips**, or **information**?"
        if topic == "loneliness":
            return "I hear your pain. You’re not alone. What would help most right now — **talk**, **coping tips**, or **information**?"
        if topic == "grief":
            return "I’m really sorry for your loss. What would help most right now — **talk**, **coping tips**, or **information**?"
        return "I’m really sorry you’re feeling this way. What would help most right now — **talk**, **coping tips**, or **information**?"

    # model fallback
    tag, conf, topk = predict_intent(text)
    if SHOW_DEBUG:
        print("[debug] topk:", topk, "chosen:", tag, conf, "topic:", state.topic)

    if conf < CONF_THRESHOLD:
        return show_help_menu()

    return pick_response(tag, "I’m here with you. Tell me a bit more.")

# ================= CHAT LOOP =================
print("\nMental Scope: Hi there! I'm Mental Scope. How are you feeling today?")
print("(Type 'quit' to exit)\n")

while True:
    user_input = input("You: ").strip()

    if low(user_input) in {"quit", "exit"}:
        print("\nMental Scope: Take care. I’m here if you need me 💙\n")
        break

    if not user_input:
        if state.expecting in {"help_menu", "coping_menu", "info_menu"}:
            print("\nMental Scope: Just pick an option (or type 'talk', 'grounding', 'back').\n")
        else:
            print("\nMental Scope: Say something and I’ll try to help 🙂\n")
        continue

    bot_reply = respond(user_input)

    state.last_user = user_input
    state.last_bot = bot_reply

    print(f"\nMental Scope: {bot_reply}\n")
