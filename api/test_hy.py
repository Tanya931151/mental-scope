import requests
import json

url = "http://localhost:5000/chat"
payload = {"message": "hy", "state": None}

try:
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
