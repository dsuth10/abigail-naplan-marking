from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.base import Teacher
from src.schemas.teacher import TeacherLoginRequest, TokenResponse, TeacherResponse
from src.services.auth import verify_password, create_access_token, get_current_teacher

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def teacher_login(login_data: TeacherLoginRequest, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.username == login_data.username).first()
    if not teacher or not verify_password(login_data.password, teacher.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(
        data={"sub": str(teacher.id), "role": "teacher"}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=TeacherResponse)
async def get_me(current_teacher: Teacher = Depends(get_current_teacher)):
    return current_teacher
