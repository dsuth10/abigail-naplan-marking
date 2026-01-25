import sqlite3
import os

db_path = "c:/Users/dsuth/Documents/Code Projects/NAPLAN marking/abigail/backend/local_assessment.db"

if not os.path.exists(db_path):
    # Try relative path just in case
    db_path = "backend/local_assessment.db"

print(f"Checking database at: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current columns
    cursor.execute("PRAGMA table_info(submissions)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns in 'submissions': {columns}")
    
    # Add content_html if missing
    if "content_html" not in columns:
        print("Adding 'content_html' column...")
        cursor.execute("ALTER TABLE submissions ADD COLUMN content_html TEXT DEFAULT ''")
        print("Successfully added 'content_html'")
    
    # Add content_json if missing
    if "content_json" not in columns:
        print("Adding 'content_json' column...")
        cursor.execute("ALTER TABLE submissions ADD COLUMN content_json JSON DEFAULT '{}'")
        print("Successfully added 'content_json'")
        
    conn.commit()
    conn.close()
    print("Database migration complete.")
except Exception as e:
    print(f"Error migrating database: {e}")
