"""API for AI-powered NAPLAN marking."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from src.database import get_db
from src.models.base import AssessmentResult, Teacher
from src.schemas.assessment import AssessmentResultResponse
from src.services.auth import get_current_teacher
from src.services.naplan_marking_service import NAPLANMarkingService
from src.services.ollama_client import OllamaClient
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/grade/{submission_id}")
async def grade_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_teacher: Teacher = Depends(get_current_teacher),
):
    """
    Trigger AI grading for a submission.
    Returns a summary with assessment_id for viewing detailed results.
    """
    existing = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.submission_id == submission_id)
        .first()
    )
    if existing:
        return {
            "message": "Already graded",
            "assessment_id": str(existing.id),
            "total_score": existing.total_score,
            "max_score": existing.max_score,
            "summary": {
                "strengths": (existing.overall_strengths or [])[:2],
                "weaknesses": (existing.overall_weaknesses or [])[:2],
            },
        }

    ollama = OllamaClient()
    if not ollama.check_health():
        raise HTTPException(
            status_code=503,
            detail="Ollama service not available. Please start Ollama (ollama serve) and ensure the model is pulled (e.g. ollama pull mistral).",
        )

    marking_service = NAPLANMarkingService(db, ollama)
    try:
        result = marking_service.grade_submission(submission_id)
        return {
            "assessment_id": str(result.id),
            "total_score": result.total_score,
            "max_score": result.max_score,
            "summary": {
                "strengths": (result.overall_strengths or [])[:2],
                "weaknesses": (result.overall_weaknesses or [])[:2],
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grading failed: {str(e)}")


@router.get("/results/{assessment_id}", response_model=AssessmentResultResponse)
async def get_assessment_result(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_teacher: Teacher = Depends(get_current_teacher),
):
    """Fetch detailed assessment result by id."""
    result = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.id == assessment_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return result
