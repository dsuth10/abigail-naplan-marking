from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Dict, Any


class CriterionAssessment(BaseModel):
    score: int
    max_score: int
    feedback: str
    evidence: List[str] = []
    recommendations: List[str] = []


class AssessmentResultResponse(BaseModel):
    id: UUID
    submission_id: UUID
    genre: str
    total_score: int
    max_score: int
    generated_at: datetime
    overall_strengths: List[str]
    overall_weaknesses: List[str]
    criteria_scores: Dict[str, Any]  # criterion name -> CriterionAssessment-like dict
    full_report_md: str

    model_config = ConfigDict(from_attributes=True)
