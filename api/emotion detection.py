import json
import re
import numpy as np
from pathlib import Path
import pickle

from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, classification_report, f1_score

TRAIN_PATH = Path("train.txt")
VAL_PATH   = Path("val.txt")
TEST_PATH  = Path("test.txt")

_ws = re.compile(r"\s+")
def clean_text(s: str) -> str:
    return _ws.sub(" ", s.strip())

def load_json_array(path: Path):
    if not path.exists():
        print(f"Warning: {path} not found.")
        return [], []
    data = json.loads(path.read_text(encoding="utf-8"))
    X, y = [], []
    for row in data:
        sent = str(row.get("sentence", "")).strip()
        emo  = str(row.get("emotion", "")).strip()
        if sent and emo:
            X.append(clean_text(sent))
            y.append(emo)
    return X, y

def main():
    X_train, y_train = load_json_array(TRAIN_PATH)
    X_val,   y_val   = load_json_array(VAL_PATH)
    X_test,  y_test  = load_json_array(TEST_PATH)

    if not X_train:
        print("Error: No training data found. Make sure train.txt exists.")
        return

    X_train_all = X_train + X_val
    y_train_all = y_train + y_val

    # 1) Vectorize using TF-IDF
    tfidf = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2))
    E_train = tfidf.fit_transform(X_train_all)
    E_test  = tfidf.transform(X_test)

    # 2) Tune the classifier
    clf = LogisticRegression(max_iter=5000, class_weight="balanced")
    grid = GridSearchCV(
        clf,
        param_grid={"C": [0.5, 1.0, 2.0, 4.0]},
        scoring="f1_macro",
        cv=3,
        n_jobs=-1,
        verbose=1
    )

    grid.fit(E_train, y_train_all)
    best_clf = grid.best_estimator_

    print("\nBest params:", grid.best_params_)

    # Evaluate
    y_pred = best_clf.predict(E_test)
    if len(y_test) > 0:
        acc = accuracy_score(y_test, y_pred)
        print("\nTEST Accuracy:", round(acc * 100, 2), "%")
        print("\nClassification report:\n")
        print(classification_report(y_test, y_pred, digits=4))

    # Save
    with open("emotion_model.pkl", "wb") as f:
        pickle.dump({"clf": best_clf, "vectorizer": tfidf, "model_type": "tfidf_lr"}, f)
    print("\nSaved: emotion_model.pkl")

    # User input loop
    print("\nEnter a sentence to predict emotion (type 'exit' to quit):")
    while True:
        user_input = input("> ").strip()
        if user_input.lower() == "exit":
            break
        emb = tfidf.transform([clean_text(user_input)])
        pred = best_clf.predict(emb)[0]
        print("Predicted Emotion:", pred)

if __name__ == "__main__":
    main()
