import os
import zipfile
import io
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Tuple
from uuid import UUID

from src.models.base import Submission, Student, Project

class ExportService:
    @staticmethod
    def export_project_submissions_to_zip(db: Session, project_id: UUID) -> Tuple[io.BytesIO, str]:
        """
        Export all submissions for a project as raw text files in a zip archive.
        """
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return None, ""

        submissions = db.query(Submission, Student).join(Student).filter(
            Submission.project_id == project_id,
            Submission.status == "SUBMITTED"
        ).all()

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for submission, student in submissions:
                # Create a filename: StudentName_IDCode.txt
                filename = f"{student.name}_{student.id_code}.txt"
                # Remove characters that might be invalid in filenames
                filename = "".join(c for c in filename if c.isalnum() or c in (' ', '_', '-', '.')).strip()
                
                # The content_raw preserves original tabs and newlines
                zip_file.writestr(filename, submission.content_raw)

        zip_buffer.seek(0)
        zip_filename = f"{project.title}_Submissions.zip"
        zip_filename = "".join(c for c in zip_filename if c.isalnum() or c in (' ', '_', '-', '.')).strip()
        
        return zip_buffer, zip_filename
