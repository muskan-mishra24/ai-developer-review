const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { ERROR_MESSAGES } = require('../config/constants');

const authController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: ERROR_MESSAGES.USER_EXISTS });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user and check password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
