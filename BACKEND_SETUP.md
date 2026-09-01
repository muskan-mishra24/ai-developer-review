# Backend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB
- PostgreSQL with pgvector extension
- Redis

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Database credentials
- JWT secret
- API keys for LLM service
- GitHub token
- Redis connection details

### 3. Database Setup

#### MongoDB
```bash
# Start MongoDB (if running locally)
mongod
```

#### PostgreSQL
```bash
# Create database
createdb ai-developer-review

# Enable pgvector extension
psql -d ai-developer-review -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

#### Redis
```bash
# Start Redis (if running locally)
redis-server
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

### Repositories
- `POST /api/repositories` - Create a new repository
- `GET /api/repositories` - Get all repositories
- `GET /api/repositories/:id` - Get repository by ID
- `PUT /api/repositories/:id` - Update repository
- `DELETE /api/repositories/:id` - Delete repository

### Reviews
- `POST /api/reviews` - Create a code review
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Project Structure

```
backend/
├── config/              # Configuration files
│   ├── constants.js     # Constants and enums
│   └── database.js      # Database connection
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── repositoryController.js
│   └── reviewController.js
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication
│   └── errorHandler.js  # Error handling
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Repository.js
│   └── Review.js
├── routes/              # API routes
│   ├── auth.js
│   ├── repositories.js
│   └── reviews.js
└── services/            # Business logic
    ├── codeReviewService.js  # Code analysis
    └── ragService.js         # RAG operations
```

## TODO: Additional Implementation

The following features need to be implemented:

1. **LLM Integration**
   - Connect to OpenAI or other LLM providers
   - Implement code analysis using LLM

2. **RAG (Retrieval-Augmented Generation)**
   - Implement vector embeddings
   - Set up pgvector for semantic search
   - Build RAG pipeline for codebase Q&A

3. **GitHub Integration**
   - Implement GitHub OAuth
   - Pull request integration
   - Repository webhook handling

4. **Job Queue**
   - Set up BullMQ for async code reviews
   - Implement review job processing

5. **Testing**
   - Unit tests for controllers
   - Integration tests for API endpoints
   - E2E tests for workflows

6. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Developer guide
   - Deployment guide

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Verify pgvector extension is installed
- Check POSTGRESQL_URI in `.env`

### Redis Connection Error
- Ensure Redis is running: `redis-server`
- Check REDIS_HOST and REDIS_PORT in `.env`

### Port Already in Use
Change the PORT in `.env` or kill the process using the port.

## Development Tips

- Use `npm run dev` during development for automatic reload
- Check logs in the terminal for debugging
- Use Postman or VS Code REST Client for API testing
- Enable SQL logging for debugging database queries
