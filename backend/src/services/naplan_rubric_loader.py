"""Load NAPLAN marking criteria from .agent/skills reference files."""

from pathlib import Path
from typing import Dict

# Repo root: backend/src/services -> backend -> repo root
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
SKILLS_DIR = _REPO_ROOT / ".agent" / "skills"

NARRATIVE_CRITERIA = {
    "audience": "01-audience.md",
    "text_structure": "02-text-structure.md",
    "ideas": "03-ideas.md",
    "character_setting": "04-character-setting.md",
    "vocabulary": "05-vocabulary.md",
    "cohesion": "06-cohesion.md",
    "paragraphing": "07-paragraphing.md",
    "sentence_structure": "08-sentence-structure.md",
    "punctuation": "09-punctuation.md",
    "spelling": "10-spelling.md",
}

PERSUASIVE_CRITERIA = {
    "audience": "01-audience.md",
    "text_structure": "02-text-structure.md",
    "ideas": "03-ideas.md",
    "persuasive_devices": "04-persuasive-devices.md",
    "vocabulary": "05-vocabulary.md",
    "cohesion": "06-cohesion.md",
    "paragraphing": "07-paragraphing.md",
    "sentence_structure": "08-sentence-structure.md",
    "punctuation": "09-punctuation.md",
    "spelling": "10-spelling.md",
}


def load_narrative_rubric() -> Dict[str, str]:
    """Load all narrative marking criteria from reference files."""
    narrative_dir = SKILLS_DIR / "narrative-marking-naplan" / "references"
    rubric = {}
    for key, filename in NARRATIVE_CRITERIA.items():
        filepath = narrative_dir / filename
        if filepath.exists():
            rubric[key] = filepath.read_text(encoding="utf-8")
        else:
            rubric[key] = f"(Missing: {filename})"
    return rubric


def load_persuasive_rubric() -> Dict[str, str]:
    """Load all persuasive marking criteria from reference files."""
    persuasive_dir = SKILLS_DIR / "persuasive-marking-naplan" / "references"
    rubric = {}
    for key, filename in PERSUASIVE_CRITERIA.items():
        filepath = persuasive_dir / filename
        if filepath.exists():
            rubric[key] = filepath.read_text(encoding="utf-8")
        else:
            rubric[key] = f"(Missing: {filename})"
    return rubric
