# retrain_model.py
import joblib
from pymongo import MongoClient
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from collections import Counter

# MongoDB connection
client = MongoClient("mongodb://localhost:27017")
db = client["mybot"]
messages = db["messages"]

# Fetch string-labeled data
valid_labels = ["happy", "sad", "angry", "tired", "excited", "bored"]
data = list(messages.find({"label": {"$in": valid_labels}}))
texts = [d["text"] for d in data]
labels = [d["label"] for d in data]

# Check if we have enough data
if len(texts) < 10:
    raise ValueError("Not enough labeled data in MongoDB to train the model.")

# Train model
vectorizer = CountVectorizer()
X_train = vectorizer.fit_transform(texts)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, labels)

# Save to disk
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(model, "emotion_model.pkl")

# Print label distribution
print("Model trained successfully!")
print("Label distribution:", Counter(labels))
