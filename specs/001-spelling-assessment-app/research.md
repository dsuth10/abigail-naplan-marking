# Research: Local Spelling Assessment App

## Decisions & Rationale

### Decision 1: Disabling Assistive Writing Technologies
**Decision**: Use a combination of HTML attributes and CSS to disable spellcheck and autocorrect across all major browsers.
**Rationale**: `spellcheck="false"` is standard, but mobile browsers (iOS/Android) also respect `autocorrect="off"`, `autocapitalize="off"`, and `autocomplete="off"`. Additionally, `user-modify: read-write-plaintext-only` (CSS) can help prevent styling that might trigger OS-level interventions.
**Alternatives considered**: Custom content-editable div with keydown interception (rejected as too complex for MVP).

### Decision 2: Local Asset Management & Bundling
**Decision**: Bundle all assets (avatars, fonts) in the `frontend/public` directory and use Vite's standard build process.
**Rationale**: Vite inlines small assets and provides clear paths for larger ones. All assets will be served by the FastAPI backend using `StaticFiles` mounting during production.
**Alternatives considered**: Storing assets in the database as BLOBS (rejected due to performance and complexity).

### Decision 3: Local Database (SQLite) with Alembic
**Decision**: Use SQLAlchemy 2.0 with Alembic for migrations.
**Rationale**: Alembic allows for evolving the schema (e.g., adding NAPLAN marking fields later) without losing existing student data. SQLite's single-file nature makes backups simple (just copy the `.db` file).
**Alternatives considered**: Raw SQL (rejected for maintainability).

### Decision 4: Packaging for Distribution
**Decision**: Use `PyInstaller` to bundle the FastAPI app and the built React frontend into a single executable.
**Rationale**: Provides a "one-click" experience for teachers. The backend will serve the `index.html` of the React app as the default route.
**Alternatives considered**: Docker (rejected for Teacher-Host mode as it requires Docker Desktop installation), Electron (rejected as it adds significant overhead; a standard browser interface is sufficient).

### Decision 5: Real-time Monitoring (WebSockets)
**Decision**: Use FastAPI's native WebSocket support for the teacher dashboard.
**Rationale**: Provides low-latency status updates (Not Started -> Writing -> Submitted) without polling.
**Alternatives considered**: Long polling (rejected due to overhead and potential lag).

## Best Practices Found

- **CSV Ingestion**: Use Python's built-in `csv` module with `utf-8-sig` encoding to handle BOM from Excel-exported CSVs.
- **SQLite Performance**: Use `WAL` (Write-Ahead Logging) mode to improve performance with concurrent reads/writes.
- **FastAPI Security**: Even in a local-only app, use `OAuth2PasswordBearer` with JWT for the teacher dashboard to prevent unauthorized access within the school LAN.
