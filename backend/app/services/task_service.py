import json
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.services.activity_service import create_activity
from app.services.notification_service import create_notification
from app.services.realtime_service import (
    schedule_global_event,
    schedule_project_event,
)
from app.services.automation_service import schedule_trigger
from app.services.project_lifecycle_service import evaluate_project_lifecycle

BOARD_STATUSES = [
    "todo",
    "in_progress",
    "review",
    "blocked",
    "completed",
]


def parse_datetime(value: Any) -> Any:
    if not value or isinstance(value, datetime):
        return value

    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    return parsed.replace(tzinfo=None)


def actor_label(user: Optional[User] = None) -> str:
    return user.full_name if user else "A teammate"


def compute_task_intelligence(task: Task) -> dict[str, Any]:
    score = 100
    badge = "healthy"
    warnings = []
    suggestions = []

    if task.status == "completed":
        return {
            "score": 100,
            "badge": "healthy",
            "warnings": [],
            "suggestions": ["Task is completed successfully!"]
        }

    if task.status == "blocked":
        score -= 30
        badge = "at_risk"
        warnings.append("This task is currently marked as blocked.")
        suggestions.append("Address the blocker or reassign dependencies.")

    is_overdue = False
    if task.due_date and task.due_date < datetime.utcnow():
        is_overdue = True
        score -= 40
        badge = "overdue"
        warnings.append(f"Task is overdue by {int((datetime.utcnow() - task.due_date).days)} days.")
        suggestions.append("Reschedule the due date or prioritize immediately.")

    if task.priority == "high":
        score -= 10
        if badge == "healthy":
            badge = "high_priority"
        warnings.append("High priority task requires attention.")
        suggestions.append("Allocate dedicated focus to resolve high-priority items.")
    elif task.priority == "critical":
        score -= 20
        if badge == "healthy":
            badge = "high_priority"
        warnings.append("Critical priority task requires immediate resolution.")
        suggestions.append("Escalate blockers and complete as soon as possible.")

    checklist_items = []
    if task.checklist:
        try:
            checklist_items = json.loads(task.checklist)
        except Exception:
            pass

    if checklist_items:
        total = len(checklist_items)
        completed = sum(1 for item in checklist_items if item.get("completed"))
        if total > 0:
            completed_ratio = completed / total
            if completed_ratio < 1.0:
                deduction = int((1.0 - completed_ratio) * 20)
                score -= deduction
                warnings.append(f"{total - completed} of {total} checklist items are incomplete.")
                suggestions.append("Complete the remaining subtasks in the checklist.")
            if completed_ratio == 0:
                suggestions.append("Start working on the first checklist item.")

    if task.due_date and not is_overdue:
        time_left = task.due_date - datetime.utcnow()
        if time_left.total_seconds() < 86400:
            score -= 10
            warnings.append("Task deadline is in less than 24 hours.")
            suggestions.append("Review task scope to meet the impending deadline.")

    if task.priority in ["high", "critical"] and not (task.comments):
        score -= 10
        warnings.append("No discussion or updates recorded on this high-priority task.")
        suggestions.append("Leave a comment or update to log progress.")

    score = max(0, min(100, score))

    if score < 50 and badge == "healthy":
        badge = "at_risk"

    return {
        "score": score,
        "badge": badge,
        "warnings": warnings,
        "suggestions": list(set(suggestions))
    }


def serialize_task(task: Task) -> dict[str, Any]:
    try:
        checklist_items = json.loads(task.checklist) if task.checklist else []
    except Exception:
        checklist_items = []

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "created_at": task.created_at,
        "due_date": task.due_date,
        "project_id": task.project_id,
        "assigned_to": task.assigned_to,
        "position": task.position or 0,
        "labels": [
            label.strip()
            for label in (task.labels or "").split(",")
            if label.strip()
        ],
        "assignee": task.assignee,
        "project": task.project,
        "comment_count": len(task.comments or []),
        "attachment_count": len(task.attachments or []),
        "checklist": checklist_items,
        "intelligence": compute_task_intelligence(task),
    }


def update_project_progress(project_id: int | None, db: Session) -> Optional[Project]:
    return evaluate_project_lifecycle(project_id, db)


def _normalize_labels(labels: Any) -> str:
    if labels is None:
        return ""
    if isinstance(labels, list):
        return ",".join([str(label).strip() for label in labels if str(label).strip()])
    if isinstance(labels, str):
        return labels
    return str(labels)


