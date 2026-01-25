from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from src.api import student, projects, roster, submissions, ws
from src.database import init_db

app = FastAPI(title="Abigail Spelling Assessment API")

# Configure CORS for local network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In local network, we allow all for ease of use
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    # In a production scenario with Alembic, we might skip init_db() 
    # but for local first simplicity we can ensure tables exist
    init_db()

# Include routers
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(roster.router, prefix="/api/roster", tags=["Roster"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(ws.router, prefix="/api/ws", tags=["WebSocket"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Serve static files (built React app and local assets)
# Note: Ensure these directories exist or handle gracefully
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
