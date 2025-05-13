// تابع محاسبه روزهای باقی‌مانده از تاریخ انقضا
function getDaysLeft(config) {
    const now = Date.now();
    const millisLeft = config.expiresAt - now;
    const daysLeft = Math.ceil(millisLeft / (1000 * 60 * 60 * 24)); // تبدیل میلی‌ثانیه به روز
    return daysLeft;
  }
  
  module.exports = { getDaysLeft };
  