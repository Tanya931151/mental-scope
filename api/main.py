from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import pickle
import re
import os
from typing import Optional, Dict, Any, List
from chatbot_engine import respond, ChatState, asdict
import json
import random
import shap

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "emotion_model.pkl")
HABIT_MODEL_PATH = os.path.join(BASE_DIR, "mood_score_model.pkl")

app = FastAPI(title="MentalScope AI API")
api_router = APIRouter(prefix="/api")

@app.get("/")
async def root():
    return {"message": "MentalScope AI API is Running", "docs": "/docs", "health": "/api/health"}

# ... (Global models and load_models remain the same)

# Global models
clf = None
vectorizer = None
habit_model = None

@app.on_event("startup")
def load_models():
    global clf, vectorizer, habit_model
    # Emotion Model
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                data = pickle.load(f)
                clf = data["clf"]
                vectorizer = data["vectorizer"]
            print(f"Emotion model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading emotion model: {e}")
    else:
        print(f"Warning: Model file {MODEL_PATH} not found.")

    # Habit Model
    if os.path.exists(HABIT_MODEL_PATH):
        try:
            habit_model = joblib.load(HABIT_MODEL_PATH)
            print(f"Habit model loaded successfully from {HABIT_MODEL_PATH}")
        except Exception as e:
            print(f"Error loading habit model: {e}")
    else:
        print(f"Warning: Habit model file {HABIT_MODEL_PATH} not found.")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_ws = re.compile(r"\s+")
def clean_text(s: str) -> str:
    return _ws.sub(" ", s.strip())

# --- Emotion Detection Schemas ---
class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    emotion: str
    confidence: float = 1.0
    secondary_emotion: Optional[str] = None

class DatasetSample(BaseModel):
    sentence: str
    emotion: str

class DatasetSamplesResponse(BaseModel):
    train: List[DatasetSample]
    val: List[DatasetSample]
    test: List[DatasetSample]

# --- Keyword Heuristics ---
KEYWORD_OVERRIDE = {
    "love": "Love / Affection",
    "loved": "Love / Affection",
    "affection": "Love / Affection",
    "happy": "Joy",
    "joy": "Joy",
    "joyful": "Joy",
    "sad": "Sadness",
    "unhappy": "Sadness",
    "miserable": "Sadness",
    "angry": "Anger",
    "furious": "Anger",
    "annoyed": "Anger",
    "anxious": "Fear / Anxiety",
    "anxiety": "Fear / Anxiety",
    "scared": "Fear / Anxiety",
    "fear": "Fear / Anxiety",
    "stressed": "Stress / Overwhelm",
    "stress": "Stress / Overwhelm",
    "overwhelmed": "Stress / Overwhelm",
    "shock": "Surprise / Shock",
    "shocked": "Surprise / Shock",
    "shocking": "Surprise / Shock",
    "surprised": "Surprise / Shock",
    "proud": "Pride / Confidence",
    "confident": "Pride / Confidence",
    "hopeful": "Hope / Optimism",
    "optimistic": "Hope / Optimism",
    "disgusted": "Disgust",
    "ashamed": "Shame / Guilt",
    "guilt": "Shame / Guilt",
    "guilty": "Shame / Guilt"
}

def get_keyword_emotion(text: str) -> Optional[str]:
    t = text.lower().strip().replace("!", "").replace(".", "").replace("?", "")
    return KEYWORD_OVERRIDE.get(t)

# --- Habit Prediction Schemas ---
class HabitRequest(BaseModel):
    sleep_hours: float
    workout_min: float
    journaling: bool
    reading_min: float
    screen_time: float

class HabitResponse(BaseModel):
    mood_score: float
    mood_range: str
    message: str
    tips: List[str]

class ShapFeature(BaseModel):
    name: str
    impact: float
    fill: str

class ShapResponse(BaseModel):
    features: List[ShapFeature]

