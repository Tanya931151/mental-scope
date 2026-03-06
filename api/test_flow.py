import requests
import json

url = "http://127.0.0.1:5000/chat"

def test_flow(message, state=None):
    payload = {"message": message, "state": state}
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        print(f"\nUser: {message}")
        print(f"Reply: {data.get('reply')}")
        print(f"Options: {[opt['label'] for opt in data.get('options', [])]}")
        return data.get("state")
    except Exception as e:
        print(f"Error: {e}")
        return None

# Start
state = test_flow("hi")

# Transition to Stress
if state:
    state = test_flow("Stress 😵", state)

# Transition to Exams
if state:
    state = test_flow("Exams & Studies 📚", state)

# Final Back to Start
if state:
    state = test_flow("Back to start", state)
