require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./backend/routes/auth');
const repositoryRoutes = require('./backend/routes/repositories');
const reviewRoutes = require('./backend/routes/reviews');const analysisRoutes = require('./backend/routes/analysis')
// Import middleware
const errorHandler = require('./backend/middleware/errorHandler');
const { authenticate } = require('./backend/middleware/auth');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(mongoSanitize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', authenticate, repositoryRoutes);
app.use('/api/reviews', authenticate, reviewRoutes);app.use('/api/analysis', authenticate, analysisRoutes)
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
