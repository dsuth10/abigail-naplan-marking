# Local Spelling Assessment App - Specifications

## 1. Executive Summary
A local-first, web-based writing assessment tool designed for schools. Key features include a strict "no-spellcheck" writing environment, offline capability, rostering via CSV, and a teacher dashboard for monitoring and retrieval. The system is designed to facilitate consistent, fair spelling assessment and prepare data for automated NAPLAN-style marking.

## 2. User Stories

- **As a Teacher**, I want to upload a student roster via CSV so that I can quickly set up my class for an assessment.
- **As a Teacher**, I want to create assessment projects with stimulus images and text so that students have a clear prompt to write about.
- **As a Student**, I want to log in by selecting my avatar so that I don't have to remember a complex username.
- **As a Student**, I want a clean writing interface without spellcheck so that my spelling can be accurately assessed.
- **As an Administrator**, I want the app to run locally without internet so that it works reliably in any classroom environment.

## 3. Architecture & Tech Stack

### 2.1 Deployment Model
*   **Hybrid Host:**
    *   **Mode A (Teacher-Host):** Runs on a teacher's laptop. Serves the web app to students in the classroom via local IP/Port.
    *   **Mode B (School-Server):** Runs on a central school server. Accessible via school LAN.
*   **Network Requirement:** Local Network (LAN/WLAN) only. No internet required for core functionality.
*   **Distribution:** Packaged as a portable executable or simple installer (Docker optional for Server mode).

### 2.2 Technology Stack (Proposed)
*   **Backend:** Python (FastAPI)
    *   *Rationale:* Robust, easy to package, handles file I/O well, native integration with future AI/Marking scripts.
*   **Database:** SQLite
    *   *Rationale:* Zero-configuration, single-file (easy backup/transfer), perfect for "local" scope.
*   **Frontend:** React (Vite) + Tailwind CSS
    *   *Rationale:* Modern, responsive, component-based (reusable Avatars, Editors).
*   **Communication:** REST API + WebSocket (for "Live" status updates).

## 3. Core Features & User Flows

### 3.1 Teacher / Admin
*   **Rostering:**
    *   Upload CSV (Class List: Name, Year Level, Password).
    *   Manage Student Profiles (Edit Name, Reset Password).
*   **Assessment Management ("Projects"):**
    *   Create Project: Define Title, Guidelines.
    *   **Stimulus Builder:** Upload Images, input structured text (HTML).
*   **Monitoring:**
    *   Dashboard view: List of students in session.
    *   Status indicators: "Not Started", "Writing", "Submitted".
    *   *Constraint:* No real-time keystroke monitoring (privacy/performance), just status.
*   **Analysis:**
    *   View Submission content.
    *   Export raw text/data.
    *   Future: Trigger NAPLAN Marking Skills.

### 3.2 Student
*   **Login Flow:**
    1.  Open Web App URL.
    2.  Select Class.
    3.  Grid View of Student Avatars (Visual recognition).
    4.  Click Avatar -> Enter Password.
*   **Writing Interface:**
    *   **Split Screen:** Stimulus Material (Left/Top) | Writing Area (Right/Bottom).
    *   **Editor:**
        *   **CRITICAL:** `spellcheck="false"`, `autocorrect="off"`, `autocomplete="off"`.
        *   **Features:** Basic Text (Paragraphs, maybe Bold/Italic). No external helpers.
    *   **Tools:** Word Count, Timer (optional).
*   **Submission:**
    *   "Submit" Button.
    *   **Download:** Auto-generate plain text or simple HTML file for student to keep.
    *   Return to "Complete" state.

## 4. Data Models (Preliminary)

### `Student`
*   `id`: UUID
*   `name`: String
*   `year_level`: Integer
*   `avatar_ref`: String (Path/ID to local avatar image)
*   `password`: Hash

### `Class`
*   `id`: UUID
*   `name`: String
*   `teacher_id`: UUID

### `Project` (Assessment Task)
*   `id`: UUID
*   `title`: String
*   `genre`: Enum/String (NARRATIVE, PERSUASIVE, RECIPE, INFORMATION_REPORT, etc.)
*   `instructions`: Text
*   `stimulus_html`: HTML String (The structured content)
*   `assets`: List of File Paths (Images)

### `Submission`
*   `id`: UUID
*   `student_id`: FK
*   `project_id`: FK
*   `content_raw`: Text (Preserves tabs, newlines, basic structure)
*   `status`: Enum (DRAFT, SUBMITTED)
*   `submitted_at`: Timestamp (Critical for tracking progress over time)

### `AssessmentResult` (Future)
*   `id`: UUID
*   `submission_id`: FK
*   `total_score`: Integer
*   `generated_at`: Timestamp
*   `feedback_raw`: Text
*   `criteria_scores`: JSON. Structure depends on `Project.genre`.
    *   **Common Criteria (Both):**
        *   `audience` (0-6)
        *   `text_structure` (0-4)
        *   `ideas` (0-5)
        *   `vocabulary` (0-5)
        *   `cohesion` (0-4)
        *   `paragraphing` (0-2/3)
        *   `sentence_structure` (0-6)
        *   `punctuation` (0-5)
        *   `spelling` (0-6)
    *   **Narrative Specific:**
        *   `character_and_setting` (0-4)
    *   **Persuasive Specific:**
        *   `persuasive_devices` (0-4)
    *   *Note: Other genres will have their own schema defined later.*


## 6. Technical Constraints & Constitution Compliance

This project must strictly adhere to the [constitution.md](file:///c:/Users/dsuth/Documents/Code%20Projects/NAPLAN%20marking/Test%20Environment/.specify/rules/constitution.md):
- **Local-First**: No external API calls for student data.
- **No-SpellCheck**: The frontend MUST disable all browser-level and OS-level spellcheck/autocorrect features in the editor.
- **Offline Reliability**: All assets (images, fonts, scripts) must be served locally.

## 7. Future Integration (Marking)
*   The system will export `Submission.content_raw` to the `narrative-marking-naplan` and `persuasive-marking-naplan` skills.
*   Results will be stored in a new `AssessmentResult` table linked to the Submission.
