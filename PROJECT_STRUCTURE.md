# 📁 Project Structure

Your HomePath project is now organized with a clear separation between frontend and backend code.

## 🏗️ Directory Structure

```
home-path/
├── frontend/                # React + Vite frontend application
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── contexts/      # React contexts (Auth, Survey, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   │   └── api.ts     # Backend API client
│   │   ├── test/          # Test files
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   ├── index.html         # HTML entry point
│   ├── vite.config.ts     # Vite configuration
│   ├── vitest.config.ts   # Vitest configuration
│   ├── tailwind.config.ts # Tailwind CSS config
│   ├── postcss.config.js  # PostCSS config
│   ├── tsconfig.json      # TypeScript config (main)
│   ├── tsconfig.app.json  # TypeScript config (app)
│   └── tsconfig.node.json # TypeScript config (Node)
│
├── server/                 # Express.js backend
│   ├── index.ts           # Main server file
│   ├── db/
│   │   └── pool.ts        # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   ├── routes/            # API route handlers
│   │   ├── auth.ts        # Authentication routes
│   │   ├── users.ts       # User routes
│   │   ├── surveys.ts     # Survey routes
│   │   ├── todos.ts       # Todo routes
│   │   └── steps.ts       # Steps routes
│   └── README.md          # Backend documentation
│
├── db/                     # Database files
│   ├── schema.sql         # Database schema
│   ├── seed.sql           # Sample data
│   ├── setup.sh           # Database setup script
│   ├── reset.sh           # Database reset script
│   └── README.md          # Database documentation
│
├── dist/                   # Build output (generated)
│   ├── frontend/          # Built frontend files
│   └── server/            # Compiled backend files
│
├── node_modules/          # Dependencies
│
├── package.json           # Root package config
├── package-lock.json      # Dependency lock file
├── tsconfig.server.json   # TypeScript config for server
├── eslint.config.js       # ESLint configuration
│
├── .env                   # Environment variables
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
│
├── README.md              # Main readme
├── SETUP.md               # Setup instructions
├── INTEGRATION.md         # Frontend-backend integration guide
└── PROJECT_STRUCTURE.md   # This file
```

## 📦 Key Directories

### `/frontend/` - React Application
Contains all frontend code including:
- React components and pages
- State management (contexts)
- Styling (Tailwind CSS)
- API client for backend communication
- Testing setup

**Port:** 5173 (Vite dev server)

### `/server/` - Express API
Contains all backend code including:
- REST API endpoints
- Database connections
- Authentication logic
- Business logic

**Port:** 3001 (Express server)

### `/db/` - Database
Contains all database-related files:
- SQL schema definitions
- Seed data
- Setup/reset scripts
- Documentation

**Database:** `homepath_db` (PostgreSQL)

## 🚀 Running the Application

### Development Mode

**Start both frontend and backend:**
```sh
npm run dev
```

**Or start separately:**
```sh
# Terminal 1 - Frontend (port 5173)
npm run dev:frontend

# Terminal 2 - Backend (port 3001)
npm run dev:backend
```

### Build for Production

```sh
npm run build
```

This builds both frontend and backend:
- Frontend → `dist/frontend/`
- Backend → `dist/server/`

## 🔧 Configuration Files

### Root Level
- `package.json` - Main project configuration
- `tsconfig.server.json` - TypeScript config for backend
- `.env` - Environment variables
- `eslint.config.js` - Linting rules

### Frontend (`/frontend/`)
- `vite.config.ts` - Vite bundler configuration
- `vitest.config.ts` - Testing framework config
- `tailwind.config.ts` - CSS framework config
- `tsconfig.json` - TypeScript settings
- `components.json` - shadcn/ui components config

## 🔌 How They Connect

```
Frontend (localhost:5173)
        ↓
    API Calls
        ↓
Backend (localhost:3001/api)
        ↓
    SQL Queries
        ↓
PostgreSQL (localhost:5432/homepath_db)
```

### API Communication

The frontend communicates with the backend through the API service:

**Frontend:**
```typescript
// frontend/src/services/api.ts
import { api } from '@/services/api';

// Make API calls
const user = await api.login(email, password);
const todos = await api.getUserTodos();
```

**Backend:**
```typescript
// server/routes/auth.ts
router.post('/login', async (req, res) => {
  // Handle login logic
  // Query database
  // Return response
});
```

## 📝 File Paths to Remember

**Frontend:**
- Components: `frontend/src/components/`
- Pages: `frontend/src/pages/`
- API client: `frontend/src/services/api.ts`
- Contexts: `frontend/src/contexts/`

**Backend:**
- Routes: `server/routes/`
- Database: `server/db/pool.ts`
- Auth: `server/middleware/auth.ts`

**Database:**
- Schema: `db/schema.sql`
- Seeds: `db/seed.sql`

## 🛠️ Development Workflow

1. **Frontend changes:**
   - Edit files in `frontend/src/`
   - Hot reload updates automatically
   - View at http://localhost:5173

2. **Backend changes:**
   - Edit files in `server/`
   - Nodemon restarts server automatically
   - API available at http://localhost:3001

3. **Database changes:**
   - Update `db/schema.sql` or `db/seed.sql`
   - Run `npm run db:reset` to apply changes

## 📊 Benefits of This Structure

✅ **Clear separation** - Frontend and backend code are isolated
✅ **Easy to navigate** - Logical organization of files
✅ **Scalable** - Can grow each part independently
✅ **Standard pattern** - Follows full-stack best practices
✅ **Build flexibility** - Can deploy frontend/backend separately

## 🎯 Next Steps

- **Frontend:** All React code goes in `frontend/src/`
- **Backend:** All API code goes in `server/`
- **Shared types:** Consider creating a `types/` folder at root for shared TypeScript types
- **Documentation:** Keep docs at root level for overall project context