# --- Helpers ---
def clamp(value: float, min_v: float, max_v: float) -> float:
    return max(min_v, min(value, max_v))

def apply_domain_penalty(score, sleep_hours, workout_min, journaling, reading_min, screen_time):
    penalty = 0.0
    if sleep_hours <= 5.0: penalty += 1.5
    if workout_min == 0: penalty += 0.8
    if reading_min == 0: penalty += 0.4
    if not journaling: penalty += 0.3
    if screen_time >= 8.0: penalty += 1.5
    return clamp(score - penalty, 0.0, 10.0)

def get_mood_feedback(score: float):
    if score < 4.0:
        return ("0.00–3.99 (Low)", "Your mood seems low today. Focus on rest and basic self-care.", 
                ["Try 5–10 minutes of light movement", "Reduce screen time before sleeping", "Aim for consistent sleep", "Write 2-3 lines about feelings"])
    elif score < 8.0:
        return ("4.00–7.99 (Moderate)", "You’re doing okay — small habit tweaks can make you feel better.",
                ["Add 10–20 min of activity", "Read or journal for 5–10 min", "Avoid screens 30 min before bed", "Keep sleep schedule consistent"])
    else:
        return ("8.00–10.00 (High)", "You’re in a great mental space today. Keep maintaining these habits!",
                ["Maintain routine and sleep schedule", "Keep workouts consistent", "Balance work and rest", "Keep screen time in check"])

@api_router.post("/habit-prediction", response_model=HabitResponse)
async def predict_habit(request: HabitRequest):
    if habit_model is None:
        return HabitResponse(mood_score=5.0, mood_range="Moderate", message="Model loading...", tips=[])

    # Internal clamping rules (from habit message.py)
    sleep = clamp(request.sleep_hours, 4.7, 9.4)
    workout = clamp(request.workout_min, 0, 60)
    reading = clamp(request.reading_min, 0, 60)
    screen = clamp(request.screen_time, 3, 8.1)
    journaling = 1 if request.journaling else 0

    # Predict
    features = ["Sleep_Hours", "Workout_Duration_Min", "Journaling (Y/N)", "Reading_Min", "Screen_Time_Hours"]
    X = pd.DataFrame([[sleep, workout, journaling, reading, screen]], columns=features)
    pred = float(habit_model.predict(X)[0])
    
    mood_score = clamp(pred, 0.0, 10.0)
    mood_score = apply_domain_penalty(mood_score, sleep, workout, request.journaling, reading, screen)
    mood_score = round(mood_score, 2)
    
    mood_range, message, tips = get_mood_feedback(mood_score)
    
    return HabitResponse(mood_score=mood_score, mood_range=mood_range, message=message, tips=tips)

@api_router.post("/shap", response_model=ShapResponse)
async def explain_habit(request: HabitRequest):
    if habit_model is None:
        return ShapResponse(features=[])

    # Internal clamping rules (from habit message.py)
    sleep = clamp(request.sleep_hours, 4.7, 9.4)
    workout = clamp(request.workout_min, 0, 60)
    reading = clamp(request.reading_min, 0, 60)
    screen = clamp(request.screen_time, 3, 8.1)
    journaling = 1 if request.journaling else 0

    features = ["Sleep_Hours", "Workout_Duration_Min", "Journaling (Y/N)", "Reading_Min", "Screen_Time_Hours"]
    X = pd.DataFrame([[sleep, workout, journaling, reading, screen]], columns=features)

    # Extract pipeline steps
    scaler = habit_model.named_steps["scaler"]
    rf_model = habit_model.named_steps["model"]

    # Scale input
    X_scaled = scaler.transform(X)

    # Calculate SHAP local explanation
    explainer = shap.TreeExplainer(rf_model)
    shap_vals = explainer.shap_values(X_scaled)[0]

    # Map to UI names and colors
    ui_mapping = {
        "Sleep_Hours": {"name": "Sleep Deprivation", "fill": "#ef4444"},        # Rose
        "Workout_Duration_Min": {"name": "Low Physical Act.", "fill": "#06b6d4"}, # Cyan
        "Journaling (Y/N)": {"name": "Social Isolation", "fill": "#8b5cf6"},      # Purple
        "Reading_Min": {"name": "Academic/Workload", "fill": "#f59e0b"},          # Amber
        "Screen_Time_Hours": {"name": "High Screen Time", "fill": "#64748b"}      # Slate
    }

    shap_features = []
    # We take absolute value to show magnitude of impact, and multiply to scale linearly for the UI
    for i, feature in enumerate(features):
        impact = float(abs(shap_vals[i])) * 15.0 
        shap_features.append(ShapFeature(
            name=ui_mapping[feature]["name"],
            impact=impact,
            fill=ui_mapping[feature]["fill"]
        ))

    # Sort by impact descending
    shap_features.sort(key=lambda x: x.impact, reverse=True)
    return ShapResponse(features=shap_features)

