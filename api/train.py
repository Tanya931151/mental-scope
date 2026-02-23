import json
import re
import joblib
from collections import Counter

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score


# ---------------- CONFIG ----------------
DATA_PATH = "intents chatbot nd4.json"
MODEL_OUT = "intent_model_best_final.joblib"

MIN_SAMPLES_PER_INTENT = 3
CONF_THRESHOLD = 0.30
FACT_TAG = "fact"
# ---------------------------------------


MERGE = {
    "morning": "greeting",
    "night": "greeting",
    "afternoon": "greeting",
    "evening": "greeting",
    "casual": "greeting",

    "sad": "distress",
    "stressed": "distress",
    "depressed": "distress",
    "anxious": "distress",
    "scared": "distress",
    "worthless": "distress",

    "default": "fallback",
    "no-approach": "fallback",
    "something-else": "fallback",
    "not-talking": "fallback",
    "neutral-response": "fallback",

    "skill": "help",

    "learn-mental-health": "learn",
    "learn-more": "learn",
    "mental-health-fact": "learn",

    "user-meditation": "meditation",

    "ask": "query",
    "about": "query",
    "problem": "query",

    "hate-me": "negative",
    "hate-you": "negative",
    "stupid": "negative",
    "wrong": "negative",

    "user-agree": "affirmation",
    "understand": "affirmation",
}


# ---------------- DATA ----------------
def is_valid_pattern(p: str) -> bool:
    if not p or len(p.strip()) < 2:
        return False
    if re.fullmatch(r"[\W_]+", p):
        return False
    return any(ch.isalnum() for ch in p)


def load_data(path: str):
    with open(path, "r", encoding="utf-8") as f:
        intents = json.load(f)

    texts, labels = [], []
    for intent in intents["intents"]:
        tag = intent.get("tag", "").strip()

        if re.fullmatch(r"fact-\d+", tag):
            tag = FACT_TAG

        tag = MERGE.get(tag, tag)

        for p in intent.get("patterns", []):
            if isinstance(p, str) and is_valid_pattern(p):
                texts.append(p.strip())
                labels.append(tag)

    return texts, labels


# ---------------- MODEL ----------------
def build_model(cv_calib: int):
    tfidf_word = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        min_df=2,               # 🔥 REMOVE NOISE
        sublinear_tf=True
    )

    tfidf_char = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 4),     # 🔥 LESS NOISE THAN (3,5)
        min_df=2
    )

    base = LinearSVC(
        C=0.5,                  # 🔥 STRONG REGULARIZATION
        loss="hinge",
        class_weight="balanced",
        random_state=42
    )

    svm = CalibratedClassifierCV(
        base,
        cv=cv_calib,
        method="sigmoid"
    )

    return Pipeline([
        ("features", FeatureUnion([
            ("word", tfidf_word),
            ("char", tfidf_char),
        ])),
        ("svm", svm)
    ])


# ---------------- TRAIN ----------------
def main():
    texts, labels = load_data(DATA_PATH)

    counts = Counter(labels)
    removed = {c for c, n in counts.items() if n < MIN_SAMPLES_PER_INTENT}

    texts = [t for t, y in zip(texts, labels) if y not in removed]
    labels = [y for y in labels if y not in removed]

    counts = Counter(labels)
    print("\nSamples per intent:")
    for k, v in sorted(counts.items(), key=lambda x: x[1]):
        print(f"{k:20s} {v}")
    print("Total intents:", len(counts))

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels,
        test_size=0.2,
        stratify=labels,
        random_state=42
    )

    train_min = min(Counter(y_train).values())
    cv_calib = 3 if train_min >= 3 else 2

    clf = build_model(cv_calib)
    clf.fit(X_train, y_train)

    # ---------------- METRICS ----------------
    train_acc = accuracy_score(y_train, clf.predict(X_train))
    test_preds = clf.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds)

    macro_f1 = f1_score(y_test, test_preds, average="macro")
    weighted_f1 = f1_score(y_test, test_preds, average="weighted")

    print(f"\n📊 Training Accuracy: {train_acc*100:.2f}%")
    print(f"📊 Test Accuracy:     {test_acc*100:.2f}%")
    print(f"📊 Macro F1-score:    {macro_f1*100:.2f}%")
    print(f"📊 Weighted F1-score: {weighted_f1*100:.2f}%")

    skf = StratifiedKFold(n_splits=min(5, min(counts.values())), shuffle=True, random_state=42)
    cv_f1 = cross_val_score(clf, texts, labels, cv=skf, scoring="f1_macro")

    print(f"\n📊 Cross-Val Macro F1: {cv_f1.mean()*100:.2f}% (± {cv_f1.std()*100:.2f}%)")

    print("\nClassification report:")
    print(classification_report(y_test, test_preds, zero_division=0))

    joblib.dump({
        "pipeline": clf,
        "merge_map": MERGE,
        "confidence_threshold": CONF_THRESHOLD,
        "fact_tag": FACT_TAG
    }, MODEL_OUT)

    print(f"\n✅ Saved improved model to {MODEL_OUT}")


if __name__ == "__main__":
    main()