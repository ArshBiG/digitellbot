const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/users.json');

function readUsers() {
  if (!fs.existsSync(filePath)) return {};
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data || '{}');
}

function writeUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

function saveUser(userId, info) {
  const users = readUsers();
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      name: info.name,
      joinedAt: new Date().toISOString(),
      wallet: 0,
      configs: []
    };
    writeUsers(users);
  }
}

function getUser(userId) {
  const users = readUsers();
  return users[userId] || null;
}

module.exports = {
  saveUser,
  getUser
};
