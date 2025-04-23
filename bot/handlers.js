const steps = require('./steps');
const { showMyServices } = require('./myServices');
const { saveUser } = require('./db');

module.exports = function (bot) {
  const userSessions = {};

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const name = msg.from.first_name || '';

    saveUser(userId, { name });

    userSessions[chatId] = {};
    bot.sendMessage(chatId, 'سلام، یکی از گزینه‌ها رو انتخاب کن:', {
      reply_markup: {
        keyboard: [['خرید سرور', 'آموزش‌ها'], ['کیف پول', 'پشتیبانی'], ['سرویس‌های من']],
        resize_keyboard: true
      }
    });
  });

  bot.on('message', (msg) => {
    const text = msg.text;

    if (text === 'سرویس‌های من') {
      return showMyServices(bot, msg);
    }

    steps.handleSteps(bot, msg, userSessions);
  });

  bot.on('callback_query', (query) => {
    steps.handleCallback(bot, query, userSessions);
  });
};
