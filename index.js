const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot_api = process.env.BOT_API;

const token = bot_api;
const bot = new TelegramBot(token, { polling: true });

let sessionTimer;
let sessionStart;
let sessionName; 

function startNewSession(chatId, name) {
  sessionName=name
  bot.sendMessage(chatId, `Starting a new session named${sessionName}`);
  sessionStart = Date.now();
  sessionTimer = setTimeout(() => {
    bot.sendMessage(chatId, "Session ended! Time for a break.");
    clearTimeout(sessionTimer);
  }, 45 * 60 * 1000);
}

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText.startsWith("/start") || messageText.startsWith("/Start")) {
    bot.sendMessage(
      chatId,
      "Welcome to the bot! \n To start a new session, use /new_session (name of the session). \n To check the current session, use /check_session.\n To end the current session /end_session. \n To learn more about the bot, use /about."
    );
  } else if (messageText.startsWith("/new_session") || messageText.startsWith("/New_Session")) {
    const name = messageText.replace('/new_session','')
    if (sessionStart) {
      bot.sendMessage(chatId, `There is already a session named${sessionName} in progress.`);
    } else {
      startNewSession(chatId, name);
    }
  } else if (
    messageText.startsWith("/check_session") ||
    messageText.startsWith("/Check_Session")
  ) {
    if (sessionStart) {
      const elapsedTime = Date.now() - sessionStart;
      const remainingTime = Math.max(0, 45 * 60 * 1000 - elapsedTime);
      bot.sendMessage(
        chatId,
        `Remaining time: ${Math.floor(
          remainingTime / 60000
        )} minutes and ${Math.floor((remainingTime % 60000) / 1000)} seconds left for the${sessionName} session to end.`
      );
    } else {
      bot.sendMessage(chatId, "No active session found.");
    }
  } else if (messageText.startsWith("/end_session") || messageText.startsWith("/End_Session")) {
    bot.sendMessage(chatId, `Session${sessionName}has ended`);
    clearTimeout(sessionTimer);
    sessionStart = null;
  } else if (messageText.startsWith("/about") || messageText.startsWith("/About")) {
    bot.sendMessage(
      chatId,
      "This bot helps manage study sessions.\n\n FLOW TIME \n\n \u2192What it is: A time management system based on the idea that focusing on a single task for an extended period of time can lead to increased productivity and creativity. \n\n \u2192How it works: You set a timer for a period of time (typically 45 minutes) and work on a single task until the timer goes off. During this time, you avoid all distractions, such as checking your phone or email. \n\n \u2192Benefits: Can help you to get into a state of flow, which is a state of deep concentration and immersion in a task. This can lead to increased productivity, creativity, and satisfaction. \n\n \u2192Drawbacks: Requires a lot of discipline and focus. It can be difficult to resist distractions, especially if you are used to multitasking."
    );
  } else if(messageText.startsWith("/fact")) {
    bot.sendMessage(
      chatId,
      "jaff's love ceylin");
  }
  else {
    bot.sendMessage(chatId, "Enter valid commands");
  }
});


