from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from src.database import get_db
from src.models.base import Student, Project, Submission
from src.schemas.student import StudentResponse, LoginRequest, TokenResponse
from src.schemas.project import ProjectResponse
from src.schemas.submission import SubmissionResponse, SubmissionUpdate
from src.services.auth import verify_password, create_access_token, get_current_student
from src.services.submission import SubmissionService

router = APIRouter()

@router.get("/list", response_model=List[StudentResponse])
async def list_students(db: Session = Depends(get_db)):
    """List all students for the avatar grid login."""
    students = db.query(Student).all()
    return students

@router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == login_data.student_id).first()
    if not student or not verify_password(login_data.password, student.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect student ID or password",
        )
    
    access_token = create_access_token(data={"sub": str(student.id), "role": "student"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=StudentResponse)
async def get_me(current_student: Student = Depends(get_current_student)):
    return current_student

@router.get("/projects", response_model=List[ProjectResponse])
async def list_assigned_projects(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """List projects assigned to the student's class group."""
    # SQLite JSON filtering
    projects = db.query(Project).filter(
        Project.is_active == True,
        Project.assigned_class_groups.contains(current_student.class_group)
    ).all()
    return projects

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project_details(
    project_id: UUID,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if student is assigned to this project's class group
    if current_student.class_group not in project.assigned_class_groups:
        raise HTTPException(status_code=403, detail="Not assigned to this project")
        
    return project

@router.get("/submissions/{project_id}", response_model=Optional[SubmissionResponse])
async def get_submission(
    project_id: UUID,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    submission = SubmissionService.get_submission(db, current_student.id, project_id)
    return submission

@router.post("/submissions/{project_id}", response_model=SubmissionResponse)
async def update_draft(
    project_id: UUID,
    submission_data: SubmissionUpdate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if submission_data.content_raw is None:
         raise HTTPException(status_code=400, detail="content_raw is required")
         
    submission = SubmissionService.create_or_update_draft(
        db, 
        current_student.id, 
        project_id, 
        submission_data.content_raw,
        submission_data.content_html or "",
        submission_data.content_json or {}
    )

    # Broadcast update via WebSocket
    from src.api.ws import manager
    await manager.broadcast({
        "type": "SUBMISSION_UPDATED",
        "data": {
            "id": str(submission.id),
            "status": submission.status,
            "student_id": str(submission.student_id),
            "project_id": str(submission.project_id),
            "last_updated_at": submission.last_updated_at.isoformat()
        }
    })

    return submission

@router.put("/submissions/{project_id}/submit", response_model=SubmissionResponse)
async def finalize_submission(
    project_id: UUID,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    submission = SubmissionService.finalize_submission(db, current_student.id, project_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Broadcast update via WebSocket
    from src.api.ws import manager
    await manager.broadcast({
        "type": "SUBMISSION_UPDATED",
        "data": {
            "id": str(submission.id),
            "status": submission.status,
            "student_id": str(submission.student_id),
            "project_id": str(submission.project_id),
            "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None
        }
    })

    return submission
