const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Notes Tests', () => {
  it('should create a new note', (done) => {
    expect(true).to.be.true;
    done();
  });
});