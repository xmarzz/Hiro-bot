require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_API;
const bot = new TelegramBot(token, { polling: true });

// Per-user session state storage
// format: { chatId: { name: string, startTime: number, timer: timeout, state: 'idle'|'awaitingName' } }
const userSessions = new Map();

const motivationalQuotes = [
    "Keep going! Every minute counts.",
    "Small progress is still progress!",
    "You’re stronger than you think.",
    "Focus brings freedom."
];

// Helper to get or create session
function getSession(chatId) {
    if (!userSessions.has(chatId)) {
        userSessions.set(chatId, {
            name: null,
            startTime: null,
            timer: null,
            state: 'idle'
        });
    }
    return userSessions.get(chatId);
}

// Handle Callback Queries (Button Clicks)
bot.on("callback_query", (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const session = getSession(chatId);

    if (data.startsWith("duration_")) {
        // If we were waiting for duration (or just from the button click usually implying we are setting up)
        const minutes = parseInt(data.split("_")[1]);
        session.startTime = Date.now();
        session.state = 'running';

        bot.sendMessage(
            chatId,
            `✅ Started *${session.name}* for ${minutes} minutes. Stay focused!`,
            { parse_mode: "Markdown" }
        );

        if (session.timer) clearTimeout(session.timer);
        session.timer = setTimeout(() => {
            bot.sendMessage(chatId, "⏰ Time's up! Take a short break!");
            session.startTime = null; // Session expired
            session.state = 'idle';
        }, minutes * 60 * 1000);

        // Remove the inline keyboard
        bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: chatId, message_id: callbackQuery.message.message_id }
        );
    }
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text ? msg.text.trim().toLowerCase() : "";
    const session = getSession(chatId);

    // 1. Check State: Awaiting Session Name
    if (session.state === 'awaitingName') {
        session.name = msg.text.trim(); // Use original case for name
        session.state = 'awaitingDuration';

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
        return;
    }

    // 2. Main Commands
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
            session.state = 'awaitingName';
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
            if (session.timer) clearTimeout(session.timer);
            bot.sendMessage(
                chatId,
                `✅ Session *${session.name}* ended. Great work!`,
                { parse_mode: "Markdown" }
            );
            session.name = null;
            session.startTime = null;
            session.state = 'idle';
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

    // 3. Fallback: Chat with AI (Hiro)
    try {
        const res = await axios.post("http://127.0.0.1:5000/predict", {
            text: msg.text,
            user_id: chatId.toString()
        });

        if (res.data && res.data.response) {
            bot.sendMessage(chatId, res.data.response);
        } else if (res.data && res.data.emotion) {
            // Check for legacy response format just in case
            const emotion = res.data.emotion;
            const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
            bot.sendMessage(
                chatId, 
                `[Emotion Detected: ${emotion}]\n${quote}`, 
                { parse_mode: "Markdown" }
            );
        } else {
            bot.sendMessage(chatId, "⚠️ Couldn’t analyze your mood.");
        }

    } catch (err) {
        console.error("Backend request failed:", err.message);
        let errorMsg = "⚠️ Error analyzing sentiment.";
        
        if (err.response && err.response.data && err.response.data.error) {
            errorMsg += `\n(Backend: ${err.response.data.error})`;
        }
        
        bot.sendMessage(chatId, errorMsg);
    }
});
