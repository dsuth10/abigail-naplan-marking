# Deployment Checklist

**Project**: Abigail Spelling Assessment App  
**Version**: 1.0.0  
**Date**: 2026-01-24

## Pre-Deployment Verification

### Code Quality
- [x] All linter errors resolved (Ruff for backend, ESLint for frontend)
- [x] No console errors in browser DevTools
- [x] All TypeScript/JavaScript files use proper imports
- [x] Database migrations are up to date

### Functional Testing
- [ ] Student login works (avatar selection → password → projects)
- [ ] Spellcheck is disabled (test with misspelled words)
- [ ] Project creation and stimulus upload functional
- [ ] CSV roster upload works (test with 30 students)
- [ ] Live dashboard updates in real-time
- [ ] Submission unlock/lock workflow functional
- [ ] Export to ZIP produces valid text files
- [ ] All features work offline (disconnect internet)

### Performance Benchmarks
- [ ] Run `python backend/benchmark.py` and verify:
  - SC-001: Student login < 30 seconds ✓
  - SC-002: CSV upload < 20 seconds ✓

### Security & Privacy
- [ ] Passwords are hashed with bcrypt
- [ ] JWT tokens expire after 24 hours
- [ ] No sensitive data in logs
- [ ] WebSocket only transmits status updates
- [ ] CORS configured for local network only

### Documentation
- [x] README.md complete with setup instructions
- [x] COMPLIANCE.md verification completed
- [x] Quickstart.md updated with packaging steps
- [ ] User manual created (optional but recommended)

## Build Process

### 1. Frontend Build
```bash
cd frontend
npm run build
# Verify dist/ folder created
```

### 2. Backend Preparation
```bash
cd backend
pip install pyinstaller
# Verify all dependencies installed
```

### 3. Asset Consolidation
```bash
# From repo root
mkdir -p backend/static
cp -r frontend/dist/* backend/static/
# Verify avatars are included
ls backend/static/assets/avatars/
```

### 4. Create Executable
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

### 5. Distribution Package
```bash
mkdir -p distribution
cp backend/dist/AbigailAssessment.exe distribution/
cp -r backend/alembic distribution/
cp backend/alembic.ini distribution/
cp COMPLIANCE.md distribution/
cp README.md distribution/
cp specs/001-spelling-assessment-app/quickstart.md distribution/USER_GUIDE.md

# Create startup script
# (See quickstart.md for platform-specific scripts)
```

### 6. Test Distribution Package
- [ ] Copy distribution folder to clean machine
- [ ] Run executable
- [ ] Verify database initialization
- [ ] Test basic functionality
- [ ] Test on different Windows versions (10, 11)

## Deployment

### For School Environment

#### Teacher Machine Setup
1. Extract distribution package
2. Run `AbigailAssessment.exe`
3. Note the local IP address
4. Configure firewall to allow port 8000

#### Student Access Setup
1. Ensure students are on same network as teacher
2. Provide students with teacher's IP: `http://192.168.1.XXX:8000`
3. Test connection from one student device first

#### First Session Setup
1. Upload student roster via CSV
2. Create first assessment project
3. Test with 2-3 students
4. Monitor via live dashboard
5. Verify export functionality

### Post-Deployment

#### Day 1 Monitoring
- [ ] Check server logs for errors
- [ ] Verify all students can connect
- [ ] Monitor WebSocket stability
- [ ] Check database file size growth
- [ ] Test export after first submissions

#### Week 1 Review
- [ ] Gather teacher feedback
- [ ] Review performance metrics
- [ ] Check for any offline issues
- [ ] Verify spellcheck remains disabled
- [ ] Backup database file

## Rollback Procedure

If issues occur:
1. Stop the application
2. Backup current `local_assessment.db`
3. Revert to previous executable version
4. Restore database from backup if needed
5. Document the issue for fixing

## Support Contact

**Technical Issues**: [Contact information]  
**Documentation**: See `distribution/USER_GUIDE.md`  
**Bug Reports**: Include server logs and error screenshots

---

## Sign-Off

- [ ] Development Team: Verified code quality
- [ ] QA Team: Verified functionality
- [ ] IT Team: Verified network setup
- [ ] Teacher: Tested in classroom environment
- [ ] Deployment Date: _____________
- [ ] Deployment By: _____________
