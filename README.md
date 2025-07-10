# 🧠 HIRO: Sentiment-Aware Productivity Telegram Bot

**HIRO** is a context-aware, sentiment-driven productivity assistant built using **Node.js**, **Flask**, **MongoDB**, and **Machine Learning**. It helps users manage their focus sessions while dynamically adapting to their emotional state based on real-time message analysis.

---

## 🚀 Features

### 🔹 Emotion Detection with AI
- Uses a trained **Logistic Regression** model with **CountVectorizer** to detect user emotion (e.g., *happy*, *sad*, *angry*, *tired*, *bored*, *excited*).
- Sentiment model trained dynamically from **MongoDB-stored labeled user data** (not hardcoded!).

### 🔹 Telegram Bot Integration
- Fully interactive **Telegram chatbot** built with `node-telegram-bot-api`.
- Natural conversations to start, track, and end productivity sessions.
- Handles multiple intent flows like:
  - `"start session"`
  - `"check session"`
  - `"end session"`
  - `"about"`  
  And responds intelligently with motivational or supportive messages.

### 🔹 Motivation Boost
- Smart prompts based on user emotion.
- Example: If the user is "tired" or "sad", the bot shares motivational quotes.

### 🔹 MongoDB-Powered Learning
- Emotion training data is stored and read from **MongoDB**, making the system extensible.
- Add more labeled data directly into MongoDB to improve the model without changing code.

---

## 🛠️ Tech Stack

| Layer       | Tech Used                             |
|-------------|----------------------------------------|
| Frontend    | Telegram Bot (Node.js)                |
| Backend     | Flask (Python)                        |
| AI/ML       | Scikit-learn (Logistic Regression)    |
| Database    | MongoDB (NoSQL)                       |
| Deployment  | Localhost (Easy to deploy to cloud)   |

---

## 📁 Project Structure

```
hiro-telegram-bot/
│
├── bot.js                # Telegram bot logic (Node.js)
├── .env                  # Secrets and API tokens
├── app.py                # Flask ML backend for emotion detection
├── emotion_model.pkl     # Trained ML model (persisted)
├── vectorizer.pkl        # Trained CountVectorizer
├── emotion_dataset.csv   # Optional fallback dataset
└── README.md             # You're here!
```

---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/hiro-telegram-bot.git
cd hiro-telegram-bot
```

### 2. Install Dependencies

#### Backend (Flask)
```bash
pip install -r requirements.txt
```

#### Frontend (Node.js)
```bash
npm install
```

### 3. Set Up `.env`

```bash
BOT_API=your_telegram_bot_token_here
```

### 4. MongoDB Setup

- Install MongoDB
- Create a database called `mybot`
- Insert labeled training data in the `messages` collection:
```json
{
  "text": "I'm feeling very low today",
  "label": "sad"
}
```

### 5. Run the App

#### Backend (Python):
```bash
python app.py
```

#### Frontend (Node.js):
```bash
node bot.js
```

---

## 🧠 How the ML Works

- Trains a **Logistic Regression** model on labeled user text stored in MongoDB.
- Supports 6 emotions: `happy`, `sad`, `angry`, `tired`, `excited`, `bored`.
- Predictions are used to adapt the chatbot's motivational tone.

---

## 📈 How to Improve Accuracy

- Add more labeled emotion data to MongoDB.
- Use high-quality, diverse user phrases.
- Retrain the model by restarting the Flask server.

---

## ❤️ Inspiration

This project is inspired by a desire to blend **emotional intelligence** with **productivity workflows**, creating a bot that not only tracks time but understands how you feel during work sessions.

---

## ✨ Future Enhancements

- Real-time model updating without restart
- Deep learning model integration (BERT)
- Admin dashboard for managing labeled data
- Cloud deployment with Docker or Railway

---

## 📜 License

MIT License. Feel free to use and modify!