from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.demo_seed_service import seed_demo_for_user


router = APIRouter(prefix="/demo", tags=["Demo"])

logger = logging.getLogger(__name__)


@router.post("/seed")
def seed_demo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
         result = seed_demo_for_user(db, current_user)
         return {
             "success": True,
             "seeded": result.seeded,
             "details": result.details,
         }
    except Exception as exc:
         logger.exception(
             "Demo seed failed user_id=%s error=%s",
             current_user.id,
             str(exc),
         )
         raise HTTPException(
             status_code=500,
             detail="Unable to create demo workspace right now. Please try again.",
         )


@router.get("/status")
def get_demo_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "seeded": bool(getattr(current_user, "demo_seeded_at", None)),
        "onboarding_completed": bool(getattr(current_user, "onboarding_completed_at", None)),
    }


@router.post("/reset")
def reset_demo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.services.demo_seed_service import reset_demo_for_user
        reset_demo_for_user(db, current_user)
        return {"success": True}
    except Exception as exc:
        logger.exception("Demo reset failed user_id=%s", current_user.id)
        raise HTTPException(
            status_code=500,
            detail="Unable to reset demo workspace.",
        )

