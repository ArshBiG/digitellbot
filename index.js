require('dotenv').config();
require('./database');

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = '7725831912:AAHBspgXhbzZKKVa61CNfQWQ0CK4WyFTDOs';
const WEBHOOK_URL = 'https://digitellbot.zirzaminazad.ir/';

const bot = new TelegramBot(TOKEN, { webHook: true });
bot.setWebHook(WEBHOOK_URL);

const app = express();
app.use(express.json());

app.post('/', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

require('./bot/handlers')(bot);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
