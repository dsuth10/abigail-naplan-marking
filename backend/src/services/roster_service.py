import csv
import io
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Dict, Any
import uuid

from src.models.base import Student
from src.services.auth import get_password_hash

class RosterService:
    @staticmethod
    def process_csv(db: Session, csv_content: str) -> Dict[str, Any]:
        """
        Process student roster CSV.
        Expected columns: Name, Year Level, ID Code, Class Group, Password, Avatar ID
        """
        # Use io.StringIO to treat the string as a file
        # utf-8-sig is handled by the caller or by reading the BOM if present
        f = io.StringIO(csv_content)
        reader = csv.DictReader(f)
        
        results = {
            "total": 0,
            "created": 0,
            "updated": 0,
            "errors": []
        }

        for row in reader:
            results["total"] += 1
            try:
                # Basic validation
                required = ["Name", "Year Level", "ID Code", "Class Group", "Password", "Avatar ID"]
                missing = [col for col in required if col not in row or not row[col]]
                if missing:
                    results["errors"].append(f"Row {results['total']}: Missing columns {missing}")
                    continue

                id_code = row["ID Code"].strip()
                
                # Check for existing student
                existing_student = db.execute(
                    select(Student).where(Student.id_code == id_code)
                ).scalar_one_or_none()

                if existing_student:
                    # Update existing student
                    existing_student.name = row["Name"].strip()
                    existing_student.year_level = int(row["Year Level"])
                    existing_student.class_group = row["Class Group"].strip()
                    existing_student.avatar_id = row["Avatar ID"].strip()
                    if row["Password"]:
                        existing_student.password_hash = get_password_hash(row["Password"])
                    results["updated"] += 1
                else:
                    # Create new student
                    new_student = Student(
                        id=uuid.uuid4(),
                        name=row["Name"].strip(),
                        year_level=int(row["Year Level"]),
                        id_code=id_code,
                        class_group=row["Class Group"].strip(),
                        avatar_id=row["Avatar ID"].strip(),
                        password_hash=get_password_hash(row["Password"])
                    )
                    db.add(new_student)
                    results["created"] += 1
                
                # Commit periodically or at the end
                if results["created"] + results["updated"] % 50 == 0:
                    db.commit()

            except Exception as e:
                results["errors"].append(f"Row {results['total']}: {str(e)}")

        db.commit()
        return results
