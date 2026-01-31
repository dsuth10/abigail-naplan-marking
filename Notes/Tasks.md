Suggested Improvements
1. Teacher Authentication (Critical Security Fix)
Currently, all teacher endpoints (/api/projects, /api/submissions, /api/roster) are accessible without authentication. On a shared local network, any student who knows the teacher's IP can technically access the dashboard.
Fix: Implement a simple Teacher login or a shared ADMIN_PASSWORD environment variable.
Benefit: Ensures assessment integrity and prevents unauthorized access to student data.
2. AI-Powered NAPLAN Marking (Major Feature)
The project aims to be a "NAPLAN marking" tool. I can integrate the specialized NAPLAN Narrative/Persuasive Marking Skills already available in the .agent/skills directory.
Enhancement: Add a "Grade with AI" button in the Teacher Dashboard.
Benefit: Provides instant, criteria-based feedback (Audience, Ideas, Spelling, etc.) and scores, saving teachers hours of manual work.
3. Professional PDF & Report Export (Feature)
While the app exports raw text, teachers often need polished reports for portfolios or parents.
Enhancement: Use a PDF generation library (supported by the pdf skill) to create beautiful student assessment reports including the stimulus material and AI feedback.
Benefit: Professionalizes the output and provides a tangible record of student achievement.
4. Advanced Student Writing Tools (UX Enhancement)
Students benefit from visual feedback while writing.
Enhancement: Add a Word Count Goal progress bar and an optional Assessment Timer in the student editor.
Benefit: Helps students manage their time and meet length requirements typical of NAPLAN tasks.
5. Technical Robustness (Bug Fixes/Maintenance)
Upload Validation: Restrict upload-asset to specific image/PDF MIME types to prevent malicious file uploads.
WebSocket Heartbeat: Add a "ping/pong" mechanism to the ws.py manager to prevent the teacher dashboard from losing sync during long writing sessions.
Global Error Handling: Implement a centralized FastAPI exception handler for consistent error reporting across the fronten


admin / abigail2026