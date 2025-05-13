const axios = require('axios');

/**
 * حذف یک کانفیگ بر اساس UUID
 * @param {string} uuid - همان ID که موقع ساخت کانفیگ ساختی
 * @returns {Promise<void>}
 */
async function deleteConfig(uuid) {
  try {
    const url = `https://wizwiz.zirzaminazad.ir:35766/ZrtvG2CKwMQ7srE/panel/inbound/delClient/${uuid}`;

    const response = await axios.get(url, {
      headers: {
        'Cookie': '3x-ui=MTc0NTM1ODUzNnxEWDhFQVFMX2dBQUJFQUVRQUFCMV80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRUVBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFRdE1iMmRwYmxObFkzSmxkQUVNQUFBQUZQLUNFUUVDQVFWaFpHMXBiZ0VGWVdSdGFXNEF8GJbaa4C6ltzsmS6qbf1xLqG6i2SKadt_36aYbWfkmlM=',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    if (response.data.success) {
      console.log('✅ کانفیگ با موفقیت حذف شد.');
    } else {
      console.log('⚠️ مشکلی در حذف کانفیگ پیش آمد:', response.data);
    }
  } catch (error) {
    console.error('❌ خطا در حذف کانفیگ:', error.message);
  }
}

module.exports = { deleteConfig };
