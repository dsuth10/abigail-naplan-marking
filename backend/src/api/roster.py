from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database import get_db
from src.models.base import Teacher
from src.services.roster_service import RosterService
from src.services.auth import get_current_teacher

router = APIRouter()


@router.get("/class-groups", response_model=List[str])
async def get_class_groups(
    db: Session = Depends(get_db),
    current_teacher: Teacher = Depends(get_current_teacher),
):
    """Get unique class groups from the roster."""
    return RosterService.get_class_groups(db)


@router.post("/upload")
async def upload_roster(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_teacher: Teacher = Depends(get_current_teacher),
):
    """Upload student roster CSV."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        # Read content and handle utf-8-sig
        content = await file.read()
        decoded_content = content.decode('utf-8-sig')
        
        results = RosterService.process_csv(db, decoded_content)
        return results
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Could not decode CSV file. Please ensure it is UTF-8 encoded.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing roster: {str(e)}")
