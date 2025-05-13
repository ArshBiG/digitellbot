const supportGroupId = '-1002500088096';
const userSessions = {};
const pendingReplies = {}; // adminId یا chatId گروه رو نگه می‌داره

function handleSupportRequest(bot, msg) {
  const chatId = msg.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💬 ارتباط سریع با پشتیبانی', callback_data: 'support_request' }]
      ]
    }
  };

  bot.sendMessage(chatId, `📞 در صورت تمایل می‌توانید به آیدی زیر پیام دهید:\n@digitellsupport`, opts);
}

function handleSupportCallback(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  userSessions[chatId] = { state: 'awaiting_support_message' };

  bot.sendMessage(chatId, '📝 لطفاً پیام خود را برای پشتیبانی ارسال کنید:');
  bot.answerCallbackQuery(callbackQuery.id);
}

function handleSupportMessage(bot, msg) {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session || session.state !== 'awaiting_support_message') return;

  const text = msg.text;

  const supportMsg = `
📩 پیام جدید از کاربر:
🆔 آیدی: ${chatId}
🔹 پیام: ${text}
`;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✉️ پاسخ دادن', callback_data: `reply_to_user_${chatId}` }]
      ]
    }
  };

  bot.sendMessage(supportGroupId, supportMsg, inlineKeyboard);
  bot.sendMessage(chatId, '✅ پیام شما با موفقیت برای پشتیبانی ارسال شد.');
  delete userSessions[chatId];
}

function handleReplyToUser(bot, callbackQuery) {
  const message = callbackQuery.message;
  const groupId = message.chat.id; // گروه پشتیبانی
  const adminId = callbackQuery.from.id;
  const match = callbackQuery.data.match(/^reply_to_user_(\d+)$/);

  if (!match) return;

  const userId = match[1];
  pendingReplies[adminId] = { userId };

  // ارسال پیام در خود گروه
  bot.sendMessage(groupId, '📝 لطفاً پاسخ خود را بنویسید:');
  bot.answerCallbackQuery(callbackQuery.id);
}

function handleAdminReply(bot, msg) {
  const adminId = msg.from.id;
  const session = pendingReplies[adminId];

  if (!session || !session.userId) return;

  const userId = session.userId;
  const reply = msg.text;

  if (!reply) return;

  // ارسال پیام برای کاربر
  bot.sendMessage(userId, `📬 پاسخ پشتیبانی:\n${reply}`);
  // اطلاع‌رسانی در همان جایی که ادمین پیام داده (پی‌وی یا گروه)
  bot.sendMessage(msg.chat.id, '✅ پاسخ با موفقیت ارسال شد.');

  delete pendingReplies[adminId];
}

module.exports = {
  handleSupportRequest,
  handleSupportCallback,
  handleSupportMessage,
  handleReplyToUser,
  handleAdminReply
};
