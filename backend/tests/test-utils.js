const request = require('supertest');
const app = require('../server');

// Helper to signup and get token
const signupAndGetToken = async (user) => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send(user)
    .expect(201);
  if (!res.body.token) {
    throw new Error('Failed to obtain token');
  }
  return res.body.token;
};

  
  if (!res.body.token) {
    throw new Error('Failed to obtain token');
  }
  
  return res.body.token;
};

// Helper to create unique user
const createUniqueUser = () => ({
  name: 'Test User',
  email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}@example.com`,
  password: '123456'
});

module.exports = { signupAndGetToken, createUniqueUser };
module.exports = {
  signupAndGetToken,
  createUniqueUser
};
