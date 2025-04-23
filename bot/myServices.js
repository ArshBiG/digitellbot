const { getUser } = require('./db');

function showMyServices(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = getUser(userId);

  if (!user) {
    return bot.sendMessage(chatId, '❌ اطلاعاتی برای شما یافت نشد.');
  }

  let message = `🧾 اطلاعات حساب شما:\n\n`;
  message += `👤 نام: ${msg.from.first_name || 'نامشخص'}\n`;
  message += `🆔 آیدی: ${userId}\n`;
  message += `🕰 زمان عضویت: ${user.joinedAt ? new Date(user.joinedAt).toLocaleString('fa-IR') : 'نامشخص'}\n`;

  if (!user.configs || user.configs.length === 0) {
    message += `\n📭 هنوز سرویسی برای شما ساخته نشده.`;
  } else {
    message += `\n📦 سرویس‌های ساخته شده:\n\n`;
    user.configs.forEach((config, index) => {
      message += `🔹 *${index + 1}.*\n`;
      message += `📛 نام: ${config.name || 'نداره'}\n`;
      message += `🌍 کشور: ${config.country || 'نامشخص'}\n`;
      message += `⏳ مدت: ${config.duration || 'نامشخص'}\n`;
      message += `📎 لینک:\n\`${config.link || 'لینکی ثبت نشده'}\`\n\n`;
    });
  }

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

module.exports = {
  showMyServices
};
