
const jwt = require('jsonwebtoken');

// Validate JWT_SECRET at module load
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined. Please check your .env file.');
}

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const verifyToken = (token) => {
  // Explicitly restrict to HS256 algorithm
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
};

module.exports = { generateToken, verifyToken };
