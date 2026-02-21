# HomePath Backend API

Express.js + PostgreSQL backend server for the HomePath application.

## 🚀 Quick Start

```sh
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend  # Vite dev server (port 5173)
npm run dev:backend   # Express API server (port 3001)
```

## 📁 Project Structure

```
server/
├── index.ts              # Main server file
├── db/
│   └── pool.ts          # PostgreSQL connection pool
├── middleware/
│   └── auth.ts          # JWT authentication middleware
└── routes/
    ├── auth.ts          # Authentication endpoints
    ├── users.ts         # User profile endpoints
    ├── surveys.ts       # Survey questions & responses
    ├── todos.ts         # Todo items management
    └── steps.ts         # User journey steps
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Surveys
- `GET /api/surveys/questions` - Get all survey questions
- `GET /api/surveys/responses` - Get user's responses (auth required)
- `POST /api/surveys/responses` - Submit/update single response (auth required)
- `POST /api/surveys/responses/batch` - Submit multiple responses (auth required)

### Todos
- `GET /api/todos/items` - Get all available todo items
- `GET /api/todos` - Get user's todos (auth required)
- `POST /api/todos` - Add todo to user (auth required)
- `PUT /api/todos/:todoId` - Update todo status (auth required)
- `DELETE /api/todos/:todoId` - Delete user todo (auth required)

### Steps
- `GET /api/steps` - Get user's steps (auth required)
- `GET /api/steps/:stepId` - Get specific step (auth required)
- `POST /api/steps` - Create new step (auth required)
- `PUT /api/steps/:stepId` - Update step (auth required)
- `DELETE /api/steps/:stepId` - Delete step (auth required)
- `GET /api/steps/:stepId/todos` - Get todos for a step (auth required)

### Health Check
- `GET /health` - Server health status
- `GET /` - API info and available endpoints

## 🔐 Authentication

Most endpoints require authentication using JWT tokens.

### How to authenticate:

1. **Register or Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@email.com", "password": "password123"}'
```

2. **Use the returned token:**
```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Example Requests

### Register a new user
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "securepassword",
    "archetype": "Planner"
  }'
```

### Submit survey responses
```bash
curl -X POST http://localhost:3001/api/surveys/responses/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "responses": [
      {"questionId": 1, "response": "$75,000"},
      {"questionId": 2, "response": "$15,000"}
    ]
  }'
```

### Get user's todos
```bash
curl http://localhost:3001/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛠️ Development

### Running in development mode
```sh
npm run dev:backend
```

This uses `nodemon` and `tsx` for automatic reloading on file changes.

### Building for production
```sh
npm run build:backend
```

### Starting production server
```sh
npm start
```

## 🔧 Configuration

Environment variables are stored in [.env](../.env):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homepath_db
DB_USER=
DB_PASSWORD=

# Server
NODE_ENV=development
PORT=3001

# Security
JWT_SECRET=your-secret-key

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🗄️ Database

The server connects to a PostgreSQL database with these tables:
- `user_info` - User accounts
- `survey_questions` - Survey templates
- `user_responses` - User survey answers
- `todo_items` - Todo templates
- `steps` - User journey steps
- `user_todos` - User-specific todos

See [../db/schema.sql](../db/schema.sql) for the complete schema.

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- SQL injection prevention using parameterized queries
- Input validation

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## 🐛 Troubleshooting

### Server won't start
- Check if PostgreSQL is running: `brew services list`
- Verify database exists: `psql -l | grep homepath_db`
- Check port 3001 is not in use: `lsof -i :3001`

### Database connection errors
- Verify credentials in `.env` file
- Test connection: `psql homepath_db`
- Check database setup: `npm run db:setup`

### Authentication errors
- Ensure JWT_SECRET is set in `.env`
- Check token format: `Bearer <token>`
- Verify token hasn't expired (24h lifetime)
