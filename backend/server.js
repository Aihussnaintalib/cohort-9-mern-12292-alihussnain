const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/config/logger');
const pinoHttp = require('pino-http');

const app = express();
const PORT = process.env.PORT || 5000;


// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};


// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));


app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);


// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/health', (req, res) => {
  logger.debug('Health check endpoint called');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});


app.use(errorHandler);


const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        try {
          await mongoose.disconnect();
          logger.info('MongoDB disconnected');
        } catch (error) {
          logger.error(`Shutdown error: ${error.message}`);
        } finally {
          logger.info('Server closed');
          process.exit(0);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
// Start server ONLY after database connects
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};


// Only start if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;