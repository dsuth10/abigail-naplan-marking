# Feature Specification: Local Spelling Assessment App

**Feature Branch**: `001-spelling-assessment-app`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "Local Spelling Assessment App based on specifications.md"

## Clarifications

### Session 2026-01-24
- Q: What is the policy for a student modifying a submission after they have clicked "Submit"? → A: Option B (Submission is locked for the student, but the teacher can "return to draft" via dashboard).
- Q: How are student avatar images handled and populated in the system? → A: Option A (A fixed set of 20-30 avatar images is bundled with the app; CSV rostering maps to these IDs).
- Q: How does the system uniquely identify students during CSV upload? → A: Use Name, Year Level, ID Code, and Class Group.
- Q: How should available assessments (projects) be presented to students on the selection screen? → A: Option A (Large cards/icons showing the Genre (e.g., Narrative, Persuasive) and Title).
- Q: Which projects should a student see when they log in? → A: Option A (Students only see projects that the teacher has assigned to their specific "Class Group").

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Writing Interface (Priority: P1)

As a Student, I want to log in by selecting my avatar and write my response in a distraction-free, "no-spellcheck" environment so that my actual spelling ability is captured accurately.

**Why this priority**: This is the core value proposition of the app. Without a reliable writing interface that prevents automated corrections, the assessment is invalid.

**Independent Test**: Can be tested by logging in as a student, opening a project, and verifying that typing misspelled words does not trigger any red underlines or auto-corrections.

**Acceptance Scenarios**:

1. **Given** a student is on the login screen, **When** they select their avatar and enter their password, **Then** they are taken to the project selection screen.
2. **Given** a student has opened an assessment, **When** they type in the editor, **Then** no spellcheck or autocorrect indicators appear, and the split-screen view shows the stimulus material.

---

### User Story 2 - Teacher Assessment Management (Priority: P2)

As a Teacher, I want to create assessment projects with stimulus images and text so that I can provide students with clear, structured prompts for their writing tasks.

**Why this priority**: Teachers need to be able to set up the tasks that students will complete.

**Independent Test**: Can be tested by creating a project in the teacher dashboard, uploading an image, and then logging in as a student to see if that project and image appear correctly.

**Acceptance Scenarios**:

1. **Given** a teacher is in the project builder, **When** they upload an image and input stimulus text, **Then** a new project is created and made available to students.

---

### User Story 3 - CSV Student Rostering (Priority: P3)

As a Teacher, I want to upload a student roster via CSV so that I can quickly set up my class without manual entry of every student.

**Why this priority**: Essential for ease of adoption in schools with many students.

**Independent Test**: Can be tested by uploading a valid CSV file and verifying that the student list is populated with the correct names and year levels.

**Acceptance Scenarios**:

1. **Given** a teacher has a CSV file with student data, **When** they upload it through the rostering interface, **Then** the database is populated with the new student records.

---

### User Story 4 - Live Dashboard Monitoring (Priority: P4)

As a Teacher, I want to see a live dashboard of student progress so that I can monitor who is actively writing and who has submitted their work.

**Why this priority**: Helps with classroom management during an assessment session.

**Independent Test**: Can be tested by having multiple students open and submit assessments and verifying their status updates in real-time on the teacher dashboard.

**Acceptance Scenarios**:

1. **Given** students are logged in, **When** a student starts writing or submits, **Then** their status icon on the teacher dashboard updates immediately.

---

### Edge Cases

- **Offline Reconnect**: What happens if the local network drops momentarily? The system should handle local server reconnection gracefully.
- **Concurrent Logins**: How does the system handle a student trying to log in from two devices simultaneously?
- **Invalid CSV**: How does the system handle a malformed CSV upload during rostering?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a visual grid of student avatars for login, using a bundled set of 20-30 predefined avatar images.
- **FR-002**: System MUST disable browser and OS-level `spellcheck`, `autocorrect`, and `autocomplete` in the student editor.
- **FR-003**: System MUST support a split-screen interface (Stimulus/Editor) optimized for 1024px width and above.
- **FR-004**: System MUST store all students, projects, and submissions in a local SQLite database.
- **FR-005**: System MUST allow teachers to upload CSV files (Name, Year Level, ID Code, Class Group, Password) for rostering; ID Code serves as the unique identifier.
- **FR-006**: System MUST serve all images, fonts, and scripts from the local host without internet access.
- **FR-007**: System MUST update student status (Not Started, Writing, Submitted) in real-time on the teacher dashboard.
- **FR-008**: System MUST lock the editor for students upon submission; students can only resume writing if the teacher explicitly "returns the submission to draft" via the dashboard.
- **FR-009**: System MUST present available projects to students using a visual card-based interface showing the genre (with associated icon) and project title.
- **FR-010**: System MUST automatically filter the project selection screen to only show projects assigned to the logged-in student's Class Group.
- **FR-011**: System MUST export student submissions as raw text files preserving original formatting.

### Key Entities

- **Student**: Represents an individual test-taker. Key attributes: Name, Year Level, ID Code (Unique), Class Group, Avatar ID, Password Hash.
- **Project**: Represents a writing task. Key attributes: Title, Genre, Instructions, Stimulus HTML, Asset Paths (Local), Assigned Class Groups.
- **Submission**: Represents a completed task. Key attributes: Student ID, Project ID, Raw Content, Status, Timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can log in and start their first sentence in under 30 seconds.
- **SC-002**: Teachers can successfully roster a class of 30 students via CSV in under 20 seconds.
- **SC-003**: 100% of student submissions must be retrievable as raw text with original line breaks preserved.
- **SC-004**: Application MUST remain 100% functional (login, writing, monitoring) with the internet cable disconnected.

## Constitution Compliance

- [x] **Local-First**: Feature operates entirely offline.
- [x] **No-SpellCheck**: Editor has spellcheck/autocorrect/autocomplete disabled.
- [x] **Offline Assets**: All assets (images, fonts, scripts) are served locally.
- [x] **Privacy**: No real-time keystroke monitoring implemented.
- [x] **Data Integrity**: Raw text structure is preserved.
