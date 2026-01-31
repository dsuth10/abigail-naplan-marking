from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from src.api import student, auth, projects, roster, submissions, marking, ws
from src.database import init_db, SessionLocal
from src.models.base import Teacher
from src.services.auth import get_password_hash

app = FastAPI(title="Abigail Spelling Assessment API")

DEFAULT_TEACHER_USERNAME = "admin"
DEFAULT_TEACHER_PASSWORD = "abigail2026"
DEFAULT_TEACHER_FULL_NAME = "Administrator"

# Configure CORS for local network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In local network, we allow all for ease of use
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and seed default teacher if none exist
@app.on_event("startup")
async def startup_event():
    # In a production scenario with Alembic, we might skip init_db()
    # but for local first simplicity we can ensure tables exist
    init_db()
    db = SessionLocal()
    try:
        if db.query(Teacher).count() == 0:
            default_teacher = Teacher(
                username=DEFAULT_TEACHER_USERNAME,
                password_hash=get_password_hash(DEFAULT_TEACHER_PASSWORD),
                full_name=DEFAULT_TEACHER_FULL_NAME,
            )
            db.add(default_teacher)
            db.commit()
    finally:
        db.close()

# Include routers
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(auth.router, prefix="/api/auth", tags=["Teacher Auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(roster.router, prefix="/api/roster", tags=["Roster"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(marking.router, prefix="/api/marking", tags=["Marking"])
app.include_router(ws.router, prefix="/api/ws", tags=["WebSocket"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Serve static files (built React app and local assets)
# Note: Ensure these directories exist or handle gracefully
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
