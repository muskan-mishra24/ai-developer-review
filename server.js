require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./backend/routes/auth');
const repositoryRoutes = require('./backend/routes/repositories');
const reviewRoutes = require('./backend/routes/reviews');
const analysisRoutes = require('./backend/routes/analysis')
const ragRoutes = require('./backend/routes/rag')
// Import middleware
const errorHandler = require('./backend/middleware/errorHandler');
const { authenticate } = require('./backend/middleware/auth');

// Import services
const ragService = require('./backend/services/ragService');

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
app.use('/api/reviews', authenticate, reviewRoutes);
app.use('/api/analysis', authenticate, analysisRoutes)
app.use('/api/rag', authenticate, ragRoutes)
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize RAG system
  try {
    const ragInitialized = await ragService.initialize();
    if (ragInitialized) {
      console.log('RAG system ready for queries');
    }
  } catch (error) {
    console.warn('RAG system initialization warning:', error.message);
  }
});

module.exports = app;
