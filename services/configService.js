const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const qrcode = require('qrcode');
// const { generateSubId } = require('../bot/utils');
const User = require('../models/User');


async function createConfig(subId, durationMonths, finalRemark, configRemark, totalGB = 0) {
  const expiryTime = Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000;
  const uuid = uuidv4();
  // const subId = generateSubId();
  
  const payload = {
    id: 2,
    settings: JSON.stringify({
      clients: [{
        id: uuid,
        flow: "",
        email: finalRemark,
        limitIp: 0,
        totalGB,
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
    'https://sarzaminshad.zirzaminazad.ir:56766/digitell/xui/inbound/addClient',
    payload,
    {
      headers: {
        'Cookie': 'x-ui=MTc0Njk4Mjk3OXxEWDhFQVFMX2dBQUJFQUVRQUFCbF80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRURBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFBQVVfNElSQVFJQkJXRmtiV2x1QVFWaFpHMXBiZ0E9fC85sApR-BFXYkZI9XjZkzhBIl2_31v-fGmCw2G3twIF',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true
    }
  ).catch(err => {
    console.error('❌ خطا در ارسال درخواست:', err.response ? err.response.data : err.message);
  });
  
  // console.log('✅ پاسخ سرور:', res ? res.data : 'بدون پاسخ');
  const sanitizedConfigRemark = configRemark ? encodeURIComponent(configRemark) : '';
  const sid = '1175519234';
  const link = `vless://${uuid}@sarzaminshad.zirzaminazad.ir:31531?type=tcp&security=reality&pbk=ZyMesTo3XD2JDoNwuUndCohohEYdumNW7BJILq6wtGY&fp=firefox&sni=speedtest.net&sid=${sid}&spx=%2F#${sanitizedConfigRemark}`;
  const linkv6 = `vless://${uuid}@[2a01:4f8:1c1e:597b::1]:31531?type=tcp&security=reality&pbk=ZyMesTo3XD2JDoNwuUndCohohEYdumNW7BJILq6wtGY&fp=firefox&sni=speedtest.net&sid=${sid}&spx=%2F#${sanitizedConfigRemark}`;
  const qr = await qrcode.toDataURL(link);
  const qrBuffer = Buffer.from(qr.split(",")[1], 'base64');

  let user = await User.findOne({ subId });
  if (!user) {
    user = new User({ subId });
  }

  // اضافه کردن کانفیگ
  user.configs.push({
    link,
    name: finalRemark,
    duration: durationMonths,
    expiresAt: new Date(expiryTime),
    server: 'sarzaminshad.zirzaminazad.ir:31531',
    sni: 'speedtest.net',
    pbk: 'ZyMesTo3XD2JDoNwuUndCohohEYdumNW7BJILq6wtGY',
  });

  await user.save();

  return {linkv6, link, qrBuffer };
}

module.exports = { createConfig };
