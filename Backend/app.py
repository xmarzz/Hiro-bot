import joblib
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from pymongo import MongoClient
import traceback

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["mybot"]
messages = db["messages"]

# Target emotion labels``
target_labels = ["happy", "sad", "angry", "tired", "excited", "bored"]

# Load data from MongoDB
data = list(messages.find({"label": {"$in": target_labels}}))

if len(data) < 10:
    print("❌ Not enough labeled data in MongoDB to train the model.")
    exit()

texts = [d["text"] for d in data]
labels = [d["label"] for d in data]

# Vectorize and train
vectorizer = CountVectorizer()
X_train = vectorizer.fit_transform(texts)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, labels)

# Persist the model
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(model, "emotion_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text")
        if not text:
            return jsonify({"error": "No text provided"}), 400

        vect = vectorizer.transform([text])
        prediction = model.predict(vect)[0]

        return jsonify({"emotion": str(prediction)})
    
    except Exception as e:
        print("❌ ERROR:", traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(port=5000)
