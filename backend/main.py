"""
Pixel Portfolio Backend (FastAPI)
---------------------------------
Run:
    pip install -r requirements.txt
    cp .env.example .env      # then fill values
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /api/health
    GET  /api/profile
    GET  /api/skills
    GET  /api/projects
    GET  /api/experience
    GET  /api/resume              -> serves ./resume.pdf if present
    POST /api/contact             -> stores message in SQLite
    GET  /api/admin/messages      -> header X-Admin-Token required
    POST /api/chat                -> Ali mascot (short comic-bubble replies)

EDIT the PROFILE / SKILLS / PROJECTS / EXPERIENCE blocks below with your real data.
"""

import os
import re
import sqlite3
import time
from collections import defaultdict, deque
from contextlib import contextmanager
from pathlib import Path
from typing import Deque, Dict, List, Literal

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # python-dotenv optional
    pass

# ----------------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------------
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CHAT_MODEL = os.getenv("CHAT_MODEL", "claude-sonnet-5-5")
MASCOT_NAME = os.getenv("MASCOT_NAME", "Ali")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
DB_PATH = os.getenv("DB_PATH", "portfolio.db")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    if o.strip()
]

# ----------------------------------------------------------------------------
# YOUR CONTENT — edit me
# ----------------------------------------------------------------------------
PROFILE = {
    "name": "Pratham",
    "title": "Backend Developer",
    "tagline": "Backend systems, software architecture and AI-powered products.",
    "location": "Gujarat, India",
    "languages": ["Hindi", "English", "Gujarati"],
    "about": [
        "I'm a backend developer who builds APIs, designs software architecture and integrates AI into real products.",
        "Currently a Backend Developer Intern at ScalerBit, working with Python and FastAPI.",
    ],
    "education": [
        {
            "degree": "Diploma in Information Technology",
            "school": "P P Savani University",
            "year": "EDIT ME",
        }
    ],
    "roles": ["Backend Development", "System Design", "AI Integration", "API Engineering"],
    "stats": [
        {"label": "Projects", "value": "EDIT ME"},
        {"label": "Experience", "value": "EDIT ME"},
        {"label": "Languages", "value": "3"},
    ],
    "socials": {
        "github": "https://github.com/PrathamHapani01",
        "linkedin": "https://www.linkedin.com/in/pratham-hapani-395b18363/",
        "email": "mailto:prathamhapani.082008@gmail.com",
    },
    "contact_email": "prathamhapani.082008@gmail.com",
    "open_to_work": True,
}

SKILLS = {
    "Backend": [
        {"name": "Python", "level": 9},
        {"name": "FastAPI", "level": 9},
        {"name": "Django", "level": 7},
        {"name": "REST API Design", "level": 8},
    ],
    "Databases": [
        {"name": "PostgreSQL", "level": 8},
        {"name": "SQL", "level": 8},
    ],
    "DevOps": [
        {"name": "Docker", "level": 7},
        {"name": "Kubernetes", "level": 5},
        {"name": "Git / GitHub", "level": 8},
    ],
    "AI/ML": [
        {"name": "LLM Integration", "level": 8},
        {"name": "NumPy", "level": 7},
        {"name": "Pandas", "level": 7},
    ],
    "Tools": [
        {"name": "Linux", "level": 6},
        {"name": "Postman", "level": 7},
    ],
}  # level is 1-10 (maps to the 10-block pixel bar). Adjust honestly.

PROJECTS = [
    {
        "id": "ecommerce-api",
        "title": "E-commerce Backend API",
        "category": "Backend",
        "description": "Backend API for an online store: products, cart, orders, and checkout.",
        "details": "Backend API for an online store: products, cart, orders, and checkout.",
        "tech": ["Python", "FastAPI"],
        "image": "/projects/placeholder.png",
        "live": "",
        "code": "",
    },
    {
        "id": "job-portal",
        "title": "Job Portal & Recruitment Management System",
        "category": "Backend",
        "description": "Recruitment backend for job listings, applications, and hiring workflows.",
        "details": "Recruitment backend for job listings, applications, and hiring workflows.",
        "tech": ["Python", "FastAPI"],
        "image": "/projects/placeholder.png",
        "live": "",
        "code": "",
    },
    {
        "id": "task-api",
        "title": "Task Management & Project Collaboration API",
        "category": "Backend",
        "description": "API for projects, tasks, and team collaboration.",
        "details": "API for projects, tasks, and team collaboration.",
        "tech": ["Python", "FastAPI"],
        "image": "/projects/placeholder.png",
        "live": "",
        "code": "",
    },
]  # categories used by the frontend filter: Backend | AI | SaaS | Tools

