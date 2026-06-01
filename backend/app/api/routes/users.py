import base64

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.database import get_db, engine
from app.core.deps import get_current_user
from app.core.security import (
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.user import (
    PasswordUpdateRequest,
    UserProfileUpdate,
)
from app.models.task import Task
from app.models.sprint import Sprint
from app.models.milestone import Milestone
from app.models.activity import Activity
from app.models.analytics import AnalyticsSnapshot, ProductivityMetric, WorkloadMetric
from app.models.ai_agent import (
    AIAgentMemory,
    AIRecommendation,
    AIExecutionLog,
    AIApprovalHistory,
    AIContextSnapshot,
    AIDecisionHistory,
    AISummary,
    AIOperationalObservation,
    AIConversation,
    AIDocument,
    AIDocumentChunk,
    AIRetrievalLog,
)
from app.models.integration import (
    Integration,
    OAuthAccount,
    OAuthState,
    WebhookEndpoint,
    APIToken,
)
from app.models.project_invitation import ProjectInvitation
from app.models.automation import AutomationRule


router = APIRouter()


def ensure_avatar_column():
    inspector = inspect(engine)

    if not inspector.has_table("users"):
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("users")
    }

    if "avatar_url" not in existing_columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN avatar_url TEXT")
            )


def get_avatar_url(db: Session, user_id: int) -> str | None:
    ensure_avatar_column()

    result = db.execute(
        text("SELECT avatar_url FROM users WHERE id = :user_id"),
        {"user_id": user_id},
    ).first()

    return result[0] if result else None


def serialize_user(user: User, avatar_url: str | None = None) -> dict:
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "avatar_url": avatar_url,
        "role": user.role,
    }


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return users


@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG, WEBP, and GIF images are allowed."
            ),
        )

    file_bytes = await file.read()

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image too large. Maximum 5MB.",
        )

    b64_string = base64.b64encode(file_bytes).decode("utf-8")
    avatar_url = f"data:{file.content_type};base64,{b64_string}"

    ensure_avatar_column()
    db.execute(
        text(
            """
            UPDATE users
            SET avatar_url = :avatar_url
            WHERE id = :user_id
            """
        ),
        {
            "avatar_url": avatar_url,
            "user_id": current_user.id,
        },
    )
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture updated",
        "avatar_url": avatar_url,
    }


@router.put("/profile")
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.full_name:
        current_user.full_name = data.full_name

    if data.email:
        existing = (
            db.query(User)
            .filter(
                User.email == data.email.lower(),
                User.id != current_user.id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already in use by another account.",
            )

        current_user.email = data.email.lower()

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": serialize_user(
            current_user,
            get_avatar_url(db, current_user.id),
        ),
    }


@router.put("/password")
def update_password(
    data: PasswordUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    password_is_correct = verify_password(
        data.current_password,
        current_user.password,
    )

    if not password_is_correct:
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long.",
        )

    if data.new_password == data.current_password:
        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be different from your current password."
            ),
        )

    current_user.password = get_password_hash(data.new_password)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Password updated successfully",
    }


@router.delete("/me", status_code=200)
def delete_current_user_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        user_id = current_user.id

        # 1. Nullify tasks assigned to this user
        db.query(Task).filter(Task.assigned_to == user_id).update({Task.assigned_to: None}, synchronize_session=False)

        # 2. Nullify sprints created by this user
        db.query(Sprint).filter(Sprint.created_by == user_id).update({Sprint.created_by: None}, synchronize_session=False)

        # 3. Nullify milestones created by this user
        db.query(Milestone).filter(Milestone.created_by == user_id).update({Milestone.created_by: None}, synchronize_session=False)

        # 4. Nullify activities created by this user to keep audit trails intact but anonymized
        db.query(Activity).filter(Activity.user_id == user_id).update({Activity.user_id: None}, synchronize_session=False)

        # 5. Delete AI recommendation approvals by this user
        db.query(AIApprovalHistory).filter(AIApprovalHistory.reviewer_id == user_id).delete(synchronize_session=False)

        # 6. Delete AI execution logs requested/executed by this user
        db.query(AIExecutionLog).filter(
            (AIExecutionLog.requested_by == user_id) | (AIExecutionLog.executed_by == user_id)
        ).delete(synchronize_session=False)

        # 7. Delete AI recommendations created by or assigned to this user
        db.query(AIRecommendation).filter(
            (AIRecommendation.user_id == user_id) | (AIRecommendation.created_by == user_id)
        ).delete(synchronize_session=False)

        # 8. Delete AI agent memories matching this user
        db.query(AIAgentMemory).filter(AIAgentMemory.user_id == user_id).delete(synchronize_session=False)

        # 9. Delete AI snapshots matching this user
        db.query(AIContextSnapshot).filter(AIContextSnapshot.user_id == user_id).delete(synchronize_session=False)

        # 10. Delete AI decision histories matching this user
        db.query(AIDecisionHistory).filter(AIDecisionHistory.user_id == user_id).delete(synchronize_session=False)

        # 11. Delete AI summaries matching this user
        db.query(AISummary).filter(AISummary.user_id == user_id).delete(synchronize_session=False)

        # 12. Delete AI operational observations matching this user
        db.query(AIOperationalObservation).filter(AIOperationalObservation.user_id == user_id).delete(synchronize_session=False)

        # 13. Delete AI conversations matching this user (messages cascade delete)
        db.query(AIConversation).filter(AIConversation.user_id == user_id).delete(synchronize_session=False)

        # 14. Delete AI document chunks matching this user
        db.query(AIDocumentChunk).filter(AIDocumentChunk.user_id == user_id).delete(synchronize_session=False)

        # 15. Delete AI documents matching this user (chunks cascade delete)
        db.query(AIDocument).filter(AIDocument.user_id == user_id).delete(synchronize_session=False)

        # 16. Delete AI retrieval logs matching this user
        db.query(AIRetrievalLog).filter(AIRetrievalLog.user_id == user_id).delete(synchronize_session=False)

        # 17. Delete integrations oauth tokens & oauth states
        db.query(OAuthAccount).filter(OAuthAccount.user_id == user_id).delete(synchronize_session=False)
        db.query(OAuthState).filter(OAuthState.user_id == user_id).delete(synchronize_session=False)
        db.query(APIToken).filter(APIToken.owner_id == user_id).delete(synchronize_session=False)
        db.query(WebhookEndpoint).filter(WebhookEndpoint.created_by == user_id).delete(synchronize_session=False)
        db.query(Integration).filter(Integration.created_by == user_id).delete(synchronize_session=False)

        # 18. Delete automations owned by this user
        db.query(AutomationRule).filter(AutomationRule.owner_id == user_id).delete(synchronize_session=False)

        # 19. Delete invitations created by this user
        db.query(ProjectInvitation).filter(ProjectInvitation.invited_by == user_id).delete(synchronize_session=False)

        # 20. Delete analytics logs/snapshots matching this user
        db.query(AnalyticsSnapshot).filter(AnalyticsSnapshot.user_id == user_id).delete(synchronize_session=False)
        db.query(ProductivityMetric).filter(ProductivityMetric.user_id == user_id).delete(synchronize_session=False)
        db.query(WorkloadMetric).filter(WorkloadMetric.user_id == user_id).delete(synchronize_session=False)

        # 21. Delete the user (owned projects, project memberships, comments, notifications, attachments cascade delete-orphan automatically)
        db.delete(current_user)
        db.commit()

        return {
            "status": "success",
            "message": "Your account and all associated personal data have been deleted successfully."
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while deleting your account: {str(e)}"
        )
