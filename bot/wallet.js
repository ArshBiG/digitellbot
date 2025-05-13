const User = require('../models/User');

// نمایش موجودی کیف پول
async function showWalletBalance(bot, chatId) {
  try {
    const user = await User.findOne({ subId: chatId });
    if (!user) {
      return bot.sendMessage(chatId, '❌ کاربری با این شناسه پیدا نشد.');
    }

    const walletBalance = user.wallet;
    const firstName = user.firstName || "کاربر";

    // تبدیل موجودی کیف پول به فرمت سه‌تایی
    const formattedBalance = walletBalance.toLocaleString('fa-IR');

    // تاریخ و زمان ورود
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
    const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

    // ارسال پیام همراه با دکمه افزایش موجودی
    bot.sendMessage(chatId, `💼 خوش آمدید، ${firstName} عزیز!  
  💰 موجودی کیف پول شما: ${formattedBalance} تومان  
  🆔 شناسه کاربری: ${chatId}
  
  _${formattedDate} | ${formattedTime}_`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💳 افزایش موجودی', callback_data: 'add_wallet' }
          ]
        ]
      }
    });
  } catch (err) {
    console.error('❌ خطا در نمایش موجودی کیف پول:', err);
    bot.sendMessage(chatId, '⚠️ خطا در هنگام دریافت اطلاعات کیف پول.');
  }
}

module.exports = {
  showWalletBalance
};
