const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/digitell';

async function testDbConnection() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
    const user = await User.findOne();  // تست گرفتن یک سند از مجموعه
    // console.log('User found:', user);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

testDbConnection();
