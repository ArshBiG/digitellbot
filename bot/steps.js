const { generateRandomChars } = require('./utils');
const { createConfig } = require('../services/configService');

function handleSteps(bot, msg, sessions) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'خرید سرور') {
    sessions[chatId] = { step: 'get_remark' };
    bot.sendMessage(chatId, 'اسم دلخواهت برای کانفیگ رو وارد کن:');
  } else if (sessions[chatId]?.step === 'get_remark') {
    sessions[chatId].remark = text;
    sessions[chatId].step = 'choose_duration';
    bot.sendMessage(chatId, 'مدت زمان رو انتخاب کن:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '۱ ماهه', callback_data: 'duration_1' }],
          [{ text: '۲ ماهه', callback_data: 'duration_2' }],
          [{ text: '۳ ماهه', callback_data: 'duration_3' }]
        ]
      }
    });
  }
}

async function handleCallback(bot, query, sessions) {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith('duration_')) {
    const durationMonths = parseInt(data.split('_')[1]);
    const remark = sessions[chatId]?.remark;
    const random = generateRandomChars();
    const finalRemark = `${remark}${random}`;
    const configRemark = `hih-${finalRemark}`;

    try {
      const { link, qrBuffer } = await createConfig(durationMonths, finalRemark, configRemark);
      bot.sendPhoto(chatId, qrBuffer, {
        caption: `✅ کانفیگ ساخته شد:\n${link}`
      });
    } catch (err) {
      console.error('Error:', err.response?.data || err);
      bot.sendMessage(chatId, '❌ خطا در ساخت کانفیگ');
    }
  }
}

module.exports = { handleSteps, handleCallback };
