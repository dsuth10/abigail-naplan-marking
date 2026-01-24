# Abigail Spelling Assessment App

A local, offline-first application for conducting spelling and writing assessments in school environments. Designed to provide a controlled, distraction-free writing environment with strict spellcheck disabling to ensure assessment integrity.

## 🎯 Key Features

- **Student Writing Interface**: Avatar-based login with split-screen editor (stimulus | writing area)
- **Strict Spellcheck Disabling**: Multi-layer enforcement to prevent browser/OS autocorrect
- **Teacher Dashboard**: Real-time monitoring of student progress with live status updates
- **CSV Rostering**: Bulk student import for rapid classroom setup
- **Offline-First**: 100% functional without internet access
- **Local Network**: Runs on teacher's machine, students connect via local IP
- **Data Export**: Export submissions as raw text files preserving original formatting

## 🏛️ Constitutional Principles

This application strictly adheres to:

- ✅ **Local-First**: No external API calls or internet requirements
- ✅ **No-Spellcheck**: Browser/OS spellcheck completely disabled
- ✅ **Offline Assets**: All images, fonts, scripts served locally
- ✅ **Privacy**: No keystroke monitoring; only status updates transmitted
- ✅ **Data Integrity**: Raw text preserved with original formatting

See [COMPLIANCE.md](COMPLIANCE.md) for detailed verification.

## 📋 Requirements

- **Teacher Machine**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB for application + 100MB per 1000 student submissions
- **Network**: Local network for student access (WiFi or Ethernet)
- **Browser**: Modern browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)

## 🚀 Quick Start

### For Teachers (First Time Setup)

1. **Download** the latest release from the distribution package
2. **Run** `AbigailAssessment.exe` (Windows) or `./AbigailAssessment` (Linux/macOS)
3. **Access** the application at `http://localhost:8000`
4. **Upload** your student roster via CSV (Name, Year Level, ID Code, Class Group, Password, Avatar ID)
5. **Create** your first assessment project with stimulus material
6. **Share** your local IP address with students (e.g., `http://192.168.1.100:8000`)

### For Students

1. **Connect** to the teacher's IP address provided (e.g., `http://192.168.1.100:8000`)
2. **Select** your avatar from the login grid
3. **Enter** your password
4. **Choose** the assigned assessment project
5. **Write** your response in the distraction-free editor

## 📚 Documentation

- **[Quickstart Guide](specs/001-spelling-assessment-app/quickstart.md)**: Development setup and packaging
- **[Specification](specs/001-spelling-assessment-app/spec.md)**: Feature requirements and acceptance criteria
- **[Implementation Plan](specs/001-spelling-assessment-app/plan.md)**: Technical architecture
- **[Compliance Verification](COMPLIANCE.md)**: Constitutional adherence checklist

## 🛠️ Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm or pnpm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## 📦 Building for Production

See [Quickstart Guide - Packaging](specs/001-spelling-assessment-app/quickstart.md#packaging-for-distribution) for detailed instructions.

**Quick Build**:
```bash
# Build frontend
cd frontend && npm run build

# Copy to backend
cp -r frontend/dist/* backend/static/

# Create executable
cd backend
pyinstaller --onefile \
  --add-data "static;static" \
  --add-data "alembic;alembic" \
  --hidden-import uvicorn.protocols.http.auto \
  --name "AbigailAssessment" \
  src/main.py
```

## 🧪 Testing

### Run Performance Benchmarks

```bash
cd backend
python benchmark.py
```

This verifies:
- **SC-001**: Student login to first sentence < 30 seconds
- **SC-002**: CSV upload for 30 students < 20 seconds

### Manual Testing Checklist

- [ ] Start application without internet connection
- [ ] Upload CSV with 30 students
- [ ] Students appear in avatar grid login
- [ ] Create assessment project with stimulus image
- [ ] Student logs in and opens project
- [ ] Verify spellcheck is disabled (type misspelled words)
- [ ] Student writes and submits
- [ ] Teacher dashboard shows live status update
- [ ] Export submissions as ZIP
- [ ] Unlock a submission (return to draft)

## 🗂️ Project Structure

```
abigail/
├── backend/                # FastAPI server
│   ├── src/
│   │   ├── api/           # API routes
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── main.py        # Entry point
│   ├── alembic/           # Database migrations
│   ├── benchmark.py       # Performance tests
│   └── requirements.txt
├── frontend/              # React (Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Student/Teacher views
│   │   ├── services/      # API clients
│   │   └── assets/        # Avatars, images
│   └── package.json
├── specs/                 # Documentation
│   └── 001-spelling-assessment-app/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── quickstart.md
├── COMPLIANCE.md          # Constitutional verification
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `backend/`:

```env
DATABASE_URL=sqlite:///./local_assessment.db
SECRET_KEY=your-secret-key-for-jwt
VITE_API_URL=/api
VITE_WS_URL=ws://localhost:8000/api/ws
```

### Local Network Access

**Find your IP address**:
- Windows: `ipconfig`
- Linux/macOS: `ifconfig` or `ip addr`

**Start server for network access**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

**Firewall Configuration**:
- Windows: Allow port 8000 in Windows Defender
- macOS: System Preferences → Firewall → Allow incoming connections
- Linux: `sudo ufw allow 8000`

## 🐛 Troubleshooting

### Students can't connect
- Verify teacher's IP address is correct
- Check firewall allows port 8000
- Ensure all devices on same network

### Spellcheck still appears
- Try incognito/private browsing mode
- Update browser to latest version
- Check browser settings for spellcheck override

### Database errors
- Delete `local_assessment.db` and restart
- Run `alembic upgrade head` manually

### WebSocket connection fails
- Check browser console for errors
- Verify server is running on correct host/port
- Try refreshing the dashboard page

## 📊 Performance Metrics

- **API Latency**: < 200ms for all endpoints
- **Student Login**: < 30 seconds from avatar selection to first character typed
- **CSV Upload**: < 20 seconds for 30 students
- **Concurrent Users**: Supports 100+ local network connections
- **Database Size**: ~10KB per student, ~50KB per submission

## 🤝 Contributing

This is a school-specific assessment tool. For feature requests or bug reports, contact the development team.

## 📄 License

Copyright © 2026. All rights reserved.

## 👥 Support

For technical support or questions:
- Email: [support contact]
- Documentation: See `specs/` directory
- Compliance: See `COMPLIANCE.md`

---

**Built with**:  
FastAPI | React | SQLite | Vite | Tailwind CSS | Lucide React
