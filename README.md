# Pixel Portfolio

Retro pixel-art portfolio for Pratham, a backend developer in Gujarat, India. The hero shows his name beside a living pixel desk (`WORKSTATION.EXE`). Peach is the default theme; blue wraps that desk in a CRT frame. Ali, a roaming mascot, answers in comic speech bubbles.

## Setup

```bash
# Backend
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Windows: copy .env.example .env

# Frontend
cd frontend
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

Leave `ANTHROPIC_API_KEY` empty to use Ali's built-in replies. The key must stay in `backend/.env` only.

## Run

```bash
# Backend — http://localhost:8000/docs
cd backend
uvicorn main:app --reload --port 8000

# Frontend — http://localhost:5173
cd frontend
npm run dev
```

On Windows, activate the venv first, or run `backend\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000` from `backend`.

## What to edit

Search for `EDIT ME` and `EDIT_ME`.

- `backend/main.py` — `PROFILE`, `SKILLS`, `PROJECTS`, `EXPERIENCE` (real links, dates, descriptions, honest skill levels)
- `frontend/public/projects/` — replace the placeholder screenshots
- `backend/resume.pdf` — add your resume (served at `/api/resume`)
- Social links and email in `PROFILE["socials"]`

Regenerate the pixel images with `python scripts/make_assets.py` if you want a fresh avatar, cursor, or favicon.

## Deploy

- Backend: Docker image `python:3.12-slim` on Render, Railway, Fly.io, or a VPS. Set the env vars from `backend/.env.example` on the host. Mount a volume for `portfolio.db`, or move to PostgreSQL.
- Frontend: Vercel, Netlify, or Cloudflare Pages. Set `VITE_API_URL` to the deployed backend.
- Set `ALLOWED_ORIGINS` to the deployed frontend URL only.
- Serve the backend over HTTPS. The rate limiter is in-memory; use Redis if you run more than one instance.

## Themes

Peach is the default. Blue wraps the hero in a CRT frame. Add `?theme=blue` or `?theme=peach` to switch and save the choice. Ali can be hidden from the footer. Sound is off until the navbar toggle is pressed.

The Konami code (Up Up Down Down Left Right Left Right B A) makes Ali dance and inverts the theme for 5 seconds.
