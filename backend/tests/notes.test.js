const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Notes CRUD Tests', () => {
  let token;
  let noteId;
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: '123456'
  };
  
  // Second user for ownership tests
  const testUser2 = {
    name: 'Test User 2',
    email: `test2_${Date.now()}@example.com`,
    password: '123456'
  };
  let token2;

  before(async function() {
    // Signup first user
    const res1 = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    token = res1.body.token;

    // Signup second user
    const res2 = await request(app)
      .post('/api/auth/signup')
      .send(testUser2);
    token2 = res2.body.token;
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
          expect(res.body.data).to.have.property('user').that.is.a('string');
          noteId = res.body.data._id;
          done();
        });
    });

    it('should return 400 for invalid content (empty)', (done) => {
      request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '', content: '' })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Please provide a valid title');
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
    it('should get all notes for authenticated user', (done) => {
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
    it('should get a single note by owner', (done) => {
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
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Note not found');
          done();
        });
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note by owner', (done) => {
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

    it('should return 404 when another user tries to update', (done) => {
      request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked Title' })
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Note not found');
          done();
        });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note by owner', (done) => {
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

    it('should return 404 when another user tries to delete', (done) => {
      // First create another note
      request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Another Note', content: 'Another content' })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          const newNoteId = res.body.data._id;
          // Try to delete with second user's token
          request(app)
            .delete(`/api/notes/${newNoteId}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(404)
            .end((err2, res2) => {
              if (err2) return done(err2);
              expect(res2.body).to.have.property('message', 'Note not found');
              done();
            });
        });
    });
  });
});