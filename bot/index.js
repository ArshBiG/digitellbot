const TelegramBot = require('node-telegram-bot-api');
const handlers = require('./handlers');

// ✅ مستقیم گذاشتن توکن و آدرس webhook
const TOKEN = '7070941220:AAHKLHE657mz98D1-iWVJl7S4lW4oBYbbNY';
const WEBHOOK_URL = 'https://64e3658e-c39d-4d60-a657-4426e8c9a0c0-00-3eqlt47t27c5h.riker.replit.dev';

const bot = new TelegramBot(TOKEN, { webHook: true });
bot.setWebHook(WEBHOOK_URL);

handlers(bot);

module.exports = bot;
