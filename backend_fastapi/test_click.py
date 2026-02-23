import requests

def test_click(label):
    print(f"\nClicking: {label}")
    res = requests.post("http://127.0.0.1:5000/chat", json={
        "message": label,
        "state": {"expecting": "start"}
    })
    data = res.json()
    print(f"Reply: {data['reply']}")
    print(f"Next Options: {[o['label'] for o in data['options']]}")

# Test with emoji and without
test_click("😔 Feeling Sad")
test_click("Feeling Sad")
test_click("Anxiety / Panic")