@api_router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    if clf is None or vectorizer is None:
        return PredictResponse(emotion="Neutral", confidence=0.0)
    
    raw_text = request.text.strip()
    cleaned = clean_text(raw_text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Empty text")

    # Layer 1: Keyword Override
    override = get_keyword_emotion(cleaned)
    if override:
        return PredictResponse(emotion=override, confidence=1.0)
    
    # Layer 2: ML Model with Confidence Handling
    emb = vectorizer.transform([cleaned])
    
    # Get probabilities for all classes
    probs = clf.predict_proba(emb)[0]
    classes = clf.classes_
    
    # Sort by probability descending
    top_indices = probs.argsort()[::-1]
    
    best_idx = top_indices[0]
    best_emotion = classes[best_idx]
    best_conf = float(probs[best_idx])
    
    secondary_emotion = None
    if len(top_indices) > 1:
        secondary_emotion = str(classes[top_indices[1]])

    # Optimization: If best is "Neutral" but confidence is low (< 0.4) 
    # and secondary is significantly present, maybe prefer secondary?
    # Or just don't default to Neutral if it's a weak prediction.
    if best_emotion == "Neutral" and best_conf < 0.35 and secondary_emotion:
        # If Neutral is barely winning over a specific emotion, use the specific one
        return PredictResponse(
            emotion=secondary_emotion, 
            confidence=float(probs[top_indices[1]]),
            secondary_emotion=best_emotion
        )

    # Fallback to Neutral only if confidence is EXTREMELY low (< 0.15)
    if best_conf < 0.15:
        return PredictResponse(emotion="Neutral", confidence=best_conf, secondary_emotion=best_emotion)

    return PredictResponse(
        emotion=best_emotion, 
        confidence=best_conf, 
        secondary_emotion=secondary_emotion
    )

@api_router.get("/datasets/samples", response_model=DatasetSamplesResponse)
async def get_dataset_samples():
    def load_samples(filename, count=5):
        # Go up one level from backend_fastapi to the root, then into api folder
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        api_dir = os.path.abspath(os.path.join(backend_dir, "..", "api"))
        path = os.path.join(api_dir, filename)
        
        if not os.path.exists(path):
            print(f"Path does not exist: {path}")
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return random.sample(data, min(len(data), count))
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            return []

    return DatasetSamplesResponse(
        train=load_samples("train.txt"),
        val=load_samples("val.txt"),
        test=load_samples("test.txt")
    )

# --- Chatbot Schemas ---
class ChatRequest(BaseModel):
    message: str
    state: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    state: Dict[str, Any]
    options: Optional[List[Dict[str, Any]]] = []

@api_router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # Initialize state if none provided
    current_state = request.state or asdict(ChatState())
    
    reply, new_state, options = respond(request.message, current_state)
    
    return ChatResponse(reply=reply, state=new_state, options=options)

@api_router.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
