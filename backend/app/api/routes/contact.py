from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.contact import ContactMessage
from app.services.email_service import send_email, workflowos_email_template
from app.core.config import settings

router = APIRouter()

class ContactSend(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    subject: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)

@router.post("/send")
def send_contact(
    payload: ContactSend,
    db: Session = Depends(get_db)
):
    if "@" not in payload.email or "." not in payload.email:
        raise HTTPException(status_code=400, detail="Invalid email address.")

    try:
        # 1. Store in database
        message_db = ContactMessage(
            name=payload.name,
            email=payload.email,
            subject=payload.subject,
            message=payload.message
        )
        db.add(message_db)
        db.commit()
        db.refresh(message_db)

        # 2. Send email notification to admin
        admin_email = settings.SMTP_EMAIL
        admin_subject = f"New Contact Form Submission: {payload.subject}"
        admin_html = workflowos_email_template(
            title="New Contact Form Message",
            intro=f"You have received a new contact form message from {payload.name}.",
            details=[
                ("Name", payload.name),
                ("Email", payload.email),
                ("Subject", payload.subject),
                ("Message", payload.message)
            ],
            cta="Review this message and follow up as necessary."
        )
        send_email(
            receiver_email=admin_email,
            subject=admin_subject,
            html_body=admin_html,
            text_body=f"Name: {payload.name}\nEmail: {payload.email}\nSubject: {payload.subject}\nMessage: {payload.message}"
        )

        # 3. Send confirmation email to sender
        sender_subject = "We received your message"
        sender_html = workflowos_email_template(
            title="Message Received",
            intro=f"Hi {payload.name}, thank you for contacting WorkflowOS.",
            details=[
                ("Subject", payload.subject),
                ("Status", "Received")
            ],
            cta="Our team has received your message and will get back to you within 24 hours. Thanks for building with us!"
        )
        send_email(
            receiver_email=payload.email,
            subject=sender_subject,
            html_body=sender_html,
            text_body=f"Hi {payload.name},\n\nWe have received your message regarding '{payload.subject}' and will get back to you within 24 hours.\n\nBest regards,\nWorkflowOS Team"
        )

        return {"success": True, "message": "Message sent successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
