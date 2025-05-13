const User = require('../models/User'); // وارد کردن مدل User

// تابعی برای اضافه کردن موجودی به حساب کاربر
async function handleAdminAddMoney(bot, adminChatId, userId, amount) {
  try {
    // پیدا کردن کاربر با استفاده از ID
    const user = await User.findOne({ subId: userId });

    if (!user) {
      return bot.sendMessage(adminChatId, '❌ کاربر با این آیدی پیدا نشد.');
    }

    // اضافه کردن مبلغ به موجودی کیف پول کاربر
    user.wallet += amount;
    user.walletHistory.push({
      type: 'deposit',
      amount,
      date: new Date(),
      description: 'واریز توسط ادمین',
    });
    await user.save();

    // ارسال پیام تایید به ادمین
    bot.sendMessage(adminChatId, `✅ موجودی کاربر با آیدی ${userId} به مبلغ ${amount} تومان اضافه شد.`);

    // ارسال پیام به کاربر برای اطلاع‌رسانی
    bot.sendMessage(userId, `💰 موجودی کیف پول شما توسط ادمین به مبلغ ${amount} تومان افزایش یافت.`);
  } catch (err) {
    console.error('❌ خطا در اضافه کردن موجودی:', err);
    bot.sendMessage(adminChatId, '⚠️ خطا در هنگام اضافه کردن موجودی.');
  }
}

module.exports = { handleAdminAddMoney };
