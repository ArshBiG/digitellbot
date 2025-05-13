const { getDaysLeft } = require('../utils/dateex');
const User = require('../models/User');

// تابع برای فرمت کردن مبلغ موجودی به صورت ۳ رقمی
function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function showMyServices(bot, msgOrQuery, page = 0) {
  let chatId, userId, firstName, isCallback = false;

  if (msgOrQuery.data && msgOrQuery.message) {
    isCallback = true;
    chatId = msgOrQuery.message.chat.id;
    userId = chatId;
    firstName = msgOrQuery.message.chat.first_name;
  } else if (msgOrQuery.chat) {
    chatId = msgOrQuery.chat.id;
    userId = chatId;
    firstName = msgOrQuery.chat.first_name;
  } else {
    console.error('❌ ساختار پیام نامعتبر است');
    return;
  }

  try {
    const user = await User.findOne({ subId: userId });
    if (!user) {
      return bot.sendMessage(chatId, '❌ اطلاعاتی برای شما یافت نشد.');
    }
    
    user.configs.reverse();
    const activeConfigs = user.configs.filter(config => getDaysLeft(config) > 0);
    const expiredConfigs = user.configs.filter(config => getDaysLeft(config) <= 0);

    const expiredConfigToShow = expiredConfigs.slice(0, 1);

    const allConfigs = [...activeConfigs, ...expiredConfigToShow];

    const configsPerPage = 2;
    const totalPages = Math.ceil(allConfigs.length / configsPerPage);
    const start = page * configsPerPage;
    const end = start + configsPerPage;
    const configsToShow = allConfigs.slice(start, end);

    let message = `🧾 اطلاعات حساب شما:\n\n`;
    message += `👤 نام: ${firstName || 'نامشخص'}\n`;
    message += `🆔 آیدی: ${userId}\n`;
    message += `💰 موجودی کیف پول: ${formatCurrency(user.wallet)} تومان\n`;  // نمایش موجودی کیف پول به صورت ۳ رقمی

    if (configsToShow.length === 0) {
      message += '\n⚠️ کانفیگی برای نمایش وجود ندارد.';
    } else {
      message += `\n🔹 کانفیگ‌ها (صفحه ${page + 1} از ${totalPages}):\n`;
      configsToShow.forEach((config, index) => {
        const isExpired = getDaysLeft(config) <= 0;
        message += `\n${start + index + 1}.\n`;
        message += `📛 نام: ${config.name || 'ندارد'}\n`;
        message += `⏳ مدت: ${config.duration || 'ندارد'} ماه\n`;
        message += `📎 لینک:\n\`${config.link || 'ندارد'}\`\n`;
        message += isExpired
          ? `⏰ زمان انقضاء: گذشته\n`
          : `⏰ زمان باقی‌مانده: ${getDaysLeft(config)} روز\n`;
      });
    }

    const buttons = [];
    if (page > 0) {
      buttons.push({ text: '⬅️ صفحه قبل', callback_data: `services_page_${page - 1}` });
    }
    if (end < allConfigs.length) {
      buttons.push({ text: '➡️ مشاهده بیشتر', callback_data: `services_page_${page + 1}` });
    }

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons.length > 0 ? [buttons] : []
      }
    };

    // 👇 اینجا فقط در صورت callback پیام رو edit کن
    if (isCallback) {
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: msgOrQuery.message.message_id,
        ...options
      });
    } else {
      bot.sendMessage(chatId, message, options);
    }
  } catch (err) {
    console.error('❌ خطا در هنگام بازیابی اطلاعات کاربر:', err);
    bot.sendMessage(chatId, '⚠️ خطا در هنگام دریافت اطلاعات.');
  }
}

module.exports = { showMyServices };
