// const TelegramBot = require("node-telegram-bot-api");
// require("dotenv").config();

// const bot_api = process.env.BOT_API;

// const token = bot_api;
// const bot = new TelegramBot(token, { polling: true });

// let sessionTimer;
// let sessionStart;

// function startNewSession(chatId) {
//   bot.sendMessage(chatId, "starting a new session!");
//   sessionStart = Date.now();
//   sessionTimer = setTimer(() => {
//     bot.sendMessage(chatId, "Session ended! time for a break.");
//     clearTimeout(sessionTimer);
//   }, 45 * 60 * 1000);
// }

// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;
//   const messageText = msg.text;

//   if (messageText === "/start") {
//     bot.sendMessage(
//       chatId,
//       "Welcome to the bot! \n to start a new session /new_session (name of the session) \n To check the current session  /check_session \n to learn more about the bot /about"
//     );
//   } else if (messageText === "/new_session") {
//     if (sessionStart)
//       bot.messageText(chatId, "There is already a session on the progress.");
//     else startNewSession(chatId);
//   } else if (messageText === "/check_session") {
//      if(sessionStart){
//         const elapsedTime = Date.now()-sessionStart;
//         const remainingTime = Math.max(0, 45*60*1000 - elapsedTime);
//         bot.sendMessage(chatId, `Remaining time : ${Math.flow(remainingTime / 60000)} Minutes`)
//      }
//      else {
//       bot.sendMessage(chatId, "No active session found.")
//      }
//   } else if (messageText === "/about") {
//       bot.sendMessage(chatId, "This bot helps manage study sessions. Use /new_session to start a new session, /check_session to see the remaining time, and /about for more information.")
//   } else {
//     bot.sendMessage(chatId, "enter valid commands");
//   }
// });


const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot_api = process.env.BOT_API;

const token = bot_api;
const bot = new TelegramBot(token, { polling: true });

let sessionTimer;
let sessionStart;

function startNewSession(chatId) {
  bot.sendMessage(chatId, "Starting a new session!");
  sessionStart = Date.now();
  sessionTimer = setTimeout(() => {
    bot.sendMessage(chatId, "Session ended! Time for a break.");
    clearTimeout(sessionTimer);
  },  45 *  60 *  1000);
}

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === "/start") {
    bot.sendMessage(
      chatId,
      "Welcome to the bot! \n To start a new session, use /new_session (name of the session). \n To check the current session, use /check_session. \n To learn more about the bot, use /about."
    );
  } else if (messageText === "/new_session") {
    if (sessionStart) {
      bot.sendMessage(chatId, "There is already a session in progress.");
    } else {
      startNewSession(chatId);
    }
  } else if (messageText === "/check_session") {
    if (sessionStart) {
      const elapsedTime = Date.now() - sessionStart;
      const remainingTime = Math.max(0,  45 *  60 *  1000 - elapsedTime);
      bot.sendMessage(chatId, `Remaining time: ${Math.floor(remainingTime /  60000)} minutes and ${Math.floor((remainingTime %  60000) /  1000)} seconds.`);
    } else {
      bot.sendMessage(chatId, "No active session found.");
    }
  } else if (messageText === "/about") {
    bot.sendMessage(chatId, "This bot helps manage study sessions. Use /new_session to start a new session, /check_session to see the remaining time, and /about for more information.");
  } else {
    bot.sendMessage(chatId, "Enter valid commands");
  }
});
