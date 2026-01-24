from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional
from src.models.base import Submission
from src.schemas.submission import SubmissionCreate, SubmissionUpdate

class SubmissionService:
    @staticmethod
    def get_submission(db: Session, student_id: UUID, project_id: UUID) -> Submission:
        stmt = select(Submission).where(
            Submission.student_id == student_id,
            Submission.project_id == project_id
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create_or_update_draft(db: Session, student_id: UUID, project_id: UUID, content: str) -> Submission:
        submission = SubmissionService.get_submission(db, student_id, project_id)
        
        if submission:
            if submission.status == "SUBMITTED":
                return submission  # Or raise error if locked
            submission.content_raw = content
            submission.last_updated_at = datetime.now(timezone.utc)
        else:
            submission = Submission(
                student_id=student_id,
                project_id=project_id,
                content_raw=content,
                status="DRAFT"
            )
            db.add(submission)
        
        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def finalize_submission(db: Session, student_id: UUID, project_id: UUID) -> Submission:
        submission = SubmissionService.get_submission(db, student_id, project_id)
        if not submission:
            # Should not happen in normal flow
            return None
        
        submission.status = "SUBMITTED"
        submission.submitted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def unlock_submission(db: Session, submission_id: UUID) -> Optional[Submission]:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            return None
        
        submission.status = "DRAFT"
        submission.submitted_at = None
        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def get_project_submissions(db: Session, project_id: UUID) -> List[Submission]:
        stmt = select(Submission).where(Submission.project_id == project_id)
        return db.execute(stmt).scalars().all()

    @staticmethod
    def get_all_submissions(db: Session) -> List[Submission]:
        return db.query(Submission).all()
