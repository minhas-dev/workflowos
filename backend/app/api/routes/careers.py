from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
from pathlib import Path

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.job_application import JobApplication
from app.services.email_service import send_email, workflowos_email_template
from app.core.config import settings

router = APIRouter()

@router.post("/apply")
async def apply_job(
    job_title: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    linkedin_url: str = Form(None),
    portfolio_url: str = Form(None),
    cover_letter: str = Form(None),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate PDF only
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are allowed.")

    # Validate file size (10MB limit)
    contents = await resume.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume file size must be less than 10MB.")

    try:
        # Generate unique filename and save file
        unique_id = uuid.uuid4().hex
        safe_filename = f"{unique_id}_{resume.filename}"
        
        # Ensure uploads/careers/ directory exists
        upload_dir = settings.upload_root / "careers"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / safe_filename
        with open(file_path, "wb") as f:
            f.write(contents)

        # 1. Store in database
        application = JobApplication(
            job_title=job_title,
            name=name,
            email=email,
            phone=phone,
            linkedin_url=linkedin_url,
            portfolio_url=portfolio_url,
            resume_file=safe_filename,
            cover_letter=cover_letter
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        # 2. Send email to admin with resume attachment
        admin_email = settings.SMTP_EMAIL
        admin_subject = f"New Job Application: {job_title} - {name}"
        admin_html = workflowos_email_template(
            title="New Job Application Received",
            intro=f"A new application has been submitted for the {job_title} role.",
            details=[
                ("Applicant Name", name),
                ("Email", email),
                ("Phone", phone or "N/A"),
                ("LinkedIn", linkedin_url or "N/A"),
                ("Portfolio", portfolio_url or "N/A"),
            ],
            cta=f"Cover Letter:\n{cover_letter or 'No cover letter provided.'}"
        )
        
        attachments = [{
            "filename": resume.filename,
            "content": contents
        }]
        
        send_email(
            receiver_email=admin_email,
            subject=admin_subject,
            html_body=admin_html,
            text_body=f"New Application for {job_title}\n\nName: {name}\nEmail: {email}\nPhone: {phone}\nLinkedIn: {linkedin_url}\nPortfolio: {portfolio_url}\n\nCover Letter:\n{cover_letter}",
            attachments=attachments
        )

        # 3. Send confirmation email to applicant
        applicant_subject = "Application Received"
        applicant_html = workflowos_email_template(
            title="Application Received",
            intro=f"Hi {name}, thank you for your application to WorkflowOS.",
            details=[
                ("Position", job_title),
                ("Status", "Received")
            ],
            cta="Our team will review your application and portfolio shortly. We appreciate your interest in joining WorkflowOS!"
        )
        
        send_email(
            receiver_email=email,
            subject=applicant_subject,
            html_body=applicant_html,
            text_body=f"Hi {name},\n\nThank you for applying for the {job_title} position at WorkflowOS. We have received your application and will review it shortly.\n\nBest regards,\nWorkflowOS Recruitment"
        )

        return {"success": True, "message": "Application submitted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")


@router.get("/applications")
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    role: str | None = Header(None)
):
    admin_role = role or current_user.role
    if admin_role != "Admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    applications = db.query(JobApplication).order_by(JobApplication.created_at.desc()).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": app.id,
                "job_title": app.job_title,
                "name": app.name,
                "email": app.email,
                "phone": app.phone,
                "linkedin_url": app.linkedin_url,
                "portfolio_url": app.portfolio_url,
                "resume_file": app.resume_file,
                "cover_letter": app.cover_letter,
                "created_at": app.created_at
            }
            for app in applications
        ]
    }


@router.get("/applications/{app_id}/resume")
def download_resume(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    role: str | None = Header(None)
):
    admin_role = role or current_user.role
    if admin_role != "Admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    application = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not application or not application.resume_file:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_path = settings.upload_root / "careers" / application.resume_file
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Resume file does not exist on server")

    # Return standard filename (e.g. without uuid prefix)
    original_filename = application.resume_file
    if "_" in original_filename:
        original_filename = original_filename.split("_", 1)[1]

    return FileResponse(
        str(file_path),
        media_type="application/pdf",
        filename=original_filename
    )


@router.delete("/applications/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    role: str | None = Header(None)
):
    admin_role = role or current_user.role
    if admin_role != "Admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    application = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        # Delete file if exists
        if application.resume_file:
            file_path = settings.upload_root / "careers" / application.resume_file
            if file_path.exists():
                os.remove(file_path)

        db.delete(application)
        db.commit()
        return {"success": True, "message": "Application deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")
