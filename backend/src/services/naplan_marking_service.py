"""NAPLAN marking service: orchestrates Ollama + rubric to produce assessment results."""

import json
import re
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from src.models.base import AssessmentResult, Project, Submission
from src.services.naplan_rubric_loader import load_narrative_rubric, load_persuasive_rubric
from src.services.ollama_client import OllamaClient


SYSTEM_NARRATIVE = """You are an expert NAPLAN narrative writing assessor. Assess fairly and consistently using the rubric. Return only valid JSON with no extra commentary."""

SYSTEM_PERSUASIVE = """You are an expert NAPLAN persuasive writing assessor. Assess fairly and consistently using the rubric. Return only valid JSON with no extra commentary."""

NARRATIVE_MAX = 47
PERSUASIVE_MAX = 48


def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    text = text.strip()
    # Try raw parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    # Try to find first { ... }
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    raise ValueError("No valid JSON found in response")


def _build_rubric_section(rubric: dict) -> str:
    """Turn rubric dict into a single string for the prompt."""
    parts = []
    for key, content in rubric.items():
        name = key.replace("_", " ").title()
        parts.append(f"### {name}\n{content[:2000]}")
    return "\n\n".join(parts)


def _build_narrative_prompt(text: str, rubric: dict) -> str:
    rubric_section = _build_rubric_section(rubric)
    return f"""# NAPLAN Narrative Writing Assessment

Assess this Year 7 narrative using the criteria below. Return only one JSON object.

## Student text

```
{text[:12000]}
```

## Rubric

{rubric_section}

## Required JSON shape

Return exactly this structure (no other text):

{{
  "total_score": <number 0-47>,
  "overall_strengths": ["strength1", "strength2", ...],
  "overall_weaknesses": ["weakness1", "weakness2", ...],
  "criteria": {{
    "audience": {{ "score": 0, "max_score": 6, "feedback": "...", "evidence": ["quote1"], "recommendations": ["rec1"] }},
    "text_structure": {{ "score": 0, "max_score": 4, "feedback": "...", "evidence": [], "recommendations": [] }},
    "ideas": {{ "score": 0, "max_score": 5, "feedback": "...", "evidence": [], "recommendations": [] }},
    "character_setting": {{ "score": 0, "max_score": 4, "feedback": "...", "evidence": [], "recommendations": [] }},
    "vocabulary": {{ "score": 0, "max_score": 5, "feedback": "...", "evidence": [], "recommendations": [] }},
    "cohesion": {{ "score": 0, "max_score": 4, "feedback": "...", "evidence": [], "recommendations": [] }},
    "paragraphing": {{ "score": 0, "max_score": 2, "feedback": "...", "evidence": [], "recommendations": [] }},
    "sentence_structure": {{ "score": 0, "max_score": 6, "feedback": "...", "evidence": [], "recommendations": [] }},
    "punctuation": {{ "score": 0, "max_score": 5, "feedback": "...", "evidence": [], "recommendations": [] }},
    "spelling": {{ "score": 0, "max_score": 6, "feedback": "...", "evidence": [], "recommendations": [] }}
  }}
}}
"""


def _build_persuasive_prompt(text: str, rubric: dict) -> str:
    rubric_section = _build_rubric_section(rubric)
    return f"""# NAPLAN Persuasive Writing Assessment

Assess this Year 7 persuasive piece using the criteria below. Return only one JSON object.

## Student text

```
{text[:12000]}
```

## Rubric

{rubric_section}

## Required JSON shape

Return exactly this structure (no other text):

{{
  "total_score": <number 0-48>,
  "overall_strengths": ["strength1", "strength2", ...],
  "overall_weaknesses": ["weakness1", "weakness2", ...],
  "criteria": {{
    "audience": {{ "score": 0, "max_score": 6, "feedback": "...", "evidence": ["quote1"], "recommendations": ["rec1"] }},
    "text_structure": {{ "score": 0, "max_score": 4, "feedback": "...", "evidence": [], "recommendations": [] }},
    "ideas": {{ "score": 0, "max_score": 5, "feedback": "...", "evidence": [], "recommendations": [] }},
    "persuasive_devices": {{ "score": 0, "max_score": 4, "feedback": "...", "evidence": [], "recommendations": [] }},
    "vocabulary": {{ "score": 0, "max_score": 5, "feedback": "...", "evidence": [], "recommendations": [] }},
    "cohesion": {{ "score": 0, "max_score": 4, "feedback": "...", "evidence": [], "recommendations": [] }},
    "paragraphing": {{ "score": 0, "max_score": 3, "feedback": "...", "evidence": [], "recommendations": [] }},
    "sentence_structure": {{ "score": 0, "max_score": 6, "feedback": "...", "evidence": [], "recommendations": [] }},
    "punctuation": {{ "score": 0, "max_score": 5, "feedback": "...", "evidence": [], "recommendations": [] }},
    "spelling": {{ "score": 0, "max_score": 6, "feedback": "...", "evidence": [], "recommendations": [] }}
  }}
}}
"""


