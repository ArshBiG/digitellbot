const tutorialsGroupId = 'digitellTutorial';

// هندلر برای دکمه "آموزش‌ها"
function handleTutorialsCallback(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📲 عضویت در کانال آموزش‌ها', url: `https://t.me/${tutorialsGroupId}` }]
      ]
    }
  };

  bot.sendMessage(chatId, '📝 برای مشاهده آموزش‌ها، لطفاً عضو کانال زیر شوید:', opts);
  bot.answerCallbackQuery(callbackQuery.id);
}

module.exports = {
  handleTutorialsCallback,
};
