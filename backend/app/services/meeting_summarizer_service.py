from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


def generate_fallback_meeting_analysis(transcript: str, current_user: User) -> dict:
    """Fallback pattern matching heuristic for offline / keyless environments."""
    lower_text = transcript.lower()
    suggested_tasks = []

    # Heuristic matching for assignee name, priority, and timeline hints
    # Example input: "We need redesign login page before Friday. Ahmed will handle backend auth. Sarah will redesign UI. Need testing before deployment."
    
    # 1. Check for Ahmed / backend auth
    if "ahmed" in lower_text or "backend auth" in lower_text:
        suggested_tasks.append({
            "title": "Improve backend authentication",
            "priority": "high",
            "assignee_name": "Ahmed",
            "due_in_days": 4,
            "reason": "Suggested because Ahmed was assigned backend auth."
        })

    # 2. Check for Sarah / redesign UI
    if "sarah" in lower_text or "redesign ui" in lower_text or "redesign login" in lower_text:
        suggested_tasks.append({
            "title": "Redesign login UI",
            "priority": "high",
            "assignee_name": "Sarah",
            "due_in_days": 4,
            "reason": "Suggested because Sarah was assigned UI redesign."
        })

    # 3. Check for testing
    if "testing" in lower_text or "qa" in lower_text:
        suggested_tasks.append({
            "title": "Perform QA testing",
            "priority": "medium",
            "assignee_name": None,
            "due_in_days": 4,
            "reason": "Suggested because testing is required before release."
        })

    # General fallback if no heuristics matched: extract lines that look like tasks
    if not suggested_tasks:
        lines = [line.strip() for line in transcript.split("\n") if line.strip()]
        for line in lines[:4]:
            suggested_tasks.append({
                "title": line[:60],
                "priority": "medium",
                "assignee_name": None,
                "due_in_days": 7,
                "reason": "Suggested task based on meeting transcript."
            })

    # Generate key decisions & action items heuristics
    key_decisions = []
    if "login" in lower_text:
        key_decisions.append("Login redesign prioritized for Friday release")
    if "ahmed" in lower_text:
        key_decisions.append("Backend authentication assigned to Ahmed")
    if "sarah" in lower_text:
        key_decisions.append("UI redesign assigned to Sarah")
    if "testing" in lower_text:
        key_decisions.append("QA testing is mandatory before deployment")

    if not key_decisions:
        key_decisions = ["Review project timeline and milestone dependencies", "Coordinate sprint allocations for high-priority items"]

    action_items = []
    for t in suggested_tasks:
        action_items.append(f"Implement: {t['title']}")

    return {
        "summary": "The team discussed launch readiness, login redesign goals, and quality gates.",
        "key_decisions": key_decisions,
        "action_items": action_items,
        "suggested_tasks": suggested_tasks
    }


def analyze_meeting_notes(db: Session, transcript: str, current_user: User) -> dict:
    """Analyze a meeting transcript using Claude to extract structured data."""
    if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "sk-placeholder":
        logger.info("Using fallback engine for meeting notes analysis (keyless).")
        return generate_fallback_meeting_analysis(transcript, current_user)

    import anthropic

    system_prompt = """You are a senior Staff AI Project Manager. Your job is to analyze meeting transcripts or meeting notes, and extract a structured execution plan.
You must output a single, valid JSON object containing:
1. "summary": A brief 1-2 sentence description of the meeting focus.
2. "key_decisions": A list of key decisions made.
3. "action_items": A list of action items.
4. "suggested_tasks": A list of suggested tasks, where each task has:
   - "title": Clear task title.
   - "priority": "high", "medium", or "low".
   - "assignee_name": Name of the person responsible (or null if not specified).
   - "due_in_days": Number of days from today when this task is due (or null if not specified). Suggest based on date hints like "before Friday" or "by next Tuesday".
   - "reason": A brief explanation of why this task is suggested and who is assigned (e.g., "Suggested because Sarah was assigned UI redesign.").

Format your response exactly as JSON wrapped inside <json>...</json> tags. For example:
<json>
{
  "summary": "...",
  "key_decisions": [...],
  "action_items": [...],
  "suggested_tasks": [...]
}
</json>
Output ONLY the <json>...</json> block. Do not include any conversational text or explanation outside the tags."""

    try:
        client = anthropic.Anthropic(
            api_key=settings.ANTHROPIC_API_KEY,
            base_url=settings.ANTHROPIC_BASE_URL,
        )

        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            temperature=0.1,
            max_tokens=2000,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"Analyze this transcript:\n\n{transcript}"
                }
            ],
        )

        content = response.content[0].text.strip()
        match = re.search(r"<json>(.*?)</json>", content, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            return json.loads(json_str)

        # Fallback if no tags but response is raw json
        return json.loads(content)
    except Exception as e:
        logger.exception("Failed to analyze meeting notes using Claude: %s", str(e))
        return generate_fallback_meeting_analysis(transcript, current_user)
