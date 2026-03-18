# Word Learning App (单词学习应用)

> **All written by AI**

A web-based word learning application for practicing vocabulary through multiple learning modes.

This project includes two implementation options:

1. **Next.js** - Full-stack application (frontend + backend in one)
2. **Vite + React + FastAPI** - Separated frontend and backend

## Features

- **Grade Selection**: Choose from different grade levels
- **Unit Selection**: Browse and select specific word units
- **Multiple Learning Modes**:
  - Learn (学习) - Interactive word learning
  - Read (阅读) - Reading practice
  - Write (书写) - Writing exercises
  - Dictation (听写) - Audio-based dictation practice
- **Audio Support**: Integrated Youdao dictionary audio for pronunciation

## Tech Stack

### Option 1: Next.js (Full-Stack)
- **Next.js** - React framework with App Router (frontend + API routes)
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS
- **Zustand** - State management
- **SQLite** - Embedded database (via better-sqlite3)

### Option 2: Vite + React + FastAPI (Separated)

#### Backend (FastAPI)
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Embedded database
- **httpx** - Async HTTP client for audio proxy
- **uvicorn** - ASGI server

#### Frontend (Vite + React)
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **Radix UI** - Headless UI components
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Router** - Client-side routing

## Prerequisites

- Node.js 18+
- npm or yarn
- Python 3.8+ (only for FastAPI backend)

## Installation

### Option 1: Next.js (Full-Stack)

```bash
cd nextjs
# Install dependencies
npm install
```

### Option 2: Vite + React + FastAPI

#### Backend Setup

```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# Install dependencies
pip install -r requirements.txt
```

#### Frontend Setup

```bash
cd frontend
# Install dependencies
npm install
```

## Running the Application

### Option 1: Next.js (Full-Stack)

```bash
cd nextjs
npm run dev
```

The application will be available at `http://localhost:3000`

No separate backend needed - Next.js handles both frontend and backend.

### Option 2: Vite + React + FastAPI

#### Start Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

The backend API will be available at `http://localhost:8000`

#### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
wordapp/
├── backend/              # FastAPI backend (for Vite frontend)
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Configuration
│   ├── database.py       # Database models and session
│   ├── routers/          # API route modules
│   │   ├── grades.py
│   │   ├── units.py
│   │   ├── words.py
│   │   └── audio.py
│   └── requirements.txt
├── frontend/             # Vite + React (requires backend)
│   ├── src/
│   │   ├── App.tsx       # Router setup
│   │   ├── api/          # API client modules
│   │   ├── stores/       # Zustand state management
│   │   ├── hooks/        # React Query hooks
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable UI components
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── nextjs/               # Next.js full-stack app (standalone)
│   ├── app/              # App Router pages + API routes
│   ├── components/       # React components
│   ├── stores/           # Zustand state management
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript types
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.ts
└── wordapp.db            # SQLite database
```

## API Endpoints

### FastAPI Backend (`/api`)
- `GET /api/grades` - List all grades
- `GET /api/units` - List units for a grade
- `GET /api/words` - Get words with filters
- `GET /api/audio/proxy` - Audio proxy for Youdao API

### Next.js API Routes
- Equivalent endpoints served via Next.js API routes

## Development

### Next.js Commands

```bash
cd nextjs
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### FastAPI Backend Commands

```bash
cd backend
# Run with auto-reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Vite + React Commands

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Option 1: Next.js (Full-Stack)

```bash
# Build and start the container
docker-compose -f docker-compose.nextjs.yml up -d

# View logs
docker-compose -f docker-compose.nextjs.yml logs -f

# Stop the container
docker-compose -f docker-compose.nextjs.yml down
```

The application will be available at `http://localhost:8100`

**Notes:**
- Port 8100 on host maps to port 3000 inside the container
- Database file is mounted as a volume for persistence
- Container automatically restarts unless stopped manually
- Healthcheck monitors the API endpoint

### Option 2: Vite + React + FastAPI

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all containers
docker-compose down
```

**Services:**
- Frontend: `http://localhost:80` (nginx)
- Backend: `http://localhost:8000` (FastAPI)

**Notes:**
- Frontend runs on port 80 using nginx
- Backend runs on port 8000
- Database file is mounted as a volume for persistence
- Containers automatically restart unless stopped manually
- Healthcheck monitors the backend API endpoint

### Docker Commands

```bash
# Rebuild containers after code changes
docker-compose up -d --build

# Check container status
docker-compose ps

# Execute commands inside a container
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh

# View real-time logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## License

MIT
