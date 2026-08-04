const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const { signupAndGetToken, createUniqueUser } = require('./test-utils');

describe('Authentication Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', (done) => {
      const testUser = createUniqueUser();
      request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body.token).to.be.a('string').and.not.empty;
          expect(res.body.user).to.have.property('email', testUser.email);
          done();
        });
    });

    it('should return 400 if user already exists', (done) => {
      const testUser = createUniqueUser();
      request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err) => {
          if (err) return done(err);
          request(app)
            .post('/api/auth/signup')
            .send(testUser)
            .expect(400)
            .end((err2, res) => {
              if (err2) return done(err2);
              expect(res.body).to.have.property('message', 'User already exists');
              done();
            });
        });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', (done) => {
      const testUser = createUniqueUser();
      request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err) => {
          if (err) return done(err);
          request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200)
            .end((err2, res) => {
              if (err2) return done(err2);
              expect(res.body).to.have.property('success', true);
              expect(res.body.token).to.be.a('string').and.not.empty;
              done();
            });
        });
    });

    it('should return 401 for invalid credentials', (done) => {
      const testUser = createUniqueUser();
      request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err) => {
          if (err) return done(err);
          request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' })
            .expect(401)
            .end((err2, res) => {
              if (err2) return done(err2);
              expect(res.body).to.have.property('message', 'Invalid credentials');
              done();
            });
        });
    });
  });
});