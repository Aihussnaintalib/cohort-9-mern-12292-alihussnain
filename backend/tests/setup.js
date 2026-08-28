
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

before(async function() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (error) {
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.error('Failed to start test database:', error);
    throw error;
  }
});

afterEach(async function() {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } catch (error) {
    console.error('Failed to clear collections:', error);
    throw error;
  }
});

after(async function() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});
