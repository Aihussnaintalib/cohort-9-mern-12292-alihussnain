
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
          expect(res.body.user).to.have.property('email', testUser.email);
          done();
        });
    });

    it('should return 400 if user already exists', (done) => {
      request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'User already exists');
          done();
        });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should return 401 for invalid credentials', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Invalid credentials');
          done();
        });
    });
  });
});
