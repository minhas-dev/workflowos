import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header,
)

from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_optional_current_user, get_current_user
from fastapi import UploadFile, File
from app.models.attachment import Attachment
from app.services.attachment_service import save_upload, delete_attachment, ensure_can_download_attachment

from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.services.activity_service import create_activity
from app.services.notification_service import create_notification
from app.services.realtime_service import schedule_global_event, schedule_project_event
from app.services.automation_service import schedule_trigger
from app.services.task_service import (
    create_task as service_create_task,
    update_task as service_update_task,
    serialize_task as service_serialize_task,
)
from app.services.project_lifecycle_service import evaluate_project_lifecycle

from datetime import datetime


router = APIRouter()

logger = logging.getLogger(__name__)


# =========================
# ROLE PERMISSIONS
# =========================

from app.core.rbac import RBAC


def require_tasks_write(current_user_role: str | None):
    decision = RBAC.check_global_permission(
        user_role=current_user_role or "",
        permission="tasks_write",
    )
    if not decision.allowed:
        raise HTTPException(status_code=403, detail="Permission denied")







def update_project_progress(
    project_id: int | None,
    db: Session
):
    return evaluate_project_lifecycle(project_id, db)


def actor_label(user: User | None):
    return user.full_name if user else "A teammate"


def parse_datetime(value):
    if not value or isinstance(value, datetime):
        return value

    parsed = datetime.fromisoformat(
        str(value).replace("Z", "+00:00")
    )

    return parsed.replace(tzinfo=None)


BOARD_STATUSES = [
    "todo",
    "in_progress",
    "review",
    "blocked",
    "completed",
]


def serialize_task(task: Task):
    return service_serialize_task(task)


# =========================
# GET TASKS
# =========================

@router.get("/")
def get_tasks(
    db: Session = Depends(get_db)
):

    tasks = (
        db.query(Task)
        .options(
            joinedload(Task.assignee),
            joinedload(Task.project),
            joinedload(Task.comments),
            joinedload(Task.attachments),
        )
        .order_by(Task.position.asc(), Task.created_at.desc())
        .all()
    )

    return [serialize_task(task) for task in tasks]


@router.get("/board")
def get_task_board(db: Session = Depends(get_db)):
    tasks = (
        db.query(Task)
        .options(
            joinedload(Task.assignee),
            joinedload(Task.project),
            joinedload(Task.comments),
            joinedload(Task.attachments),
        )
        .order_by(Task.position.asc(), Task.created_at.asc())
        .all()
    )

    return {
        status: [
            serialize_task(task)
            for task in tasks
            if task.status == status
        ]
        for status in BOARD_STATUSES
    }


# =========================
# CREATE TASK
# =========================

