const TelegramBot = require('node-telegram-bot-api');
const { TOKEN, WEBHOOK_URL } = require('../constants/env');
const handlers = require('./handlers');

const bot = new TelegramBot(TOKEN);
bot.setWebHook(WEBHOOK_URL);

handlers(bot);

module.exports = bot;
