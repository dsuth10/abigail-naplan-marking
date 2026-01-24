from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class SubmissionBase(BaseModel):
    project_id: UUID
    content_raw: str = ""
    status: str = "DRAFT"

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(BaseModel):
    content_raw: Optional[str] = None
    status: Optional[str] = None

class SubmissionResponse(SubmissionBase):
    id: UUID
    student_id: UUID
    submitted_at: Optional[datetime] = None
    last_updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
