// models/User.js
const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  link: String,
  name: String,
  duration: Number,
  expiresAt: Date,
  server: String,
  sni: String,
  pbk: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletHistorySchema = new mongoose.Schema({
  type: {
    type: String, // 'deposit' یا 'withdrawal'
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: String
});

const userSchema = new mongoose.Schema({
  subId: {
    type: String,
    required: true,
    unique: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  wallet: {
    type: Number,
    default: 20000,
  },
  configs: [configSchema],

  // 👇 این قسمت رو اضافه کن
  walletHistory: [walletHistorySchema]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
