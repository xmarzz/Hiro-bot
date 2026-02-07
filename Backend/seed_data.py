from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["mybot"]
messages = db["messages"]

data = [
    { "text": "I feel very happy today", "emotion": "happy" },
    { "text": "Life is good", "emotion": "happy" },
    { "text": "I am joyful", "emotion": "happy" },

    { "text": "I feel sad", "emotion": "sad" },
    { "text": "I am feeling down", "emotion": "sad" },

    { "text": "This makes me angry", "emotion": "angry" },
    { "text": "I am furious", "emotion": "angry" },

    { "text": "I feel exhausted", "emotion": "tired" },
    { "text": "I am very tired", "emotion": "tired" },

    { "text": "I am excited for the trip", "emotion": "excited" }
]

result = messages.insert_many(data)
print(f"✅ Inserted {len(result.inserted_ids)} documents into mybot.messages")
