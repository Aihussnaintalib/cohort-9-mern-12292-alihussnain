
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Before all tests - connect to in-memory database
before(async function() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  try {
    await mongoose.connect(uri);
  } catch (error) {
    await mongoServer.stop();
    throw error;
  }
});

// After each test - clear all collections
afterEach(async function() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// After all tests - disconnect and stop server
after(async function() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  } finally {
    await mongoServer.stop();
  }
});
