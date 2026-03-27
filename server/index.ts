import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import surveyRoutes from './routes/surveys.js';
import todoRoutes from './routes/todos.js';
import stepsRoutes from './routes/steps.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/steps', stepsRoutes);
app.use('/api/admin', adminRoutes);

// API root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'HomePath API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        profile: 'GET /api/users/me',
        updateProfile: 'PUT /api/users/me'
      },
      surveys: 'GET /api/surveys',
      todos: 'GET /api/todos',
      steps: 'GET /api/steps',
      admin: 'GET /api/admin/login-activity (admin only)'
    },
    documentation: 'See server/README.md for full API reference'
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'HomePath API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      surveys: '/api/surveys',
      todos: '/api/todos',
      steps: '/api/steps',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (skip in serverless environments)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n HomePath API Server`);
    console.log(`   Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'homepath_db'}\n`);
  });
}

export default app;
