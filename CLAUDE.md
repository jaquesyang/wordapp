# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a word learning application (单词学习应用) with a **FastAPI** backend and **React + TypeScript** frontend. Users can select a grade level, choose units, and practice words through various learning modes (learn, read, write, dictation).

## Development Commands

### Backend (FastAPI)
```bash
cd backend
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# Install dependencies (use Tsinghua mirror as configured)
pip install -r requirements.txt
# Run development server
python main.py
# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend runs on `http://localhost:8000` with auto-reload enabled.

### Frontend (React + Vite)
```bash
cd frontend
# Install dependencies
npm install
# Run development server
npm run dev
# Build for production
npm run build
# Run linter
npm run lint
```

The frontend dev server runs on `http://localhost:5173` (Vite default).

## Architecture

### Backend Structure (`/backend`)
- `main.py` - FastAPI app entry point, CORS middleware, router registration
- `config.py` - Configuration including database path and Youdao audio API
- `database.py` - SQLAlchemy models (Grade, Unit, Word) and session management
- `routers/` - API route modules:
  - `grades.py` - Grade list endpoints
  - `units.py` - Unit list endpoints with word counts
  - `words.py` - Word filtering and random selection
  - `audio.py` - Audio proxy for Youdao dictionary API (CORS workaround)

**Database**: SQLite at `wordapp.db` in project root. Tables:
- `grade` (id, name, cover, mark_note)
- `unit` (grade, unit, name) - composite primary key
- `word` (id, word, grade, unit, phonetic, chinese_definition, mark, page)

### Frontend Structure (`/frontend/src`)
- `App.tsx` - React Router setup, route definitions, React Query provider
- `api/` - Axios instance with interceptors, API modules
- `stores/useAppStore.ts` - Zustand store with localStorage persistence for user settings
- `hooks/` - React Query hooks (useGrades, useUnits, useWords)
- `pages/` - Page components for each learning mode
- `components/` - Reusable UI components and Layout wrapper
- `types/index.ts` - TypeScript type definitions

**Key patterns**:
- API base URL: `import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"`
- Path alias: `@/` maps to `src/` (configured in vite.config.ts)
- Theme applied via CSS classes on document root

### Technology Stack
- **Backend**: FastAPI, SQLAlchemy, uvicorn, httpx, aiosqlite
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Radix UI, React Query, Zustand, React Router

## Key Integration Points

1. **Audio Proxy**: Backend proxies Youdao dictionary audio at `/api/audio/proxy` to avoid CORS issues
2. **State Sync**: `RouteSync` component in App.tsx syncs URL path with Zustand store
3. **Data Flow**: React Query hooks → API modules → Axios → FastAPI → SQLAlchemy → SQLite
