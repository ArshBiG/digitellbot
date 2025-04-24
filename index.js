require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const TOKEN = '7070941220:AAHKLHE657mz98D1-iWVJl7S4lW4oBYbbNY';
const WEBHOOK_URL = 'https://lazy-socks-tease.loca.lt/webhook';

const bot = new TelegramBot(TOKEN, { webHook: true });
bot.setWebHook(WEBHOOK_URL);

// Define Express app
const app = express();
app.use(bodyParser.json());

// Webhook route to receive updates
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express server
const PORT = 3000; // You can change this to process.env.PORT if you use a .env file
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Bot is set up with webhook at', WEBHOOK_URL);
