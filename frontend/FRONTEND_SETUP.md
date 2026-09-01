# Frontend Setup Guide

## Project Overview
This is a React frontend for the AI Developer Review application, built with Vite and Tailwind CSS.

## Requirements
- Node.js 16+
- npm or yarn

## Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Configure the following variables:
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Server will run on `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable React components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/            # Page components
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── RepositoryDetail.jsx # Repository details
│   │   ├── ReviewResults.jsx   # Review results display
│   │   └── CodebaseQA.jsx      # Q&A interface
│   ├── services/         # API and external services
│   │   └── api.js              # Axios API client
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   └── main.jsx          # React entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
├── postcss.config.js     # PostCSS config
└── package.json          # Dependencies
```

## Features

### Pages & Components

1. **Authentication**
   - Login page with email/password
   - Registration page with additional fields
   - JWT token management
   - Protected routes

2. **Dashboard**
   - View all repositories
   - Add new repositories
   - Repository cards with metadata
   - Quick access to recent reviews
   - Delete repositories

3. **Repository Details**
   - View repository metadata
   - Code quality score
   - Start new code reviews
   - View review history
   - Filter by review status

4. **Review Results**
   - Display code quality score
   - List all identified issues
   - Filter by severity (Critical, High, Medium, Low)
   - Show issue details with code snippets
   - Display suggestions for fixes

5. **Codebase Q&A** (Coming Soon)
   - Ask questions about the codebase
   - Semantic search using RAG
   - Context-aware responses
   - Chat history

## Styling

- **Framework**: Tailwind CSS
- **Color Scheme**:
  - Primary: Blue (#3b82f6)
  - Secondary: Dark Slate (#1e293b)
  - Accent: Green (#10b981)
- **Dark Mode**: Full dark theme implementation

## API Integration

The frontend uses Axios with interceptors for:
- Automatic token attachment to requests
- Error handling
- Redirect to login on 401 responses

### Available API Endpoints

```
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
GET    /api/auth/profile        - Get user profile

POST   /api/repositories        - Create repository
GET    /api/repositories        - List repositories
GET    /api/repositories/:id    - Get repository details
PUT    /api/repositories/:id    - Update repository
DELETE /api/repositories/:id    - Delete repository

POST   /api/reviews             - Create review
GET    /api/reviews             - List reviews
GET    /api/reviews/:id         - Get review details
PUT    /api/reviews/:id         - Update review
DELETE /api/reviews/:id         - Delete review
```

## Development Tips

- Hot reload is enabled by default with Vite
- Use React DevTools for debugging
- Check browser console for API errors
- Use `npm run lint` to check code quality

## TODO: Future Enhancements

- [ ] Add Monaco Editor for code display
- [ ] Implement RAG-powered Q&A
- [ ] Real-time review status updates
- [ ] Export reviews as PDF
- [ ] Code comparison view
- [ ] Team collaboration features
- [ ] Dark/Light theme toggle
- [ ] User preferences/settings

## Troubleshooting

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### API Connection Issues
- Ensure backend is running on port 5000
- Check VITE_API_URL in .env
- Verify CORS is enabled on backend

### Styling Not Applied
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Rebuild Tailwind CSS cache

## Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Other Platforms
- Build: `npm run build`
- Output: `dist` directory
- Set public directory to `dist`

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
