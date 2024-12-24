require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB');
        
        // Test creating a collection
        const testCollection = mongoose.connection.collection('test');
        await testCollection.insertOne({ test: 'connection' });
        console.log('✅ Successfully inserted test document');
        
        // Clean up
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Successfully cleaned up test document');
        
        await mongoose.connection.close();
        console.log('✅ Successfully closed MongoDB connection');
        
    } catch (error) {
        console.error('❌ MongoDB connection test failed:', error);
    }
}

testConnection();
