# 🏠 HomePath - Complete Setup Guide

Your full-stack application with React frontend and Express backend is now ready!

## ✅ What's Been Set Up

### Database ✓
- PostgreSQL database: `homepath_db`
- 6 tables created with relationships
- Sample data seeded (2 users, 5 questions, 7 todos, etc.)

### Backend ✓
- Express.js server on port **3001**
- JWT authentication
- RESTful API with 5 route groups
- PostgreSQL connection pool
- Password hashing with bcrypt
- TypeScript support

### Frontend ✓
- Vite + React on port **5173**
- Existing UI components
- Ready to connect to backend API

## 🚀 Getting Started

### Start the Full Application

```sh
npm run dev
```

This starts **both** the frontend and backend concurrently:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Or Start Them Separately

```sh
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

## 📁 Project Structure

```
/
├── src/                    # React frontend
│   ├── pages/
│   ├── components/
│   └── contexts/
├── server/                 # Express backend
│   ├── index.ts           # Main server
│   ├── db/pool.ts         # Database connection
│   ├── middleware/        # Auth middleware
│   └── routes/            # API endpoints
│       ├── auth.ts        # Login/register
│       ├── users.ts       # User profiles
│       ├── surveys.ts     # Survey Q&A
│       ├── todos.ts       # Todo management
│       └── steps.ts       # Journey steps
├── db/                    # Database files
│   ├── schema.sql         # Table definitions
│   ├── seed.sql           # Sample data
│   ├── setup.sh           # Setup script
│   └── README.md          # DB documentation
└── .env                   # Environment config
```

## 🔌 API Endpoints

All backend endpoints are documented in [server/README.md](server/README.md)

**Base URL:** `http://localhost:3001/api`

### Quick Reference:

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

**Protected Endpoints (require JWT token):**
- `GET /api/users/me` - Get profile
- `GET /api/surveys/responses` - Get survey responses
- `GET /api/todos` - Get user's todos
- `GET /api/steps` - Get user's steps

See [server/README.md](server/README.md) for complete API documentation.

## 🧪 Testing the Backend

### 1. Check server health
```sh
curl http://localhost:3001/health
```

### 2. Login with sample user
```sh
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@email.com",
    "password": "hashedpassword123"
  }'
```

**Note:** The seed data has pre-hashed passwords. For testing, you should register a new user:

```sh
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "mypassword123",
    "archetype": "Explorer"
  }'
```

### 3. Use the returned token
```sh
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔧 Available NPM Scripts

```sh
# Development
npm run dev              # Start frontend + backend
npm run dev:frontend     # Vite dev server only
npm run dev:backend      # Express server only

# Building
npm run build            # Build both frontend and backend
npm run build:frontend   # Build React app
npm run build:backend    # Compile TypeScript backend

# Database
npm run db:setup         # Create database, run schema & seeds
npm run db:reset         # Drop and recreate database
npm run db:schema        # Run schema only
npm run db:seed          # Run seed data only

# Other
npm run lint             # Run ESLint
npm run test             # Run tests
```

## 🗄️ Database Management

### View your data
```sh
# Connect to database
psql homepath_db

# List tables
\dt

# View users
SELECT * FROM user_info;

# View survey questions
SELECT * FROM survey_questions;

# Exit
\q
```

### Reset database
```sh
npm run db:reset
```

## 🔐 Environment Variables

Configuration is in [.env](.env):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homepath_db

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
```

## 📝 Next Steps

### Connect Frontend to Backend

Update your React app to call the backend API:

```typescript
// Example: Login function
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
};

// Example: Authenticated request
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return response.json();
};
```

### Update AuthContext

Modify [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) to use the real API instead of mock data.

### Create API Service

Consider creating a service file for API calls:

```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:3001/api';

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async getProfile(token: string) {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Add more API methods...
};
```

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `brew services list`
- Verify port 3001 is free: `lsof -i :3001`

### Database errors
- Reset database: `npm run db:reset`
- Check connection: `psql homepath_db`

### CORS errors
- Backend already configured to accept requests from frontend
- Verify `FRONTEND_URL` in `.env` matches your frontend URL

### Authentication errors
- JWT tokens expire after 24 hours
- Make sure to include `Bearer ` prefix: `Authorization: Bearer token`

## 📚 Documentation

- [Server/API Documentation](server/README.md) - Complete API reference
- [Database Documentation](db/README.md) - Database setup and commands
- [Original README](README.md) - Frontend/Lovable info

## 🎯 Current Status

✅ Database running with sample data
✅ Backend API server operational
✅ Frontend development server ready
⏳ Frontend-backend integration (next step)

## 💡 Pro Tips

1. **Use Postman or Thunder Client** to test API endpoints
2. **Keep backend logs open** to debug API calls
3. **Check browser DevTools Network tab** to see API requests
4. **Use React Query** (@tanstack/react-query) - it's already installed!
5. **Store JWT in httpOnly cookies** for better security (production)

---

**Ready to code!** 🚀

Start both servers with `npm run dev` and begin connecting your frontend to the backend API.
