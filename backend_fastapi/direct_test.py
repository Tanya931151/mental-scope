from chatbot_engine import respond, ChatState, asdict
import json

dummy_state = asdict(ChatState())
text = "Tell me a joke about robots."

print(f"Testing direct respond with text: {text}")
reply, new_state = respond(text, dummy_state)
print(f"\nAI Reply: {reply}")
