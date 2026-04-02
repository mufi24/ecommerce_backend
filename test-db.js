const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('Connection string (masked):', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    console.log('\nPossible solutions:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas Network Access');
    console.log('2. Verify your username and password are correct');
    console.log('3. Check if your network allows outbound connections on port 27017');
    console.log('4. Try using a VPN if on a restricted network');
    process.exit(1);
  });
