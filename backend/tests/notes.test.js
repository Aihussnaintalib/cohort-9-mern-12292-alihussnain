const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const { signupAndGetToken, createUniqueUser } = require('./test-utils');

describe('Notes CRUD Tests', () => {
  let token;
  let token2;
  let noteId;

  before(async function() {
    try {
      const user1 = createUniqueUser();
      const user2 = createUniqueUser();
      token = await signupAndGetToken(user1);
      token2 = await signupAndGetToken(user2);
    } catch (error) {
      throw new Error(`Setup failed: ${error.message}`);
    }
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
          expect(res.body.data).to.have.property('content', 'Test content');
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

    it('should return 400 for invalid content', (done) => {
      request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ', content: '   ' })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message');
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

    it('should return 403 when another user tries to access the note', (done) => {
      request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Not authorized');
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

    it('should return 403 when another user tries to update', (done) => {
      request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked Title' })
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Not authorized');
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

    it('should return 403 when another user tries to delete', (done) => {
      // Create a note as first user
      request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Another Note', content: 'Content' })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          const noteId2 = res.body.data._id;
          request(app)
            .delete(`/api/notes/${noteId2}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403)
            .end((err2, res2) => {
              if (err2) return done(err2);
              expect(res2.body).to.have.property('message', 'Not authorized');
              done();
            });
        });
    });
  });
});