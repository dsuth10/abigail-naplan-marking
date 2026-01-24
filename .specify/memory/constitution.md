<!--
Sync Impact Report:
- Version change: [INITIAL] → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → Local-First Architecture
  - [PRINCIPLE_2_NAME] → Strict "No-Spellcheck" Environment
  - [PRINCIPLE_3_NAME] → Offline Reliability
  - [PRINCIPLE_4_NAME] → Visual Rostering & Privacy
  - [PRINCIPLE_5_NAME] → Data Integrity & Preservation
- Added sections: Core Principles, Governance
- Removed sections: N/A
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ updated: .cursor/commands/speckit.constitution.md
- Follow-up TODOs: None
-->

# Abigail Spelling Assessment Constitution

## Core Principles

### I. Local-First Architecture
The system MUST run entirely on local hardware (Teacher-Host or School-Server) without requiring internet access for core assessment functionality. All student data, rosters, and submissions MUST be stored locally in a SQLite database. No external API calls are permitted for handling student-identifiable information.

**Rationale**: Ensures reliability in diverse classroom environments and maintains strict data privacy by keeping information within the school's local network.

### II. Strict "No-Spellcheck" Environment
The student writing interface MUST explicitly disable all browser-level and OS-level assistive technologies, including spellcheck, autocorrect, and autocomplete. The editor attributes `spellcheck="false"`, `autocorrect="off"`, and `autocomplete="off"` are non-negotiable.

**Rationale**: Accurate assessment of spelling ability requires a "pure" writing environment free from external corrections.

### III. Offline Reliability
All application assets, including images (student avatars), fonts, and JavaScript libraries, MUST be bundled and served locally by the application server. The system MUST NOT rely on CDNs or external asset hosting.

**Rationale**: Guarantees the application remains fully functional even during local network outages or in environments with restricted internet access.

### IV. Visual Rostering & Privacy
Student login flows SHOULD prioritize ease of use through visual recognition (avatars). The system MUST NOT implement real-time keystroke monitoring; only student status (Not Started, Writing, Submitted) is tracked to balance teacher monitoring with student privacy.

**Rationale**: Reduces cognitive load for young students during login and prevents performance/privacy concerns associated with high-frequency data logging.

### V. Data Integrity & Preservation
Submissions MUST be stored as raw, unformatted text that preserves the student's original structure (tabs, newlines). This data MUST be exportable in a format compatible with NAPLAN-style automated marking systems.

**Rationale**: Ensures that the student's work is captured exactly as written for consistent and fair automated analysis.

## Development Workflow

### Technical Stack Constraints
- **Backend**: Python (FastAPI) for robust local serving and future AI integration.
- **Database**: SQLite (single-file) for zero-configuration and easy portability.
- **Frontend**: React (Vite) for a responsive, component-based UI.
- **Distribution**: Must be packageable as a portable executable or simple installer.

## Governance

### Amendment Procedure
Amendments to this Constitution require a version bump (MAJOR for removals/redefinitions, MINOR for additions/expansions, PATCH for clarifications). All dependent templates MUST be updated to reflect constitutional changes.

### Compliance Review
Every implementation plan and feature specification MUST include a "Constitution Check" to verify adherence to these core principles. Any deviations MUST be documented and justified.

**Version**: 1.0.0 | **Ratified**: 2026-01-24 | **Last Amended**: 2026-01-24
