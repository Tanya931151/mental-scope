import joblib
import os

model_path = os.path.join(os.path.dirname(__file__), "mood_score_model.pkl")

try:
    model = joblib.load(model_path)
    print("Pipeline steps:")
    for name, step in model.steps:
        print(f"- {name}: {type(step)}")
        
except Exception as e:
    print(f"Error: {e}")
