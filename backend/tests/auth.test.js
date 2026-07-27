const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Authentication Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456'
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user', (done) => {
      request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });
});