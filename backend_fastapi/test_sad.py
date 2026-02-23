import requests
import json

payload = {
    "message": "😔 Feeling Sad",
    "state": {"expecting": "start"}
}
res = requests.post("http://127.0.0.1:5000/chat", json=payload)
data = res.json()

print("USER CLICKED: 😔 Feeling Sad")
print("BOT REPLY:", data['reply'])
print("BOT OPTIONS:", [o['label'] for o in data['options']])
print("STATE EXPECTING:", data['state']['expecting'])
