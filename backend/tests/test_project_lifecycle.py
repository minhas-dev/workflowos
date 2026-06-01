import os
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Setup env variables before importing app components
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")

from app.core.database import Base
from app.models.project import Project
from app.models.task import Task
from app.services.project_lifecycle_service import evaluate_project_lifecycle

# Create test database
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_project_lifecycle_rules():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # 1. Create project with 0 tasks -> should become "planning"
        project = Project(name="Test Project Lifecycle App", description="Testing the automated lifecycle rules in WorkflowOS.", status="active")
        db.add(project)
        db.commit()
        db.refresh(project)

        evaluate_project_lifecycle(project.id, db)
        assert project.status == "planning"
        assert project.progress == 0

        # 2. Add a task with status "todo" -> should stay "planning"
        task1 = Task(title="Task 1", status="todo", project_id=project.id)
        db.add(task1)
        db.commit()
        db.refresh(task1)

        evaluate_project_lifecycle(project.id, db)
        assert project.status == "planning"
        assert project.progress == 0

        # 3. Move task to "in_progress" -> should auto-transition to "active"
        task1.status = "in_progress"
        db.commit()

        evaluate_project_lifecycle(project.id, db)
        assert project.status == "active"
        assert project.progress == 0

        # 4. Set status to "on_hold" manually -> should preserve "on_hold" status even if tasks are updated
        project.status = "on_hold"
        db.commit()

        # Update task to completed, progress is now 100%
        task1.status = "completed"
        db.commit()

        evaluate_project_lifecycle(project.id, db)
        assert project.status == "on_hold"
        assert project.progress == 100

        # 5. Set status back to "active" manually -> progress is 100%, but should NOT auto-complete to "completed" in backend
        project.status = "active"
        db.commit()

        evaluate_project_lifecycle(project.id, db)
        assert project.status == "active"  # Does not auto-complete in backend (frontend modal will ask)
        assert project.progress == 100

        # 6. Manually complete the project (status = "completed")
        project.status = "completed"
        db.commit()

        # 7. Add a new unfinished task -> progress drops below 100%, but status must remain "completed" in backend (prompted on frontend)
        task2 = Task(title="Task 2", status="todo", project_id=project.id)
        db.add(task2)
        db.commit()

        evaluate_project_lifecycle(project.id, db)
        assert project.status == "completed"  # Remains completed in backend
        assert project.progress == 50  # 1 out of 2 tasks completed (50%)

    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
