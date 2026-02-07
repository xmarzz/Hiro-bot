# python - <<EOF
from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017")
db = client["mybot"]
messages = db["messages"]

print(messages.count_documents({
    "emotion": {"$in": ["happy", "sad", "angry", "tired", "excited", "bored"]}
}))

labels = ["happy", "sad", "angry", "tired", "excited", "bored"]

for label in labels:
    count = messages.count_documents({"emotion": label})
    print(f"{label}: {count}")


print("total docs :", messages.count_documents({})) 