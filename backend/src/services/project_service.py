from sqlalchemy.orm import Session
from sqlalchemy import select, update
from uuid import UUID
from typing import List, Optional
from src.models.base import Project
from src.schemas.project import ProjectCreate

class ProjectService:
    @staticmethod
    def list_projects(db: Session) -> List[Project]:
        return db.query(Project).all()

    @staticmethod
    def create_project(db: Session, project_data: ProjectCreate) -> Project:
        project = Project(
            title=project_data.title,
            genre=project_data.genre,
            instructions=project_data.instructions,
            stimulus_html=project_data.stimulus_html,
            asset_paths=project_data.asset_paths,
            assigned_class_groups=project_data.assigned_class_groups,
            is_active=project_data.is_active
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_project(db: Session, project_id: UUID) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def update_project(db: Session, project_id: UUID, project_data: ProjectCreate) -> Optional[Project]:
        project = ProjectService.get_project(db, project_id)
        if project:
            project.title = project_data.title
            project.genre = project_data.genre
            project.instructions = project_data.instructions
            project.stimulus_html = project_data.stimulus_html
            project.asset_paths = project_data.asset_paths
            project.assigned_class_groups = project_data.assigned_class_groups
            project.is_active = project_data.is_active
            db.commit()
            db.refresh(project)
        return project

    @staticmethod
    def toggle_project_status(db: Session, project_id: UUID) -> Optional[Project]:
        project = ProjectService.get_project(db, project_id)
        if project:
            project.is_active = not project.is_active
            db.commit()
            db.refresh(project)
        return project

    @staticmethod
    def get_projects_by_class_group(db: Session, class_group: str) -> List[Project]:
        # SQLite JSON contains check
        return db.query(Project).filter(
            Project.is_active == True,
            Project.assigned_class_groups.contains(class_group)
        ).all()
