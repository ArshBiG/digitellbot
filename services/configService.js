const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const qrcode = require('qrcode');
const { generateSubId } = require('../bot/utils');
const { saveUser, getUser } = require('./db'); // اضافه کردن این برای دسترسی به داده‌های کاربران

async function createConfig(userId, durationMonths, finalRemark, configRemark) {
  const expiryTime = Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000;
  const uuid = uuidv4();
  const subId = generateSubId();

  const payload = {
    id: 1,
    settings: JSON.stringify({
      clients: [{
        id: uuid,
        flow: "",
        email: finalRemark,
        limitIp: 0,
        totalGB: 0,
        expiryTime,
        enable: true,
        tgId: "",
        subId,
        comment: "",
        reset: 0
      }]
    })
  };

  const res = await axios.post(
    'https://wizwiz.zirzaminazad.ir:35766/ZrtvG2CKwMQ7srE/panel/inbound/addClient',
    payload,
    {
      headers: {
        'Cookie': '3x-ui=MTc0NTM1ODUzNnxEWDhFQVFMX2dBQUJFQUVRQUFCMV80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRUVBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFRdE1iMmRwYmxObFkzSmxkQUVNQUFBQUZQLUNFUUVDQVFWaFpHMXBiZ0VGWVdSdGFXNEF8GJbaa4C6ltzsmS6qbf1xLqG6i2SKadt_36aYbWfkmlM=',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true
    }
  );

  const configLink = `vless://${uuid}@wizwiz.zirzaminazad.ir:14471?security=reality&encryption=none&pbk=8MaLF7JzqSRPy8neJk4pOaxAqU6_8sYA6lYtJttaiEU&fp=firefox&spx=/&type=tcp&sni=microsoft.com&sid=8c1209d2ba6a7e#${encodeURIComponent(configRemark)}`;
  const qr = await qrcode.toDataURL(configLink);
  const qrBuffer = Buffer.from(qr.split(",")[1], 'base64');

  // حالا باید این لینک را به کاربر ذخیره کنیم
  const user = getUser(userId);
  if (user) {
    const newConfig = {
      name: configRemark,
      country: "نامشخص", // اگر کشور مربوطه را دارید، می‌توانید آن را اضافه کنید.
      duration: durationMonths, 
      link: configLink
    };
    user.configs.push(newConfig);
    saveUser(userId, user); // ذخیره کردن تغییرات در فایل JSON
  }

  return { link: configLink, qrBuffer };
}

module.exports = { createConfig };