EXPERIENCE = [
    {
        "role": "Backend Developer Intern",
        "company": "ScalerBit",
        "period": "EDIT ME",
        "points": [
            "Build and maintain backend services and APIs.",
            "Design software architecture and integrate AI features into products.",
        ],
    }
]

# ----------------------------------------------------------------------------
# App + CORS
# ----------------------------------------------------------------------------
app = FastAPI(title="Pixel Portfolio API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)

# ----------------------------------------------------------------------------
# Tiny in-memory rate limiter (per IP + bucket). Use Redis if you scale out.
# ----------------------------------------------------------------------------
_hits: Dict[str, Deque[float]] = defaultdict(deque)


def rate_limit(request: Request, bucket: str, limit: int, window: int) -> None:
    ip = request.client.host if request.client else "unknown"
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        ip = fwd.split(",")[0].strip()
    key = f"{bucket}:{ip}"
    now = time.time()
    q = _hits[key]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Slow down a bit.")
    q.append(now)


# ----------------------------------------------------------------------------
# SQLite (contact messages)
# ----------------------------------------------------------------------------
@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


init_db()

# ----------------------------------------------------------------------------
# Schemas
# ----------------------------------------------------------------------------
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=120)
    message: str = Field(min_length=5, max_length=2000)
    website: str = Field(default="", max_length=200)  # honeypot: bots fill this


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=600)


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: List[ChatTurn] = Field(default_factory=list, max_length=12)
    section: str = Field(default="", max_length=40)  # section currently on screen


class ChatOut(BaseModel):
    reply: str
    mood: Literal["happy", "thinking", "surprised", "sad", "wave"] = "happy"
    suggestions: List[str] = []
    action: str = ""  # optional: "scroll:projects", "scroll:contact", ...


# ----------------------------------------------------------------------------
# Content routes
# ----------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "mascot": MASCOT_NAME, "ai_enabled": bool(ANTHROPIC_API_KEY)}


@app.get("/api/profile")
def get_profile():
    return PROFILE


@app.get("/api/skills")
def get_skills():
    return SKILLS


@app.get("/api/projects")
def get_projects():
    return PROJECTS


@app.get("/api/experience")
def get_experience():
    return EXPERIENCE


@app.get("/api/resume")
def get_resume():
    path = Path("resume.pdf")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Resume not uploaded yet.")
    return FileResponse(path, media_type="application/pdf", filename="Pratham_Resume.pdf")


# ----------------------------------------------------------------------------
# Contact
# ----------------------------------------------------------------------------
@app.post("/api/contact", status_code=201)
def post_contact(payload: ContactIn, request: Request):
    rate_limit(request, "contact", limit=3, window=600)  # 3 messages / 10 min / IP
    if payload.website:  # honeypot tripped -> pretend success
        return {"ok": True}
    if not EMAIL_RE.match(payload.email):
        raise HTTPException(status_code=422, detail="Please enter a valid email.")
    with db() as conn:
        conn.execute(
            "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
            (payload.name.strip(), payload.email.strip(), payload.message.strip()),
        )
    return {"ok": True, "detail": "Message sent!"}


@app.get("/api/admin/messages")
def admin_messages(x_admin_token: str = Header(default="")):
    if not ADMIN_TOKEN or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    with db() as conn:
        rows = conn.execute("SELECT * FROM messages ORDER BY id DESC LIMIT 200").fetchall()
    return [dict(r) for r in rows]


