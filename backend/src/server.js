require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully to Atlas!'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');



// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[SevaAI Backend API] Server running on port ${PORT}`);
      console.log(`[SevaAI Health] http://localhost:${PORT}/api/health`);
      console.log(`[SevaAI Auth]   http://localhost:${PORT}/api/auth`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[SevaAI] Received termination signal. Closing server...');
      server.close(() => {
        console.log('[SevaAI] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[SevaAI] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
