import requests
import json

url = "http://localhost:5000/chat"

def test_query(message):
    payload = {"message": message, "state": None}
    try:
        response = requests.post(url, json=payload)
        print(f"\nQuery: {message}")
        print(f"Status: {response.status_code}")
        print(f"Reply: {response.json().get('reply')}")
    except Exception as e:
        print(f"Error: {e}")

# Test Gemini Fallback with real key
test_query("What are some good grounded habits for a student?")
