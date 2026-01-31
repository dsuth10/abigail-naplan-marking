from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class TeacherBase(BaseModel):
    username: str
    full_name: str


class TeacherCreate(TeacherBase):
    password: str


class TeacherResponse(TeacherBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeacherLoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
