# Quickstart: Local Spelling Assessment App

## Development Environment Setup

### 1. Backend (FastAPI)
- **Language**: Python 3.12+
- **Steps**:
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  alembic upgrade head
  uvicorn src.main:app --reload
  ```

### 2. Frontend (React)
- **Language**: Node.js 20+ (npm or pnpm)
- **Steps**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

## Local Configuration
- The app expects a `config.json` or `.env` file in the backend root.
- `DATABASE_URL=sqlite:///./local_assessment.db`
- `OFFLINE_ASSETS_DIR=./assets`

## Running Tests
- **Backend**: `pytest`
- **Frontend**: `npm test`
- **E2E**: `npx playwright test`

## Packaging for Distribution

### Production Build Process

#### Step 1: Build Frontend
```bash
cd frontend
npm run build
# This creates an optimized build in frontend/dist/
```

#### Step 2: Copy Frontend Build to Backend
```bash
# From repository root
mkdir -p backend/static
cp -r frontend/dist/* backend/static/
```

#### Step 3: Prepare Backend Dependencies
```bash
cd backend
pip install pyinstaller
pip install -r requirements.txt
```

#### Step 4: Create Standalone Executable (Windows)
```bash
cd backend
pyinstaller --onefile \
  --add-data "static;static" \
  --add-data "alembic;alembic" \
  --add-data "alembic.ini;." \
  --hidden-import uvicorn.protocols.http.auto \
  --hidden-import uvicorn.protocols.websockets.auto \
  --hidden-import sqlalchemy.ext.baked \
  --name "AbigailAssessment" \
  src/main.py
```

#### Step 4 (Alternative): Create Standalone Executable (Linux/macOS)
```bash
cd backend
pyinstaller --onefile \
  --add-data "static:static" \
  --add-data "alembic:alembic" \
  --add-data "alembic.ini:." \
  --hidden-import uvicorn.protocols.http.auto \
  --hidden-import uvicorn.protocols.websockets.auto \
  --hidden-import sqlalchemy.ext.baked \
  --name "AbigailAssessment" \
  src/main.py
```

#### Step 5: Package Distribution
```bash
# The executable will be in backend/dist/AbigailAssessment.exe (or AbigailAssessment on Unix)
# Create a distribution folder
mkdir -p distribution
cp backend/dist/AbigailAssessment* distribution/
cp -r backend/alembic distribution/
cp backend/alembic.ini distribution/
cp COMPLIANCE.md distribution/
cp README.md distribution/

# Create a startup script
cat > distribution/start.bat << 'EOF'
@echo off
echo Starting Abigail Spelling Assessment Server...
start AbigailAssessment.exe
timeout /t 3
start http://localhost:8000
EOF

# For Linux/macOS
cat > distribution/start.sh << 'EOF'
#!/bin/bash
echo "Starting Abigail Spelling Assessment Server..."
./AbigailAssessment &
sleep 3
open http://localhost:8000 || xdg-open http://localhost:8000
EOF
chmod +x distribution/start.sh
```

### Local Network Setup

#### Finding Your Local IP Address

**Windows**:
```cmd
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Linux/macOS**:
```bash
ifconfig
# Look for "inet" under your active network interface (e.g., en0, eth0)
```

#### Allowing Students to Connect

1. **Start the server on the teacher's machine**:
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 8000
   ```

2. **Students access via teacher's IP**:
   - If teacher's IP is `192.168.1.100`, students navigate to:
   - `http://192.168.1.100:8000`

3. **Firewall Configuration**:
   - **Windows**: Allow port 8000 in Windows Defender Firewall
   - **macOS**: System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections for "AbigailAssessment"
   - **Linux**: `sudo ufw allow 8000`

### Database Initialization

On first run, the application will automatically:
1. Create `local_assessment.db` in the current directory
2. Apply all database migrations via Alembic
3. Set up the required tables (Students, Projects, Submissions)

### Production Checklist

Before deploying to a school environment:

- [ ] Frontend build is optimized (`npm run build`)
- [ ] All avatars are present in `frontend/src/assets/avatars/`
- [ ] Backend executable includes static files and migrations
- [ ] Test offline functionality (disconnect internet)
- [ ] Verify "no-spellcheck" enforcement in multiple browsers
- [ ] Test CSV upload with sample student roster
- [ ] Verify WebSocket dashboard updates
- [ ] Test export functionality (ZIP download)
- [ ] Document teacher's local IP address for student access
- [ ] Configure firewall to allow port 8000
- [ ] Provide startup script for easy launch

### Troubleshooting

**Issue**: Students cannot connect to teacher's machine  
**Solution**: Verify firewall allows port 8000, confirm teacher's IP address, ensure all devices on same network

**Issue**: Application won't start  
**Solution**: Check that port 8000 is not in use by another application

**Issue**: Database errors on first run  
**Solution**: Delete `local_assessment.db` and restart to reinitialize

**Issue**: Spellcheck still appears in editor  
**Solution**: Verify browser is up-to-date, try incognito/private mode, check browser settings
