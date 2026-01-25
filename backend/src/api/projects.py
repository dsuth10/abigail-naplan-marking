from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import os
import shutil

from src.database import get_db
from src.schemas.project import ProjectResponse, ProjectCreate
from src.services.project_service import ProjectService

router = APIRouter()

# Directory to store uploaded stimulus assets
UPLOAD_DIR = "static/stimulus_assets"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: Session = Depends(get_db)):
    """List all projects for the teacher."""
    return ProjectService.list_projects(db)

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new assessment project."""
    return ProjectService.create_project(db, project_data)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID, db: Session = Depends(get_db)):
    project = ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: UUID, project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Update an existing assessment project."""
    project = ProjectService.update_project(db, project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/toggle-status", response_model=ProjectResponse)
async def toggle_project_status(project_id: UUID, db: Session = Depends(get_db)):
    project = ProjectService.toggle_project_status(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/upload-asset")
async def upload_asset(file: UploadFile = File(...)):
    """Upload a stimulus image/asset."""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Simple check to avoid overwriting or path traversal
    if ".." in file.filename or file.filename.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid filename")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the relative path for the frontend to use
    return {"path": f"/stimulus_assets/{file.filename}"}
