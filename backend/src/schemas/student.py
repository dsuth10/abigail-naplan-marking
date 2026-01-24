from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class StudentBase(BaseModel):
    name: str
    year_level: int
    id_code: str
    class_group: str
    avatar_id: str

class StudentCreate(StudentBase):
    password: str

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    year_level: Optional[int] = None
    avatar_id: Optional[str] = None
    password: Optional[str] = None

class StudentResponse(StudentBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    student_id: UUID
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