def create_task(
    db: Session,
    payload: dict[str, Any],
    current_user: Optional[User] = None,
) -> Task:
    project_id = payload.get("project_id")
    if project_id in ["", "null", None]:
        project_id = None

    labels = _normalize_labels(payload.get("labels") or payload.get("tags") or [])
    next_position = db.query(Task).filter(Task.status == (payload.get("status") or "todo")).count()

    new_task = Task(
        title=payload.get("title") or "Untitled task",
        description=payload.get("description"),
        priority=payload.get("priority") or "medium",
        project_id=project_id,
        assigned_to=payload.get("assigned_to"),
        due_date=parse_datetime(payload.get("due_date") or payload.get("deadline")),
        status=payload.get("status") or "todo",
        position=payload.get("position", next_position),
        labels=labels,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    update_project_progress(new_task.project_id, db)

    create_activity(
        db=db,
        action_type="task_created",
        message=f"{actor_label(current_user)} created task {new_task.title}.",
        user_id=current_user.id if current_user else None,
        project_id=new_task.project_id,
        task_id=new_task.id,
    )

    if new_task.assigned_to:
        create_activity(
            db=db,
            action_type="task_assigned",
            message=f"{new_task.title} was assigned to a teammate.",
            user_id=current_user.id if current_user else None,
            project_id=new_task.project_id,
            task_id=new_task.id,
        )
        create_notification(
            db=db,
            user_id=new_task.assigned_to,
            title="New task assigned",
            message=f"You were assigned to {new_task.title}.",
            type="info",
        )

    if new_task.due_date and new_task.due_date < datetime.utcnow() and new_task.assigned_to:
        create_notification(
            db=db,
            user_id=new_task.assigned_to,
            title="Task overdue",
            message=f"{new_task.title} is already overdue.",
            type="warning",
        )

    db.commit()

    if new_task.project_id is not None:
        schedule_project_event(
            new_task.project_id,
            "task.created",
            {
                "task_id": new_task.id,
                "status": new_task.status,
                "position": new_task.position or 0,
                "project_id": new_task.project_id,
                "title": new_task.title,
            },
        )

    schedule_global_event(
        "activity.created",
        {"project_id": new_task.project_id, "task_id": new_task.id},
    )
    schedule_global_event(
        "analytics.updated",
        {"source": "task.created", "task_id": new_task.id, "project_id": new_task.project_id},
    )

    schedule_trigger(
        "task.created",
        {
            "task_id": new_task.id,
            "project_id": new_task.project_id,
            "assignee_id": new_task.assigned_to,
            "actor_id": current_user.id if current_user else None,
            "entity_type": "task",
            "entity_id": new_task.id,
            "task": serialize_task(new_task),
        },
    )

    return new_task


def update_task(
    db: Session,
    task_id: int,
    payload: dict[str, Any],
    current_user: Optional[User] = None,
) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise ValueError("Task not found")

    old_project_id = task.project_id
    old_status = task.status
    old_assigned_to = task.assigned_to
    old_due_date = task.due_date

    if payload.get("due_date") or payload.get("deadline"):
        payload["due_date"] = parse_datetime(payload.get("due_date") or payload.get("deadline"))

    payload.pop("deadline", None)

    if isinstance(payload.get("labels"), list):
        payload["labels"] = ",".join([label.strip() for label in payload.get("labels") if label.strip()])

    old_checklist = []
    if task.checklist:
        try:
            old_checklist = json.loads(task.checklist)
        except Exception:
            pass

    if "checklist" in payload:
        new_val = payload["checklist"]
        new_checklist = []
        if isinstance(new_val, (list, dict)):
            new_checklist = new_val
        elif isinstance(new_val, str) and new_val:
            try:
                new_checklist = json.loads(new_val)
            except Exception:
                pass

        old_completed_ids = {item.get("id") for item in old_checklist if item.get("completed")}
        for item in new_checklist:
            item_id = item.get("id")
            is_completed = item.get("completed")
            item_name = item.get("name") or "Subtask"
            if is_completed and item_id not in old_completed_ids:
                create_activity(
                    db=db,
                    action_type="checklist_completed",
                    message=f"{actor_label(current_user)} checked off '{item_name}' on task {task.title}.",
                    user_id=current_user.id if current_user else None,
                    project_id=task.project_id,
                    task_id=task.id,
                )

        payload["checklist"] = json.dumps(new_checklist)

    for key, value in payload.items():
        if hasattr(task, key):
            if key in ["project_id", "assigned_to"]:
                if value in ["", "null", None]:
                    setattr(task, key, None)
                else:
                    setattr(task, key, int(value))
            elif key == "due_date":
                if value in ["", "null", None]:
                    setattr(task, key, None)
                else:
                    setattr(task, key, value)
            elif value is not None:
                setattr(task, key, value)

    db.commit()
    db.refresh(task)

    update_project_progress(old_project_id, db)
    project = update_project_progress(task.project_id, db)

    if "status" in payload and payload.get("status") != old_status:
        create_activity(
            db=db,
            action_type="task_moved",
            message=f"{actor_label(current_user)} moved {task.title} from {old_status} to {task.status}.",
            user_id=current_user.id if current_user else None,
            project_id=task.project_id,
            task_id=task.id,
        )

        if task.status == "completed":
            create_activity(
                db=db,
                action_type="task_completed",
                message=f"{actor_label(current_user)} completed task {task.title}.",
                user_id=current_user.id if current_user else None,
                project_id=task.project_id,
                task_id=task.id,
            )
            create_notification(
                db=db,
                user_id=task.assigned_to,
                title="Task completed",
                message=f"{task.title} was completed.",
                type="success",
            )



    if "assigned_to" in payload and payload.get("assigned_to") != old_assigned_to:
        create_activity(
            db=db,
            action_type="task_assigned",
            message=f"{task.title} was assigned to a teammate.",
            user_id=current_user.id if current_user else None,
            project_id=task.project_id,
            task_id=task.id,
        )
        create_notification(
            db=db,
            user_id=task.assigned_to,
            title="Task assigned to you",
            message=f"You were assigned to {task.title}.",
            type="info",
        )

    if "due_date" in payload and task.due_date != old_due_date:
        create_activity(
            db=db,
            action_type="deadline_updated",
            message=f"{actor_label(current_user)} updated the deadline for {task.title}.",
            user_id=current_user.id if current_user else None,
            project_id=task.project_id,
            task_id=task.id,
        )

    if task.due_date and task.due_date < datetime.utcnow() and task.status != "completed":
        create_notification(
            db=db,
            user_id=task.assigned_to,
            title="Task overdue",
            message=f"{task.title} is overdue.",
            type="warning",
        )

    db.commit()

    if task.project_id is not None:
        schedule_project_event(
            task.project_id,
            "task.updated",
            {
                "task_id": task.id,
                "status": task.status,
                "position": task.position or 0,
                "project_id": task.project_id,
                "title": task.title,
            },
        )

    schedule_global_event(
        "analytics.updated",
        {"source": "task.updated", "task_id": task.id, "project_id": task.project_id},
    )

    if "due_date" in payload and task.due_date != old_due_date:
        schedule_trigger(
            "deadline.approaching",
            {
                "task_id": task.id,
                "project_id": task.project_id,
                "assignee_id": task.assigned_to,
                "actor_id": current_user.id if current_user else None,
                "entity_type": "task",
                "entity_id": task.id,
                "task": serialize_task(task),
            },
        )

    return task


def find_task_by_title(db: Session, title: str) -> Optional[Task]:
    if not title:
        return None

    normalized = title.strip()
    tasks = (
        db.query(Task)
        .filter(Task.title.ilike(f"%{normalized}%"))
        .all()
    )

    if len(tasks) == 1:
        return tasks[0]

    exact = [task for task in tasks if task.title.strip().lower() == normalized.lower()]
    if len(exact) == 1:
        return exact[0]

    return None


def find_user_by_name(db: Session, name: str) -> Optional[User]:
    if not name:
        return None

    normalized = name.strip()
    if normalized.isdigit():
        return db.query(User).filter(User.id == int(normalized)).first()

    users = (
        db.query(User)
        .filter(
            (User.full_name.ilike(f"%{normalized}%")) |
            (User.email.ilike(f"%{normalized}%"))
        )
        .all()
    )

    if len(users) == 1:
        return users[0]

    exact = [user for user in users if user.full_name.strip().lower() == normalized.lower()]
    if len(exact) == 1:
        return exact[0]

    return None