# ----------------------------------------------------------------------------
# Ali (AI mascot) — short, comic-bubble style replies
# ----------------------------------------------------------------------------
def build_system_prompt() -> str:
    projects = "; ".join(f"{p['title']} ({p['description']})" for p in PROJECTS)
    skills = ", ".join(s["name"] for group in SKILLS.values() for s in group)
    return f"""You are {MASCOT_NAME}, a tiny playful pixel mascot living on {PROFILE['name']}'s portfolio website.
You talk in comic speech bubbles, so keep every reply SHORT: max 2 sentences and under 35 words.
Tone: friendly, cheeky, retro-game vibe. Plain text only: no markdown, no lists, no emoji.
Only talk about {PROFILE['name']}, this portfolio, his work, skills, projects, experience and how to contact or hire him.
If asked something unrelated, joke briefly and steer back. If you don't know a fact, say so and suggest the contact form. Never invent facts.

FACTS
Name: {PROFILE['name']} | Title: {PROFILE['title']} | Location: {PROFILE['location']}
About: {' '.join(PROFILE['about'])}
Education: {', '.join(e['degree'] + ' at ' + e['school'] for e in PROFILE['education'])}
Languages: {', '.join(PROFILE['languages'])}
Skills: {skills}
Projects: {projects}
Experience: {', '.join(e['role'] + ' at ' + e['company'] for e in EXPERIENCE)}
Open to work: {PROFILE['open_to_work']} | Contact email: {PROFILE['contact_email']}
"""


def fallback_reply(message: str) -> ChatOut:
    """Rule-based answers used when no API key is set or the AI call fails."""
    m = message.lower()
    if any(w in m for w in ("hire", "contact", "email", "job", "work with", "reach")):
        return ChatOut(
            reply="Want to team up? Use the contact form and Pratham will reply fast!",
            mood="happy",
            suggestions=["Show projects", "Skills?"],
            action="scroll:contact",
        )
    if any(w in m for w in ("project", "built", "build", "portfolio", "work")):
        return ChatOut(
            reply="Pratham builds APIs, SaaS tools and AI features. Peek at the projects window!",
            mood="happy",
            suggestions=["How to hire?", "Skills?"],
            action="scroll:projects",
        )
    if any(w in m for w in ("skill", "stack", "tech", "python", "fastapi", "language")):
        return ChatOut(
            reply="Python, FastAPI, Django, PostgreSQL, Docker and AI integration. Level up!",
            mood="happy",
            suggestions=["Show projects", "How to hire?"],
            action="scroll:skills",
        )
    if any(w in m for w in ("who", "about", "pratham", "you")):
        return ChatOut(
            reply=f"{PROFILE['name']} is a backend developer from {PROFILE['location']} who loves AI-powered products.",
            mood="wave",
            suggestions=["Show projects", "Skills?"],
            action="scroll:about",
        )
    return ChatOut(
        reply="Hmm, my pixels are confused! Ask me about Pratham, projects or skills.",
        mood="surprised",
        suggestions=["Who is Pratham?", "Show projects", "How to hire?"],
    )


def pick_mood(text: str) -> str:
    t = text.lower()
    if "!" in t:
        return "happy"
    if "sorry" in t or "don't know" in t:
        return "sad"
    return "happy"


@app.post("/api/chat", response_model=ChatOut)
def chat(payload: ChatIn, request: Request):
    rate_limit(request, "chat", limit=20, window=300)  # 20 msgs / 5 min / IP

    if not ANTHROPIC_API_KEY:
        return fallback_reply(payload.message)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        messages = [{"role": t.role, "content": t.content} for t in payload.history[-6:]]
        user_text = payload.message
        if payload.section:
            user_text += f"\n(The visitor is currently viewing the '{payload.section}' section.)"
        messages.append({"role": "user", "content": user_text})

        resp = client.messages.create(
            model=CHAT_MODEL,
            max_tokens=160,
            system=build_system_prompt(),
            messages=messages,
        )
        text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text").strip()
        if not text:
            return fallback_reply(payload.message)

        base = fallback_reply(payload.message)  # reuse its action / suggestions
        return ChatOut(
            reply=text[:300],
            mood=pick_mood(text),
            suggestions=base.suggestions or ["Show projects", "How to hire?"],
            action=base.action,
        )
    except Exception:
        # Never break the mascot: degrade gracefully.
        return fallback_reply(payload.message)
