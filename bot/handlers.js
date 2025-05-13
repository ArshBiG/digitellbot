const steps = require('./steps');
const { showMyServices } = require('./myServices');
const { showWalletBalance } = require('./wallet');
const {
  handleAddWallet,
  processAmount,
  handleScreenshot,
  handleApproval,
  handleRejection
} = require('./addWallet');
const User = require('../models/User');
const { handleAdminAddMoney } = require('./adminAddMoney');
const support = require('./supportHandler');
const { handleTutorialsCallback } = require('./tutorialHandler');
const { handleShowUser, handleShowUserCallback } = require('./showUserHandler');


module.exports = function (bot) {
  const userSessions = {};

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    if (!userSessions[chatId]) userSessions[chatId] = {};

    const existingUser = await User.findOne({ subId: chatId });
    if (!existingUser) {
      const newUser = new User({ subId: chatId, joinedAt: new Date() });
      await newUser.save();
      console.log(`New user saved: ${chatId}`);
    }

    bot.sendMessage(chatId, `سلام رفیق! 👋  
برای شروع، بهتره اول سرویس تست رایگان رو امتحان کنی تا کیفیت رو خودت بسنجی ✅  
بعدش هم هر موقع خواستی می‌تونی از همینجا خرید کنی یا سوالی داشتی از پشتیبانی بپرس 😉`, {
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
  });

  bot.onText(/\/addmonyclient (\d+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const adminId = 5054082689;

    if (chatId !== adminId) {
      return bot.sendMessage(chatId, '❌ شما اجازه استفاده از این دستور را ندارید.');
    }

    const targetUserId = match[1];
    const amount = parseInt(match[2]);
    await handleAdminAddMoney(bot, chatId, targetUserId, amount);
  });

  bot.onText(/\/showuser (\d+)/, (msg, match) => {
    handleShowUser(bot, msg, match);
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!userSessions[chatId]) userSessions[chatId] = {};

    if (userSessions[chatId]?.state === 'waiting_for_amount') {
      return processAmount(bot, msg, userSessions);
    }

    if (userSessions[chatId]?.state === 'waiting_for_screenshot') {
      return handleScreenshot(bot, msg, userSessions);
    }

    if (userSessions[chatId]?.state?.startsWith('responding_to_')) {
      const userId = userSessions[chatId].state.split('_')[2];
      handleAdminResponse(bot, msg, userId);
      userSessions[chatId].state = undefined;
      return;
    }
    support.handleSupportMessage(bot, msg);
    support.handleAdminReply(bot, msg);

    steps.handleSteps(bot, msg, userSessions);
  });


  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
  
    if (!userSessions[chatId]) userSessions[chatId] = {};
  
    if (data.startsWith('services_page_')) {
      const page = parseInt(data.split('_')[2], 10);
      showMyServices(bot, query, page);
    } else if (data.startsWith('showuser_')) {
      return handleShowUserCallback(bot, query);
    } else if (data === 'buy_server') {
      const fakeMsg = { chat: { id: chatId }, text: 'خرید سرور' };
      steps.handleSteps(bot, fakeMsg, userSessions);
    } else if (data === 'my_services') {
      showMyServices(bot, query, 0);
    } else if (data === 'my_wallet') {
      showWalletBalance(bot, chatId);
    } else if (data === 'add_wallet') {
      userSessions[chatId].state = 'waiting_for_amount';
      const fakeMsg = { chat: { id: chatId }, text: '' };
      handleAddWallet(bot, fakeMsg, userSessions);
    } else if (data.startsWith('approve_')) {
      const [, userChatId, amount] = data.split('_');
      await handleApproval(bot, userChatId, parseInt(amount));
      bot.answerCallbackQuery(query.id, { text: '✅ تایید شد.' });
    } else if (data.startsWith('reject_')) {
      const [, userChatId] = data.split('_');
      await handleRejection(bot, userChatId);
      bot.answerCallbackQuery(query.id, { text: '❌ رد شد.' });
    } else if (data === 'support') {
      support.handleSupportRequest(bot, query.message);
      return;
    } else if (data === 'support_request') {
      support.handleSupportCallback(bot, query);
      return;
    } else if (data.startsWith('reply_to_user_')) {
      support.handleReplyToUser(bot, query);
      return;
    } else if (data === 'tutorials') {
      handleTutorialsCallback(bot, query);
      return;
    } else {
      steps.handleCallback(bot, query, userSessions);
    }
  });
};
