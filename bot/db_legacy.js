// const fs = require('fs');
// const path = require('path');

// const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

// // خواندن اطلاعات کاربران از فایل users.json
// // اصلاح تابع getUser برای بررسی تطابق نوع داده‌ها
// function getUser(userId) {
//   if (!fs.existsSync(usersFilePath)) {
//     console.error("فایل users.json پیدا نشد!");
//     return null;
//   }

//   let users = [];
//   try {
//     users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
//   } catch (error) {
//     console.error("خطا در خواندن داده‌های users.json:", error);
//     return null;
//   }

//   if (!Array.isArray(users)) {
//     console.error("داده‌های فایل users.json باید یک آرایه باشند.");
//     return null;
//   }

//   // مطمئن شوید که مقایسه‌ی شناسه به درستی انجام می‌شود
//   return users.find(user => user.id === parseInt(userId)); // تبدیل userId به عدد
// }


// // ذخیره اطلاعات کاربر در فایل users.json
// function saveUser(userId, userData) {
//   if (!fs.existsSync(usersFilePath)) {
//     console.error("فایل users.json پیدا نشد!");
//     return;
//   }

//   let users = [];
//   try {
//     // اگر فایل خالی است، آرایه‌ای ایجاد می‌کنیم
//     const fileData = fs.readFileSync(usersFilePath, 'utf-8');
//     users = fileData ? JSON.parse(fileData) : [];
//   } catch (error) {
//     console.error("خطا در خواندن داده‌های users.json:", error);
//     return;
//   }

//   if (!Array.isArray(users)) {
//     console.error("داده‌های فایل users.json باید یک آرایه باشند.");
//     return;
//   }

//   const existingUserIndex = users.findIndex(user => user.id === userId);
//   if (existingUserIndex === -1) {
//     // اگر کاربر وجود نداشت، کاربر جدید اضافه می‌کنیم
//     users.push({ id: userId, ...userData });
//   } else {
//     // اگر کاربر وجود داشت، اطلاعاتش رو به‌روز می‌کنیم
//     users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
//   }

//   try {
//     fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
//   } catch (error) {
//     console.error("خطا در ذخیره‌سازی داده‌ها در users.json:", error);
//   }
// }

// module.exports = {
//   getUser,
//   saveUser
// };
