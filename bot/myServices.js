const { getUser } = require('./db');

function showMyServices(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = getUser(userId);

  let message = `🧾 سرویس‌های ساخته شده:\n\n`;
  user.configs.forEach((config, index) => {
    message += `🔹 *${index + 1}.*\n`;
    message += `📛 نام: ${config.name || 'نداره'}\n`;
    message += `🌍 کشور: ${config.country || 'نامشخص'}\n`;
    message += `⏳ مدت: ${config.duration || 'نامشخص'}\n`;
    message += `📎 لینک:\n\`${config.link || 'لینکی ثبت نشده'}\`\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

module.exports = {
  showMyServices
};
