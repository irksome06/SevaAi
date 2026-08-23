const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function startDevServerWithMemoryMongo() {
  try {
    console.log('====================================================');
    console.log('[SevaAI] Starting embedded in-memory MongoDB for local dev...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to in-memory database at: ${uri}`);
    
    // Seed default demo citizen accounts for development & testing
    const User = require('./models/User');
    const demoAccounts = [
      {
        fullName: 'Aarav Sharma',
        email: 'citizen@sevaai.gov.in',
        phone: '+919876543210',
        password: 'Password123!',
        preferredLanguage: 'en',
        isVerified: true,
        location: {
          state: 'Maharashtra',
          city: 'Mumbai',
          district: 'Mumbai City',
          pincode: '400001',
          address: 'Flat 402, Samruddhi Apts, Nariman Point',
        },
      },
      {
        fullName: 'Priya Patel',
        email: 'demo@sevaai.gov.in',
        phone: '+919812345678',
        password: 'Password123!',
        preferredLanguage: 'hi',
        isVerified: true,
        location: {
          state: 'Gujarat',
          city: 'Ahmedabad',
          district: 'Ahmedabad',
          pincode: '380001',
          address: '14 Gandhi Ashram Marg',
        },
      },
    ];

    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
      }
    }
    console.log('[MongoDB] Seeded default citizen demo accounts (citizen@sevaai.gov.in / Password123!)');
    console.log('====================================================');

    const server = app.listen(PORT, () => {
      console.log(`[SevaAI Backend API] Server running on http://localhost:${PORT}`);
      console.log(`[SevaAI Health] http://localhost:${PORT}/api/health`);
      console.log(`[SevaAI Auth]   http://localhost:${PORT}/api/auth`);
      console.log('====================================================');
    });

    const shutdown = async () => {
      console.log('\n[SevaAI] Shutting down...');
      server.close();
      await mongoose.disconnect();
      await mongoServer.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[SevaAI] Startup failed:', err);
    process.exit(1);
  }
}

startDevServerWithMemoryMongo();
