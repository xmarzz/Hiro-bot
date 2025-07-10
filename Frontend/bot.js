require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_API;
const bot = new TelegramBot(token, { polling: true });

// session state
let session = {
    name: null,
    startTime: null,
    timer: null
};

const motivationalQuotes = [
    "Keep going! Every minute counts.",
    "Small progress is still progress!",
    "You’re stronger than you think.",
    "Focus brings freedom."
];

// states
let awaitingSessionName = null;
let awaitingSessionDuration = null;

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.trim().toLowerCase();

    // user is typing the name
    if (awaitingSessionName === chatId) {
        session.name = msg.text.trim();
        awaitingSessionName = null;
        awaitingSessionDuration = chatId;

        bot.sendMessage(
            chatId,
            `⏳ How long do you want the *${session.name}* session to run?`,
            {
                parse_mode: "Markdown",
                reply_markup:  {
                    inline_keyboard: [
                        [
                            { text: "30 min", callback_data: "duration_30" },
                            { text: "45 min", callback_data: "duration_45" },
                            { text: "90 min", callback_data: "duration_90" }
                        ]
                    ]
                }
            });
        awaitingSessionName=null; 
        return;
    }

    bot.on("callback_query", (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith("duration_")) {
        const minutes = parseInt(data.split("_")[1]);
        session.startTime = Date.now();

        bot.sendMessage(
            chatId,
            `✅ Started *${session.name}* for ${minutes} minutes. Stay focused!`,
            { parse_mode: "Markdown" }
        );

        session.timer = setTimeout(() => {
            bot.sendMessage(chatId, "⏰ Time's up! Take a short break!");
        }, minutes * 60 * 1000);

        awaitingSessionDuration = null;

        // Optional: remove the inline keyboard
        bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: chatId, message_id: callbackQuery.message.message_id }
        );
    }
});


    // user is picking duration
    if (awaitingSessionDuration === chatId && ["30", "45", "90"].includes(messageText)) {
        const minutes = parseInt(messageText);
        session.startTime = Date.now();
        bot.sendMessage(
            chatId,
            `✅ Started *${session.name}* for ${minutes} minutes. Stay focused!`,
            { parse_mode: "Markdown" }
        );
        session.timer = setTimeout(() => {
            bot.sendMessage(chatId, "⏰ Time's up! Take a short break!");
        }, minutes * 60 * 1000);
        awaitingSessionDuration = null;
        return;
    }

    // main commands
    if (messageText === "start") {
        bot.sendMessage(
            chatId,
            "🤖 Welcome! What would you like to do?\n\n- *start session*\n- *check session*\n- *end session*\n- *about*",
            { parse_mode: "Markdown" }
        );
        return;
    }

    if (messageText === "start session") {
        if (session.startTime) {
            bot.sendMessage(
                chatId,
                `⚠️ A session is already running: *${session.name}*. Use 'end session' to stop it.`,
                { parse_mode: "Markdown" }
            );
        } else {
            bot.sendMessage(chatId, "📝 Please enter a name for this new session:");
            awaitingSessionName = chatId;
        }
        return;
    }

    if (messageText === "check session") {
        if (session.startTime) {
            const minsPassed = Math.floor((Date.now() - session.startTime) / 60000);
            bot.sendMessage(
                chatId,
                `⏳ Session *${session.name}* is running for ${minsPassed} minutes.`,
                { parse_mode: "Markdown" }
            );
        } else {
            bot.sendMessage(chatId, "ℹ️ No active session right now.");
        }
        return;
    }

    if (messageText === "end session") {
        if (session.startTime) {
            clearTimeout(session.timer);
            bot.sendMessage(
                chatId,
                `✅ Session *${session.name}* ended. Great work!`,
                { parse_mode: "Markdown" }
            );
            session.name = null;
            session.startTime = null;
        } else {
            bot.sendMessage(chatId, "⚠️ There is no active session to end.");
        }
        return;
    }

    if (messageText === "about") {
        bot.sendMessage(
            chatId,
            `📚 *FLOW TIME*\n\nFocus on a single task for a block of time to boost productivity and creativity.\n\n✅ *How it works:* Pick a time, work, then rest.\n✅ *Why:* Helps you enter deep focus.\n✅ *Tips:* Avoid distractions, stay consistent.\n\nYou've got this! 💪`,
            { parse_mode: "Markdown" }
        );
        return;
    }

    // fallback: analyze sentiment
    try {
        const res = await axios.post("http://127.0.0.1:5000/predict", {
            text: msg.text
        });
       if (res.data && res.data.emotion) {
    const emotion = res.data.emotion;

    if (["sad", "angry", "tired", "bored"].includes(emotion)) {
        const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        bot.sendMessage(
            chatId,
            `😟 You seem *${emotion}*. Here's something for you:\n\n_${quote}_`,
            { parse_mode: "Markdown" }
            );
        } else {
            bot.sendMessage(chatId, `😃 You seem *${emotion}*! Keep that energy going!`);
        }
    } else {
        bot.sendMessage(chatId, "⚠️ Couldn’t analyze your mood.");
    }

    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "⚠️ Error analyzing sentiment.");
    }
});

