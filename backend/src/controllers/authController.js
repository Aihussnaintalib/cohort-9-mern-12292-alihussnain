const User = require('../models/User');
const { generateToken } = require('../utils/jwt');


const validateEmail = (email) => {
 
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

// Safe error handler
const handleError = (res, error) => {
  console.error(error); // Log original error for debugging
  
  // Duplicate key error
  if (error.code === 11000) {
    return res.status(409).json({ message: 'User already exists' });
  }
  
  // Validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error' });
  }
  
  // Default server error (no raw error message exposed)
  return res.status(500).json({ message: 'Internal server error' });
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    handleError(res, error);
    console.error(error);
    next(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    handleError(res, error);
  }
};

const logout = (req, res) => {
  // Token invalidation handled client-side for now
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { signup, login, logout };
