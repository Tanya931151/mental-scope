import joblib
import os

model_path = os.path.join(os.path.dirname(__file__), "mood_score_model.pkl")

try:
    model = joblib.load(model_path)
    print("Model loaded successfully.")
    print(f"Model type: {type(model)}")
    print(f"Model classes/features if available:")
    if hasattr(model, 'feature_names_in_'):
        print(f"Features: {model.feature_names_in_}")
    
    # Try to import shap
    import shap
    print("SHAP is installed.")
except Exception as e:
    print(f"Error: {e}")
