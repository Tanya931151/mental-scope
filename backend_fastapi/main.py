from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import re
import os
from typing import Optional, Dict, Any, List
from chatbot_engine import respond, ChatState, asdict

app = FastAPI(title="MentalScope AI API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model for emotion detection
MODEL_PATH = "emotion_model.pkl"
clf = None
vectorizer = None

@app.on_event("startup")
def load_models():
    global clf, vectorizer
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                data = pickle.load(f)
                clf = data["clf"]
                vectorizer = data["vectorizer"]
            print(f"Models loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading emotion model: {e}")
    else:
        print(f"Warning: Model file {MODEL_PATH} not found.")

_ws = re.compile(r"\s+")
def clean_text(s: str) -> str:
    return _ws.sub(" ", s.strip())

# --- Emotion Detection Schemas ---
class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    emotion: str

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    if clf is None or vectorizer is None:
        return PredictResponse(emotion="Neutral")
    
    cleaned = clean_text(request.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Empty text")
    
    emb = vectorizer.transform([cleaned])
    prediction = clf.predict(emb)[0]
    return PredictResponse(emotion=prediction)

# --- Chatbot Schemas ---
class ChatRequest(BaseModel):
    message: str
    state: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    state: Dict[str, Any]
    options: Optional[List[Dict[str, Any]]] = []

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # Initialize state if none provided
    current_state = request.state or asdict(ChatState())
    
    reply, new_state, options = respond(request.message, current_state)
    
    return ChatResponse(reply=reply, state=new_state, options=options)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
