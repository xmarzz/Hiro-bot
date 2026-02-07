import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ai_manager import AIManager

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

print("Starting Hiro-Bot Backend with AI Manager...")

# Initialize AI Manager
ai_manager = AIManager()

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text")
        user_id = data.get("user_id", "default")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Get response and emotion from AI Manager
        response_text, emotion = ai_manager.generate_response(text, user_id)

        return jsonify({
            "emotion": emotion,
            "response": response_text
        })
    
    except Exception as e:
        print("❌ ERROR:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
