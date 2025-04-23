const steps = require('./steps');

module.exports = function (bot) {
  const userSessions = {};

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userSessions[chatId] = {};
    bot.sendMessage(chatId, 'سلام، یکی از گزینه‌ها رو انتخاب کن:', {
      reply_markup: {
        keyboard: [['خرید سرور', 'آموزش‌ها'], ['کیف پول', 'پشتیبانی'], ['سرویس‌های من']],
        resize_keyboard: true
      }
    });
  });

  bot.on('message', (msg) => {
    steps.handleSteps(bot, msg, userSessions);
  });

  bot.on('callback_query', (query) => {
    steps.handleCallback(bot, query, userSessions);
  });
};
