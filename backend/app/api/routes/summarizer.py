from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.meeting_summarizer_service import analyze_meeting_notes
from app.services.task_service import create_task as service_create_task

router = APIRouter(prefix="/summarizer", tags=["Meeting Summarizer"])
logger = logging.getLogger(__name__)


@router.post("/analyze")
async def analyze_meeting(
    text: str | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transcript = ""
    if text:
        transcript = text
    elif file:
        try:
            file_bytes = await file.read()
            file_name = file.filename or "meeting_notes.txt"
            file_type = file_name.split(".")[-1].lower() if "." in file_name else ""
            
            from app.services.ai_copilot_service import extract_text_from_file
            transcript = extract_text_from_file(file_bytes, file_type, file_name)
        except Exception as e:
            logger.exception("Failed to extract text from uploaded file: %s", str(e))
            raise HTTPException(
                status_code=400,
                detail=f"Failed to read or extract text from file: {str(e)}"
            )

    if not transcript or not transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcript text or file containing meeting notes is required."
        )

    try:
        analysis = analyze_meeting_notes(db, transcript, current_user)
        return analysis
    except Exception as exc:
        logger.exception("Failed to analyze meeting notes: %s", str(exc))
        raise HTTPException(
            status_code=500,
            detail="Internal error analyzing meeting notes. Please try again."
        )


@router.post("/create-tasks")
def bulk_create_tasks(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project_id = payload.get("project_id")
    if project_id in ["", "null", None]:
        project_id = None
    else:
        project_id = int(project_id)

    tasks_data = payload.get("tasks", [])
    created_tasks = []

    for task_item in tasks_data:
        title = task_item.get("title", "Suggested task").strip()
        if not title:
            continue

        priority = task_item.get("priority", "medium")
        assignee_name = task_item.get("assignee_name")
        due_in_days = task_item.get("due_in_days")
        reason = task_item.get("reason", "")

        # 1. Resolve assignee by matching name (case-insensitive)
        assigned_to_id = None
        if assignee_name:
            matched_user = (
                db.query(User)
                .filter(User.full_name.like(f"%{assignee_name}%"))
                .first()
            )
            if matched_user:
                assigned_to_id = matched_user.id

        # 2. Resolve due date
        due_date = None
        if due_in_days is not None:
            try:
                due_date = (datetime.utcnow() + timedelta(days=int(due_in_days))).isoformat()
            except Exception:
                pass

        # 3. Formulate description
        description = task_item.get("description") or f"Task suggested from meeting transcript."
        if reason:
            description += f"\n\nExplainability: {reason}"

        # 4. Map task schema for shared service
        task_payload = {
            "title": title,
            "description": description,
            "priority": priority,
            "project_id": project_id,
            "assigned_to": assigned_to_id,
            "due_date": due_date,
            "status": "todo",
            "labels": "meeting-suggested",
        }

        try:
            task_obj = service_create_task(db, task_payload, current_user)
            created_tasks.append({
                "id": task_obj.id,
                "title": task_obj.title,
            })
        except Exception as e:
            logger.exception("Failed to create suggested task %s: %s", title, str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create suggested tasks: {str(e)}"
            )

    return {
        "success": True,
        "created_count": len(created_tasks),
        "tasks": created_tasks
    }
