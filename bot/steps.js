const { generateRandomChars } = require('../utils/utils');
const { createConfig } = require('../services/configService');
const User = require('../models/User');

const {
  processAmount,
  handleCardNumber,
  handleScreenshot
} = require('./addWallet');

async function handleSteps(bot, msg, sessions) {
  const chatId = msg.chat.id;
  const text = msg.text;

  const session = sessions[chatId];
  const state = session?.state;
  const step = session?.step;

  if (text === 'خرید سرور') {
    sessions[chatId] = { step: 'choose_duration' };
    bot.sendMessage(chatId, '⏳ مدت زمان سرویس رو انتخاب کن:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '1 ماهه - ۱۰۰,۰۰۰ تومان', callback_data: 'duration_1' }],
          [{ text: '2 ماهه - ۱۷۰,۰۰۰ تومان', callback_data: 'duration_2' }],
          [{ text: '3 ماهه - ۲۵۰,۰۰۰ تومان', callback_data: 'duration_3' }],
          [{ text: '📦 سرویس‌های حجمی', callback_data: 'volume_service' }],
          [{ text: '❌ پشیمون شدم', callback_data: 'cancel' }]
        ]
      }
    });    

  // افزایش موجودی
  } else if (state === 'waiting_for_amount') {
    processAmount(bot, msg, sessions);

  } else if (state === 'waiting_for_card_number') {
    handleCardNumber(bot, msg, sessions);

  } else if (state === 'waiting_for_screenshot') {
    handleScreenshot(bot, msg, sessions);

  // مرحله دوم: گرفتن اسم کانفیگ
  } else if (step === 'get_remark') {
    session.remark = text;
    session.step = null;
    handleFinalStep(bot, chatId, sessions);

  } else if (step === 'enter_volume') {
    const volume = parseInt(text);
    if (isNaN(volume) || volume < 5 || volume > 200) {
      return bot.sendMessage(chatId, '⛔ لطفاً فقط عددی بین 5 تا 200 وارد کن.');
    }

    const price = volume * 800;

    try {
      const user = await User.findOne({ subId: chatId });
      if (!user) {
        return bot.sendMessage(chatId, '❗ حساب کاربری پیدا نشد.');
      }

      if (user.wallet < price) {
        sessions[chatId] = null;
        return bot.sendMessage(chatId, `❌ موجودی کافی نیست. قیمت: ${price.toLocaleString()} تومان\nموجودی شما: ${user.wallet.toLocaleString()} تومان\nلطفاً کیف پول خود را شارژ کنید.`);
      }

      sessions[chatId] = {
        ...sessions[chatId],
        duration: 1,
        price,
        volume,
        step: 'get_remark'
      };

      return bot.sendMessage(chatId, `💰 قیمت نهایی: ${price.toLocaleString()} تومان\n📝 لطفاً اسم دلخواهت برای کانفیگ رو وارد کن:`, {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ پشیمون شدم', callback_data: 'cancel' }]]
        }
      });
    } catch (err) {
      console.error('❌ خطا در بررسی موجودی یا کاربر:', err);
      return bot.sendMessage(chatId, '⚠️ خطا در بررسی حساب یا موجودی.');
    }
  }
}

async function handleCallback(bot, query, sessions) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (data === 'cancel') {
    sessions[chatId] = null;
    return bot.sendMessage(chatId, '✅ عملیات لغو شد. برگشتی به منوی اصلی.', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 کیف پول', callback_data: 'my_wallet' },
            { text: '💻 خرید سرور', callback_data: 'buy_server' },
          ],
          [
            { text: '💬 پشتیبانی', callback_data: 'support' },
            { text: '📚 آموزش‌ها', callback_data: 'tutorials' },
          ],
          [{ text: '🧾 سرویس‌های من', callback_data: 'my_services' }],
        ]
      }
    });
  }

  if (data === 'volume_service') {
    sessions[chatId] = { step: 'enter_volume' };
    return bot.sendMessage(chatId, '📦 لطفاً حجم مورد نظر رو وارد کن (عدد بین 5 تا 200 گیگ):');
  }

  if (data.startsWith('duration_')) {
    const durationMonths = parseInt(data.split('_')[1]);
    const prices = {
      1: 100000,
      2: 170000,
      3: 250000
    };

    const price = prices[durationMonths];
    if (!price) {
      return bot.sendMessage(chatId, '⛔ مدت زمان انتخاب‌شده معتبر نیست.');
    }

    try {
      const user = await User.findOne({ subId: userId });
      if (!user) {
        return bot.sendMessage(chatId, '❗ حساب کاربری شما پیدا نشد.');
      }

      if (user.wallet < price) {
        delete sessions[chatId];
        return bot.sendMessage(chatId, `❌ موجودی کافی نیست. موجودی فعلی شما: ${user.wallet.toLocaleString()} تومان\nلطفاً کیف پول خود را شارژ کنید.`);
      }

      sessions[chatId] = {
        ...sessions[chatId],
        duration: durationMonths,
        price,
        step: 'get_remark'
      };

      bot.sendMessage(chatId, '📝 لطفاً اسم دلخواهت برای کانفیگ رو وارد کن:', {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ پشیمون شدم', callback_data: 'cancel' }]]
        }
      });
    } catch (err) {
      console.error('❌ خطا در بررسی کاربر:', err);
      bot.sendMessage(chatId, '⚠️ خطا در بررسی حساب کاربری');
    }
  }
}

async function handleFinalStep(bot, chatId, sessions) {
  const session = sessions[chatId];
  const userId = chatId;
  const { remark, duration, price, volume } = session;
  const totalGB = volume * 1024 ** 3;
  const displayVolume = volume;

  const random = generateRandomChars();
  const finalRemark = `${remark}${random}`;
  const configRemark = `vdigitell-${finalRemark}`;

  try {
    const user = await User.findOne({ subId: userId });

    user.wallet -= price;
    user.walletHistory.push({
      type: 'withdrawal',
      amount: price,
      date: new Date(),
      description: `خرید سرویس با نام ${remark} (${duration} ماهه، ${displayVolume} گیگ)`,
    });
    await user.save();

    const { link, linkv6, qrBuffer } = await createConfig(userId.toString(), duration, finalRemark, configRemark, totalGB);

    bot.sendPhoto(chatId, qrBuffer, {
      caption: `✅ کانفیگ ساخته شد:\n${link}`
    });

    sessions[chatId] = null;
  } catch (err) {
    console.error('❌ خطا در ساخت کانفیگ:', err.response?.data || err);
    bot.sendMessage(chatId, '⚠️ خطا در ساخت کانفیگ');
  }
}

module.exports = { handleSteps, handleCallback };
