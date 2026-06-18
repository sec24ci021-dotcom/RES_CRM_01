/**
 * Database Configuration
 * Handles MongoDB connection setup and configuration
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async() => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-crm';

        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            w: 'majority'
        });

        logger.info('✅ MongoDB Connected Successfully');
        logger.info(`📍 Database: ${mongoURI}`);
        logger.info(`🔌 Connection Status: ${connection.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

        return connection;
    } catch (error) {
        logger.error('❌ MongoDB Connection Error:', error.message);
        logger.warn('⏳ Retrying connection in 5 seconds...');

        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

const disconnectDB = async() => {
    try {
        await mongoose.disconnect();
        logger.info('✅ MongoDB Disconnected Successfully');
    } catch (error) {
        logger.error('❌ Error disconnecting from MongoDB:', error.message);
    }
};

const getDBStatus = () => {
    const readyState = mongoose.connection.readyState;
    const states = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    return states[readyState] || 'Unknown';
};

module.exports = {
    connectDB,
    disconnectDB,
    getDBStatus
};
