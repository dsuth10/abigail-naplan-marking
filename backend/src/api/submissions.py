from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from src.database import get_db
from src.schemas.submission import SubmissionResponse
from src.services.submission import SubmissionService
from src.services.export_service import ExportService
from src.api.ws import manager
from fastapi.responses import StreamingResponse
import io

router = APIRouter()

@router.get("/export/{project_id}")
async def export_submissions(project_id: UUID, db: Session = Depends(get_db)):
    """Export all submitted assessments for a project as a ZIP of text files."""
    zip_buffer, filename = ExportService.export_project_submissions_to_zip(db, project_id)
    if not zip_buffer:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/x-zip-compressed",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/", response_model=List[SubmissionResponse])
async def list_submissions(db: Session = Depends(get_db)):
    """List all submissions for the teacher dashboard."""
    return SubmissionService.get_all_submissions(db)

@router.get("/project/{project_id}", response_model=List[SubmissionResponse])
async def list_project_submissions(project_id: UUID, db: Session = Depends(get_db)):
    """List all submissions for a specific project."""
    return SubmissionService.get_project_submissions(db, project_id)

@router.post("/{submission_id}/unlock", response_model=SubmissionResponse)
async def unlock_submission(submission_id: UUID, db: Session = Depends(get_db)):
    """Unlock a submission, returning it to draft mode."""
    submission = SubmissionService.unlock_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Broadcast update via WebSocket
    await manager.broadcast({
        "type": "SUBMISSION_UPDATED",
        "data": {
            "id": str(submission.id),
            "status": submission.status,
            "student_id": str(submission.student_id),
            "project_id": str(submission.project_id)
        }
    })
    
    return submission
