from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["mybot"]
messages = db["messages"]

samples = [
    {"text": "I feel amazing today", "label": "happy"},
    {"text": "This is the worst day ever", "label": "sad"},
    {"text": "I'm furious about this!", "label": "angry"},
    {"text": "I'm so tired I can't think", "label": "tired"},
    {"text": "That was really exciting!", "label": "excited"},
    {"text": "I'm bored out of my mind", "label": "bored"},
    {"text": "Life is beautiful", "label": "happy"},
    {"text": "I’m not feeling great", "label": "sad"},
    {"text": "Everything annoys me today", "label": "angry"},
    {"text": "All I want is to sleep", "label": "tired"}
]

messages.insert_many(samples)
print("✅ Sample labeled data inserted.")


