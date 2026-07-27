
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Notes CRUD Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456'
  };

  // Helper to create a user and get token
  const createUserAndGetToken = (done) => {
    request(app)
      .post('/api/auth/signup')
      .send(testUser)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        done(null, res.body.token);
      });
  };

  describe('POST /api/notes', () => {
    it('should create a new note', (done) => {
      createUserAndGetToken((err, token) => {
        if (err) return done(err);
        request(app)
          .post('/api/notes')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Test Note', content: 'Test content' })
          .expect(201)
          .end((err2, res) => {
            if (err2) return done(err2);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('title', 'Test Note');
            done();
          });
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
      createUserAndGetToken((err, token) => {
        if (err) return done(err);
        request(app)
          .get('/api/notes')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .end((err2, res) => {
            if (err2) return done(err2);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            done();
          });
      });
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should get a single note', (done) => {
      createUserAndGetToken((err, token) => {
        if (err) return done(err);
        // First create a note
        request(app)
          .post('/api/notes')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Test Note', content: 'Test content' })
          .expect(201)
          .end((err2, res) => {
            if (err2) return done(err2);
            const noteId = res.body.data._id;
            // Then get the note
            request(app)
              .get(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .end((err3, res2) => {
                if (err3) return done(err3);
                expect(res2.body).to.have.property('success', true);
                expect(res2.body.data).to.have.property('_id', noteId);
                done();
              });
          });
      });
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', (done) => {
      createUserAndGetToken((err, token) => {
        if (err) return done(err);
        // First create a note
        request(app)
          .post('/api/notes')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Test Note', content: 'Test content' })
          .expect(201)
          .end((err2, res) => {
            if (err2) return done(err2);
            const noteId = res.body.data._id;
            // Then update the note
            request(app)
              .put(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${token}`)
              .send({ title: 'Updated Title' })
              .expect(200)
              .end((err3, res2) => {
                if (err3) return done(err3);
                expect(res2.body).to.have.property('success', true);
                expect(res2.body.data).to.have.property('title', 'Updated Title');
                done();
              });
          });
      });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', (done) => {
      createUserAndGetToken((err, token) => {
        if (err) return done(err);
        // First create a note
        request(app)
          .post('/api/notes')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Test Note', content: 'Test content' })
          .expect(201)
          .end((err2, res) => {
            if (err2) return done(err2);
            const noteId = res.body.data._id;
            // Then delete the note
            request(app)
              .delete(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .end((err3, res2) => {
                if (err3) return done(err3);
                expect(res2.body).to.have.property('success', true);
                expect(res2.body).to.have.property('message', 'Note deleted successfully');
                done();
              });
          });
      });
    });
  });
});
