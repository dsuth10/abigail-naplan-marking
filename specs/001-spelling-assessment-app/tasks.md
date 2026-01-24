---

description: "Actionable implementation tasks for Local Spelling Assessment App"
---

# Tasks: Local Spelling Assessment App

**Input**: Design documents from `specs/001-spelling-assessment-app/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment setup

- [x] T001 Create project structure (backend/ and frontend/) per implementation plan
- [x] T002 Initialize Python 3.12 project with FastAPI and SQLAlchemy dependencies in `backend/`
- [x] T003 [P] Initialize React project with Vite, Tailwind CSS, and Lucide React in `frontend/`
- [x] T004 [P] Configure Ruff for backend and ESLint/Prettier for frontend linting

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user story implementation

**⚠️ CRITICAL**: All user story work depends on this phase

- [x] T005 Setup SQLite database with SQLAlchemy 2.0 and Alembic migrations in `backend/src/models/`
- [x] T006 [P] Implement base models (Student, Project, Submission) in `backend/src/models/` per `data-model.md`
- [x] T007 [P] Implement JWT authentication for Teachers and Avatar-based session for Students in `backend/src/services/auth.py`
- [x] T008 [P] Configure FastAPI API routing and CORS (allowing local network access) in `backend/src/main.py`
- [x] T009 Implement WebSocket infrastructure for live dashboard updates in `backend/src/api/ws.py`
- [x] T010 [P] Add 20-30 bundled avatar assets to `frontend/src/assets/avatars/` per `research.md`

**Checkpoint**: Foundation ready - UI and API implementation can now begin in parallel

---

## Phase 3: User Story 1 - Student Writing Interface (Priority: P1) 🎯 MVP

**Goal**: Secure avatar-based login and distraction-free split-screen editor

**Independent Test**: Log in as a student, open a project, and verify that the editor disables all browser spellcheck and displays stimulus images.

- [x] T011 [P] [US1] Create Avatar Grid login component in `frontend/src/components/Login/`
- [x] T012 [P] [US1] Implement Split-screen Layout (Stimulus | Editor) in `frontend/src/components/Editor/`
- [x] T013 [US1] Apply strict "no-spellcheck" HTML attributes and CSS to Editor component in `frontend/src/components/Editor/Editor.jsx`
- [x] T014 [US1] Implement Student API endpoints (login, get projects, get details) in `backend/src/api/student.py`
- [x] T015 [US1] Implement Submission Service for draft persistence in `backend/src/services/submission.py`
- [x] T016 [US1] Integrate Editor with Submission API for real-time draft saving

**Checkpoint**: User Story 1 (MVP) functional and testable independently

---

## Phase 4: User Story 2 - Teacher Assessment Management (Priority: P2)

**Goal**: Create assessments with stimulus material and assign to class groups

**Independent Test**: Create a project in the teacher UI and verify it appears on the student selection screen for the assigned class.

- [x] T017 [P] [US2] Create Project Builder UI with Stimulus HTML input and local asset upload in `frontend/src/pages/Teacher/ProjectBuilder.jsx`
- [x] T018 [US2] Implement Project API endpoints (list, create, toggle status) in `backend/src/api/projects.py`
- [x] T019 [US2] Implement Project Service for class group filtering logic in `backend/src/services/project_service.py`
- [x] T020 [P] [US2] Add Genre selection (Narrative/Persuasive) and icon mapping in `frontend/src/components/ProjectCard/`

---

## Phase 5: User Story 3 - CSV Student Rostering (Priority: P3)

**Goal**: Bulk import students via CSV upload

**Independent Test**: Upload a CSV with 30 students and verify they all appear in the Student login grid.

- [x] T021 [P] [US3] Create CSV Upload component in `frontend/src/pages/Teacher/Rostering.jsx`
- [x] T022 [US3] Implement Roster API endpoint for CSV processing in `backend/src/api/roster.py`
- [x] T023 [US3] Implement Roster Service for `utf-8-sig` CSV parsing and ID Code uniqueness validation in `backend/src/services/roster_service.py`

---

## Phase 6: User Story 4 - Live Dashboard Monitoring (Priority: P4)

**Goal**: Real-time student progress tracking and raw text export

**Independent Test**: Monitor a live session, "unlock" a student submission, and export raw text for marking.

- [x] T024 [P] [US4] Create Teacher Dashboard with live student status grid in `frontend/src/pages/Teacher/Dashboard.jsx`
- [x] T025 [US4] Integrate WebSocket client for real-time status updates in `frontend/src/services/websocket.js`
- [x] T026 [US4] Implement "Return to Draft" (Unlock) endpoint and logic in `backend/src/api/submissions.py`
- [x] T027 [US4] Implement Raw Text Export service (preserving tabs/newlines) in `backend/src/services/export_service.py`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and packaging

- [x] T028 [P] Verify constitutional compliance (Local-First, No-Spellcheck, Offline Assets)
- [x] T029 [P] Update `quickstart.md` with final production packaging steps (PyInstaller)
- [x] T030 Configure SQLite WAL mode for better local performance in `backend/src/database.py`
- [x] T031 Benchmark and verify performance metrics (SC-001 student start time, SC-002 CSV import speed)
- [x] T032 Final code cleanup, documentation of local network setup (IP discovery), and README update

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories.
- **User Stories (Phases 3-6)**: All depend on Phase 2 completion.
  - US1 (P1) should be prioritized as the MVP.
  - US2, US3, and US4 can proceed in parallel once US1 is stable.
- **Polish (Phase N)**: Depends on completion of all stories.

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for all student-facing UI.
- **User Story 2 (P2)**: Needed to provide content for US1 testing.
- **User Story 3 (P3)**: Needed for bulk testing of US1 and US4.
- **User Story 4 (P4)**: Depends on US1 (Submissions) and US3 (Student list).

---

## Parallel Opportunities

- T003, T004 (Frontend setup) can run alongside T002 (Backend setup).
- T006, T007, T008 (Base models, Auth, Routing) can run in parallel within Phase 2.
- T011 (Login UI) and T014 (Student API) can run in parallel within Phase 3.
- T017 (Teacher UI) and T018 (Project API) can run in parallel within Phase 4.
- T021 (Upload UI) and T022 (Roster API) can run in parallel within Phase 5.
- T028, T029 (Verification/Docs) can run in parallel within Phase N.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Critical infrastructure)
3. Complete Phase 3: User Story 1 (The core assessment environment)
4. **VALIDATE**: Ensure offline reliability and "no-spellcheck" enforcement.

### Incremental Delivery

1. Add US2 (Project Management) to enable teachers to set their own prompts.
2. Add US3 (CSV Rostering) to scale to full classrooms.
3. Add US4 (Dashboard) for real-time management and data extraction.
