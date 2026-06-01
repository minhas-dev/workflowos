import logging
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.services.activity_service import create_activity
from app.services.notification_service import create_notification
from app.services.realtime_service import schedule_project_event, schedule_global_event

logger = logging.getLogger(__name__)


def evaluate_project_lifecycle(
    project_id: int | None,
    db: Session,
    actor_id: int | None = None
) -> Project | None:
    if project_id is None:
        return None

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        logger.warning("Project lifecycle evaluation skipped: project_id %s not found", project_id)
        return None

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    if not tasks:
        # Projects with 0 tasks stay/become planning
        project.progress = 0
        if project.status not in ["on_hold", "completed"]:
            if project.status != "planning":
                previous_status = project.status
                project.status = "planning"
                _log_status_change(db, project, previous_status, "planning", actor_id)
        
        db.commit()
        db.refresh(project)
        return project

    total_tasks = len(tasks)
    completed_tasks = [t for t in tasks if t.status == "completed"]
    completed_count = len(completed_tasks)

    # Compute progress (same logic as before)
    new_progress = round((completed_count / total_tasks) * 100)
    project.progress = new_progress

    # Check for started tasks (any task status other than "todo")
    started_tasks = [t for t in tasks if t.status != "todo"]
    has_started_work = len(started_tasks) > 0

    previous_status = project.status

    if project.status == "on_hold":
        # Rule 1: If project status = Hold, DO NOT automatically override it
        logger.info("Project %s is on hold, preserving status.", project_id)
    elif project.status == "completed":
        # Rule 2: If project is completed, but new task is added, do not auto-revert
        # The frontend will ask to Reopen the project.
        logger.info("Project %s is completed, preserving status.", project_id)
    else:
        # Status is either "planning" or "active"
        # Note: we DO NOT auto-complete to "completed" when progress == 100 here.
        # The frontend modal handles confirmation.
        if has_started_work:
            if project.status == "planning":
                project.status = "active"
                _log_status_change(db, project, previous_status, "active", actor_id)
        else:
            if project.status == "active":
                project.status = "planning"
                _log_status_change(db, project, previous_status, "planning", actor_id)

    db.commit()
    db.refresh(project)

    # Notify dashboard/analytics about updates
    schedule_global_event(
        "analytics.updated",
        {"source": "project.lifecycle", "project_id": project.id},
    )

    return project


def _log_status_change(
    db: Session,
    project: Project,
    old_status: str,
    new_status: str,
    actor_id: int | None
):
    actor = db.query(User).filter(User.id == actor_id).first() if actor_id else None
    actor_name = actor.full_name if actor else "System"

    create_activity(
        db=db,
        action_type="project_status_changed",
        message=f"{actor_name} changed project {project.name} from {old_status} to {new_status} (automated lifecycle).",
        user_id=actor_id,
        project_id=project.id,
    )

    if project.owner_id:
        create_notification(
            db=db,
            user_id=project.owner_id,
            title="Project status updated",
            message=f"{project.name} is now in {new_status} state.",
            type="info",
        )

    schedule_project_event(
        project.id,
        "project.updated",
        {"project_id": project.id, "name": project.name, "status": project.status},
    )
