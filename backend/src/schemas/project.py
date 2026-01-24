from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class ProjectBase(BaseModel):
    title: str
    genre: str
    instructions: str
    stimulus_html: str
    asset_paths: List[str] = []
    assigned_class_groups: List[str] = []
    is_active: bool = True

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