@router.post("/")
def create_task(
    task: dict,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    require_tasks_write(current_user.role if current_user else None)

    return service_create_task(db, task, current_user)



# =========================
# UPDATE TASK
# =========================

@router.put("/{task_id}")
def update_task(
    task_id: int,
    updated_task: dict,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    require_tasks_write(current_user.role if current_user else None)

    return service_update_task(db, task_id, updated_task, current_user)



@router.put("/{task_id}/move")
def move_task(
    task_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):

    new_status = payload.get("status")
    new_position = int(payload.get("position", 0))

    if new_status not in BOARD_STATUSES:
        raise HTTPException(
            status_code=422,
            detail="Invalid board column",
        )


    require_tasks_write(current_user.role if current_user else None)



    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    old_status = task.status
    task.status = new_status
    task.position = new_position

    siblings = (
        db.query(Task)
        .filter(Task.status == new_status)
        .filter(Task.id != task_id)
        .order_by(Task.position.asc(), Task.created_at.asc())
        .all()
    )

    for index, sibling in enumerate(siblings):
        sibling.position = index if index < new_position else index + 1

    update_project_progress(task.project_id, db)

    create_activity(
        db=db,
        action_type="task_moved",
        message=f"{actor_label(current_user)} moved {task.title} from {old_status} to {new_status}.",
        user_id=current_user.id if current_user else None,
        project_id=task.project_id,
        task_id=task.id,
    )

    if new_status == "completed":
        create_activity(
            db=db,
            action_type="task_completed",
            message=f"{actor_label(current_user)} completed task {task.title}.",
            user_id=current_user.id if current_user else None,
            project_id=task.project_id,
            task_id=task.id,
        )

    db.commit()
    db.refresh(task)

    logger.info(
        "task.moved task_id=%s project_id=%s old_status=%s new_status=%s",
        task.id,
        task.project_id,
        old_status,
        task.status,
    )

    if task.project_id is not None:
        schedule_project_event(
            task.project_id,
            "task.moved",
            {
                "task_id": task.id,
                "status": task.status,
                "position": task.position or 0,
                "project_id": task.project_id,
            },
        )
    schedule_global_event(
        "analytics.updated",
        {"source": "task.moved", "task_id": task.id, "project_id": task.project_id},
    )

    schedule_trigger(
        "task.moved",
        {
            "task_id": task.id,
            "project_id": task.project_id,
            "assignee_id": task.assigned_to,
            "actor_id": current_user.id if current_user else None,
            "old_status": old_status,
            "new_status": task.status,
            "entity_type": "task",
            "entity_id": task.id,
            "task": serialize_task(task),
        },
    )

    return serialize_task(task)




# =========================
# DELETE TASK
# =========================

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),

    current_user: User | None = Depends(get_optional_current_user),
):
    require_tasks_write(current_user.role if current_user else None)



    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    project_id = task.project_id
    deleted_task_id = task.id
    deleted_task_title = task.title

    db.delete(task)
    db.commit()

    update_project_progress(
        project_id,
        db
    )

    create_activity(
        db=db,
        action_type="task_deleted",
        message=f"{actor_label(current_user)} deleted task {deleted_task_title}.",
        user_id=current_user.id if current_user else None,
        project_id=project_id,
        task_id=None,
    )

    db.commit()

    logger.info(
        "task.deleted task_id=%s project_id=%s",
        deleted_task_id,
        project_id,
    )

    if project_id is not None:
        schedule_project_event(
            project_id,
            "task.deleted",
            {"task_id": deleted_task_id, "project_id": project_id},
        )

    schedule_global_event(
        "analytics.updated",
        {"source": "task.deleted", "task_id": deleted_task_id, "project_id": project_id},
    )

    return {
        "success": True,
        "message": "Task deleted successfully"
    }


@router.get("/{task_id}/files")
def list_task_files(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    attachments = (
        db.query(Attachment)
        .filter(Attachment.task_id == task_id)
        .filter(Attachment.comment_id.is_(None))
        .order_by(Attachment.uploaded_at.desc())
        .all()
    )

    accessible = []
    for attachment in attachments:
        try:
            ensure_can_download_attachment(db, attachment, current_user)
            accessible.append(attachment)
        except Exception:
            continue

    return accessible


@router.post("/{task_id}/files")
def upload_task_file(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    attachment = save_upload(
        db=db,
        file=file,
        user=current_user,
        task_id=task_id,
    )

    schedule_project_event(
        attachment.project_id,
        "attachment.created",
        {"attachment_id": attachment.id, "task_id": attachment.task_id},
    )
    schedule_global_event(
        "analytics.updated",
        {"source": "attachment.created", "attachment_id": attachment.id, "project_id": attachment.project_id},
    )

    create_activity(
        db=db,
        action_type="attachment_uploaded",
        message=f"{current_user.full_name} uploaded {attachment.original_filename} to task {task.title}.",
        user_id=current_user.id,
        project_id=attachment.project_id,
        task_id=attachment.task_id,
        entity_type="attachment",
        entity_id=attachment.id,
    )

    schedule_trigger(
        "attachment.uploaded",
        {
            "attachment_id": attachment.id,
            "task_id": attachment.task_id,
            "project_id": attachment.project_id,
            "actor_id": current_user.id,
            "entity_type": "attachment",
            "entity_id": attachment.id,
            "message": attachment.original_filename,
        },
    )

    return attachment


@router.delete("/{task_id}/files/{file_id}")
def delete_task_file(
    task_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attachment = (
        db.query(Attachment)
        .filter(Attachment.id == file_id)
        .filter(Attachment.task_id == task_id)
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="File not found")

    schedule_project_event(
        attachment.project_id,
        "attachment.deleted",
        {"attachment_id": attachment.id, "task_id": attachment.task_id},
    )

    result = delete_attachment(db, attachment, user=current_user)
    return result


@router.post("/{task_id}/ai-summary")
def get_task_ai_summary(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.ai_task_service import generate_ai_task_summary

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    summary = generate_ai_task_summary(db, task_id)
    return {"summary": summary}