def _normalise_criteria(parsed: dict, genre: str) -> dict:
    """Ensure each criterion has score, max_score, feedback, evidence, recommendations."""
    criteria = parsed.get("criteria") or {}
    out = {}
    for key, val in criteria.items():
        if not isinstance(val, dict):
            continue
        out[key] = {
            "score": int(val.get("score", 0)),
            "max_score": int(val.get("max_score", 0)),
            "feedback": str(val.get("feedback", "")),
            "evidence": list(val.get("evidence", [])) if isinstance(val.get("evidence"), list) else [],
            "recommendations": list(val.get("recommendations", [])) if isinstance(val.get("recommendations"), list) else [],
        }
    return out


def _build_full_report_md(parsed: dict, genre: str, max_score: int) -> str:
    """Build a simple markdown report from parsed JSON."""
    total = parsed.get("total_score", 0)
    strengths = parsed.get("overall_strengths") or []
    weaknesses = parsed.get("overall_weaknesses") or []
    criteria = parsed.get("criteria") or {}
    lines = [
        f"# NAPLAN {genre} Assessment Report",
        "",
        f"**Total score:** {total}/{max_score}",
        "",
        "## Overall strengths",
        "",
    ]
    for s in strengths:
        lines.append(f"- {s}")
    lines.extend(["", "## Areas for development", ""])
    for w in weaknesses:
        lines.append(f"- {w}")
    lines.append("")
    for name, data in criteria.items():
        if not isinstance(data, dict):
            continue
        title = name.replace("_", " ").title()
        score = data.get("score", 0)
        max_s = data.get("max_score", 0)
        lines.append(f"## {title} ({score}/{max_s})")
        lines.append("")
        lines.append(data.get("feedback", ""))
        lines.append("")
    return "\n".join(lines)


class NAPLANMarkingService:
    """Orchestrates loading rubric, calling Ollama, parsing response, and saving result."""

    def __init__(self, db: Session, ollama_client: OllamaClient):
        self.db = db
        self.ollama = ollama_client

    def grade_submission(self, submission_id: UUID) -> AssessmentResult:
        submission = self.db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise ValueError("Submission not found")
        if submission.status != "SUBMITTED":
            raise ValueError("Submission must be SUBMITTED to grade")
        project = self.db.query(Project).filter(Project.id == submission.project_id).first()
        if not project:
            raise ValueError("Project not found")
        genre = (project.genre or "NARRATIVE").upper()
        if genre == "NARRATIVE":
            return self._grade_narrative(submission)
        return self._grade_persuasive(submission)

    def _grade_narrative(self, submission: Submission) -> AssessmentResult:
        rubric = load_narrative_rubric()
        prompt = _build_narrative_prompt(submission.content_raw or "", rubric)
        response = self.ollama.generate(prompt=prompt, system=SYSTEM_NARRATIVE)
        parsed = _extract_json(response)
        criteria = _normalise_criteria(parsed, "NARRATIVE")
        total = min(NARRATIVE_MAX, max(0, int(parsed.get("total_score", 0))))
        strengths = list(parsed.get("overall_strengths") or [])[:10]
        weaknesses = list(parsed.get("overall_weaknesses") or [])[:10]
        full_md = _build_full_report_md(
            {**parsed, "criteria": criteria}, "Narrative", NARRATIVE_MAX
        )
        result = AssessmentResult(
            submission_id=submission.id,
            genre="NARRATIVE",
            total_score=total,
            max_score=NARRATIVE_MAX,
            generated_at=datetime.now(timezone.utc),
            overall_strengths=strengths,
            overall_weaknesses=weaknesses,
            criteria_scores=criteria,
            full_report_md=full_md,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def _grade_persuasive(self, submission: Submission) -> AssessmentResult:
        rubric = load_persuasive_rubric()
        prompt = _build_persuasive_prompt(submission.content_raw or "", rubric)
        response = self.ollama.generate(prompt=prompt, system=SYSTEM_PERSUASIVE)
        parsed = _extract_json(response)
        criteria = _normalise_criteria(parsed, "PERSUASIVE")
        total = min(PERSUASIVE_MAX, max(0, int(parsed.get("total_score", 0))))
        strengths = list(parsed.get("overall_strengths") or [])[:10]
        weaknesses = list(parsed.get("overall_weaknesses") or [])[:10]
        full_md = _build_full_report_md(
            {**parsed, "criteria": criteria}, "Persuasive", PERSUASIVE_MAX
        )
        result = AssessmentResult(
            submission_id=submission.id,
            genre="PERSUASIVE",
            total_score=total,
            max_score=PERSUASIVE_MAX,
            generated_at=datetime.now(timezone.utc),
            overall_strengths=strengths,
            overall_weaknesses=weaknesses,
            criteria_scores=criteria,
            full_report_md=full_md,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result
