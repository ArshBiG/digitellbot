const User = require('../models/User');

const transactionsPerPage = 5;

function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

async function handleShowUser(bot, msg, match) {
  const chatId = msg.chat.id;
  const adminIds = [5054082689, 123456789];
  if (!adminIds.includes(chatId)) {
    return bot.sendMessage(chatId, '❌ شما اجازه استفاده از این دستور را ندارید.');
  }

  const targetUserId = match[1];
  const user = await User.findOne({ subId: targetUserId });

  if (!user) {
    return bot.sendMessage(chatId, '❌ کاربر پیدا نشد.');
  }

  sendUserPage(bot, chatId, user, 0, msg.message_id);
}

function sendUserPage(bot, chatId, user, page = 0, messageId) {
  const start = page * transactionsPerPage;
  const end = start + transactionsPerPage;
  const history = user.walletHistory.sort((a, b) => b.date - a.date);
  const slicedHistory = history.slice(start, end);

  let response = `👤 اطلاعات کاربر:\n`;
  response += `🆔 آیدی تلگرام: ${user.subId}\n`;
  response += `💳 موجودی کیف پول: ${formatCurrency(user.wallet)} تومان\n\n`;

  if (!history.length) {
    response += `📭 هنوز هیچ تراکنشی ثبت نشده است.`;
  } else {
    response += `📄 لیست تراکنش‌ها:\n`;
    slicedHistory.forEach((entry, index) => {
      const date = new Date(entry.date).toLocaleString('fa-IR');
      response += `\n${start + index + 1}. [${entry.type === 'deposit' ? 'واریز' : 'برداشت'}] ${formatCurrency(entry.amount)} تومان\n🕰 ${date}\n📌 ${entry.description}\n`;
    });
  }

  const keyboard = [];

  if (page > 0) {
    keyboard.push({ text: '⬅️ صفحه قبل', callback_data: `showuser_${user.subId}_${page - 1}` });
  }

  if (end < history.length) {
    keyboard.push({ text: '➡️ صفحه بعد', callback_data: `showuser_${user.subId}_${page + 1}` });
  }

  bot.sendMessage(chatId, response, {
    reply_markup: {
      inline_keyboard: [keyboard]
    }
  });
}

function handleShowUserCallback(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data; // مثل showuser_123456789_1
  const [, subId, pageStr] = data.split('_');
  const page = parseInt(pageStr, 10);

  User.findOne({ subId })
    .then(user => {
      if (!user) {
        return bot.answerCallbackQuery(query.id, { text: 'کاربر پیدا نشد.', show_alert: true });
      }

      const start = page * transactionsPerPage;
      const end = start + transactionsPerPage;
      const history = user.walletHistory.sort((a, b) => b.date - a.date);
      const slicedHistory = history.slice(start, end);

      let response = `👤 اطلاعات کاربر:\n`;
      response += `🆔 آیدی تلگرام: ${user.subId}\n`;
      response += `💳 موجودی کیف پول: ${user.wallet} تومان\n\n`;

      if (!history.length) {
        response += `📭 هنوز هیچ تراکنشی ثبت نشده است.`;
      } else {
        response += `📄 لیست تراکنش‌ها:\n`;
        slicedHistory.forEach((entry, index) => {
          const date = new Date(entry.date).toLocaleString('fa-IR');
          response += `\n${start + index + 1}. [${entry.type === 'deposit' ? 'واریز' : 'برداشت'}] ${entry.amount} تومان\n🕰 ${date}\n📌 ${entry.description}\n`;
        });
      }

      const keyboard = [];

      if (page > 0) {
        keyboard.push({ text: '⬅️ صفحه قبل', callback_data: `showuser_${user.subId}_${page - 1}` });
      }

      if (end < history.length) {
        keyboard.push({ text: '➡️ صفحه بعد', callback_data: `showuser_${user.subId}_${page + 1}` });
      }

      bot.editMessageText(response, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [keyboard]
        }
      });
    });
}

module.exports = {
  handleShowUser,
  handleShowUserCallback
};
