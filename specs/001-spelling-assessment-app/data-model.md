# Data Model: Local Spelling Assessment App

## Entities

### Student
Represents a student in the system.
- `id`: UUID (PK)
- `name`: String (Required)
- `year_level`: Integer (Required)
- `id_code`: String (Unique, Required) - Used for CSV matching
- `class_group`: String (Required) - Used for filtering projects
- `avatar_id`: String (Required) - References a bundled image name
- `password_hash`: String (Required)
- `created_at`: DateTime

### Project
Represents a writing assessment task.
- `id`: UUID (PK)
- `title`: String (Required)
- `genre`: Enum (NARRATIVE, PERSUASIVE)
- `instructions`: Text (Markdown support)
- `stimulus_html`: Text (The structured content to display)
- `asset_paths`: JSON/List (Local paths to stimulus images)
- `assigned_class_groups`: JSON/List (Classes that can see this project)
- `is_active`: Boolean (Default: True)
- `created_at`: DateTime

### Submission
Represents a student's response to a project.
- `id`: UUID (PK)
- `student_id`: UUID (FK -> Student.id)
- `project_id`: UUID (FK -> Project.id)
- `content_raw`: Text (Preserves all whitespace/newlines)
- `status`: Enum (DRAFT, SUBMITTED)
- `submitted_at`: DateTime (Nullable)
- `last_updated_at`: DateTime

## Relationships
- A **Student** belongs to a **Class Group**.
- A **Project** is assigned to one or more **Class Groups**.
- A **Student** can have multiple **Submissions** (one per project).
- A **Project** has multiple **Submissions** (one per student).

## State Transitions (Submission)
1. `DRAFT`: Initial state when a student opens a project and starts writing.
2. `SUBMITTED`: Final state after student clicks "Submit". Locked for editing.
3. `DRAFT` (Re-entry): Only possible if Teacher explicitly triggers "Return to Draft" for a specific submission.
