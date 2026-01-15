const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.db.databaseName}`);
    } catch (error) {
        console.error('MongoDB Atlas connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;