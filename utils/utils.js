const crypto = require('crypto');

function generateSubId(length = 16) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function generateRandomChars() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 2; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = { generateSubId, generateRandomChars };
