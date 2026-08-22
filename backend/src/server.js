require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[SevaAI Backend API] Server running on port ${PORT}`);
    });

    const shutdown = () => {
      console.log('[SevaAI] Received termination signal. Closing server...');
      server.close(() => process.exit(0));
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (err) {
    console.error('[SevaAI] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
