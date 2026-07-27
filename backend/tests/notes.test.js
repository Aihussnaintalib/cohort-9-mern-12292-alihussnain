
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Notes CRUD Tests', () => {
  let token;
  let noteId;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456'
  };

  before(async function() {
    // Signup user first
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    token = res.body.token;
  });

  describe('POST /api/notes', () => {
    it('should create a new note', (done) => {
      request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: 'Test content' })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('title', 'Test Note');
          noteId = res.body.data._id;
          done();
        });
    });

    it('should return 401 without token', (done) => {
      request(app)
        .post('/api/notes')
        .send({ title: 'Test Note', content: 'Test content' })
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Not authorized, no token');
          done();
        });
    });
  });

  describe('GET /api/notes', () => {
    it('should get all notes', (done) => {
      request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should get a single note', (done) => {
      request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('_id', noteId);
          done();
        });
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', (done) => {
      request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('title', 'Updated Title');
          done();
        });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', (done) => {
      request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Note deleted successfully');
          done();
        });
    });
  });
});
