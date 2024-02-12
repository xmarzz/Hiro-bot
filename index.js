const TelegramBot =  require('node-telegram-bot-api')
require('dotenv').config();

const bot_api = process.env.BOT_API

const token = bot_api;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  }
  else if(messageText==='/name'){
    bot.sendMessage(chatId,"ur mom");
  }
  else if(messageText==='/text'){
    bot.sendMessage(chatId, 'what ya wanna text about')
  }
});