const User = require('../models/User');
const groupId = '-1002529718969'; // آی‌دی گروه تلگرام

async function handleAddWallet(bot, msg, userSessions) {
  const chatId = msg.chat.id;
  const user = await User.findOne({ subId: chatId });

  if (!user) {
    return bot.sendMessage(chatId, '❌ کاربری با این شناسه پیدا نشد.');
  }

  userSessions[chatId] = {
    startTime: Date.now(),
    state: 'waiting_for_amount'
  };

  bot.sendMessage(chatId, '💰 لطفاً مبلغی که می‌خواهید به کیف پول خود اضافه کنید وارد کنید (حداقل 80 هزار تومان):');
}

async function processAmount(bot, msg, userSessions) {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session || session.state !== 'waiting_for_amount') return;

  const amountText = msg.text.replace(/[^\d]/g, '');
  const amount = parseInt(amountText, 10);

  if (isNaN(amount) || amount < 80000) {
    return bot.sendMessage(chatId, '❌ فقط عدد وارد کنید و حداقل مبلغ ۸۰٬۰۰۰ تومان باشد.\nمثال: 80000');
  }

  const message = `
  📥 مبلغ انتخاب‌شده: ${amount.toLocaleString()} تومان
  
  💳 لطفاً مبلغ را به شماره کارت زیر واریز کنید:
  ━━━━━━━━━━━━━━
  \`6362 1411 0008 3576\`

  به نام *آرش احمدآبادی*
  ━━━━━━━━━━━━━━
  ⏳ تا ۳۰ دقیقه فرصت دارید اسکرین‌شات را در همین چت ارسال کنید.
  `;
  
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  userSessions[chatId].state = 'waiting_for_screenshot';
  userSessions[chatId].amount = amount;

  userSessions[chatId].timeout = setTimeout(() => {
    delete userSessions[chatId];
    bot.sendMessage(chatId, '⌛️ زمان شما برای ارسال اسکرین‌شات به پایان رسید.');
  }, 30 * 60 * 1000);
}

async function handleScreenshot(bot, msg, userSessions) {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session || session.state !== 'waiting_for_screenshot') {
    return bot.sendMessage(chatId, '⚠️ لطفاً ابتدا مبلغ را وارد کرده و سپس اسکرین‌شات ارسال کنید.');
  }

  const now = Date.now();
  if (now - session.startTime > 30 * 60 * 1000) {
    clearTimeout(session.timeout);
    delete userSessions[chatId];
    return bot.sendMessage(chatId, '❌ زمان شما برای پرداخت به پایان رسیده است. لطفاً دوباره تلاش کنید.');
  }

  try {
    const caption = `💸 یک درخواست پرداخت جدید ثبت شد.
👤 کاربر: ${chatId}
💰 مبلغ: ${session.amount.toLocaleString()} تومان`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ تایید', callback_data: `approve_${chatId}_${session.amount}` },
            { text: '❌ رد', callback_data: `reject_${chatId}` }
          ]
        ]
      }
    };

    if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1].file_id;
      await bot.sendPhoto(groupId, photo, { caption, ...inlineKeyboard });
    } else {
      await bot.sendMessage(groupId, `${caption}\n⚠️ اما اسکرین‌شات ارسال نشده بود.`, inlineKeyboard);
    }

    bot.sendMessage(chatId, '✅ اسکرین‌شات شما با موفقیت ارسال شد. منتظر تایید مدیریت باشید.');
    clearTimeout(session.timeout);
    delete userSessions[chatId];
  } catch (err) {
    console.error('❌ خطا در ارسال به گروه:', err);
    bot.sendMessage(chatId, '❌ ارسال پیام به گروه با مشکل مواجه شد.');
  }
}

// ⬇️ این تابع جدید برای تایید پرداخت است
async function handleApproval(bot, userChatId, amount) {
  const user = await User.findOne({ subId: userChatId });

  if (!user) {
    return bot.sendMessage(userChatId, '❌ کاربری یافت نشد.');
  }

  user.wallet += amount;
  user.walletHistory.push({
    type: 'deposit',
    amount,
    date: new Date(),
    description: 'واریز توسط کاربر',
  });
  await user.save();

  await bot.sendMessage(userChatId, `✅ پرداخت شما تایید شد. مبلغ ${amount.toLocaleString()} تومان به کیف پول شما اضافه شد.`);
}

// ⬇️ این تابع جدید برای رد پرداخت است
async function handleRejection(bot, userChatId) {
  await bot.sendMessage(userChatId, '❌ پرداخت شما توسط مدیریت تایید نشد.');
}

module.exports = {
  handleAddWallet,
  processAmount,
  handleScreenshot,
  handleApproval,
  handleRejection
};
