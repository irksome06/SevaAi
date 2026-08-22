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
