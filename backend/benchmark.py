#!/usr/bin/env python3
"""
Performance Benchmark Script for Abigail Spelling Assessment App

Tests:
- SC-001: Student login to first sentence (<30 seconds)
- SC-002: CSV roster upload for 30 students (<20 seconds)
"""

import time
import csv
import io
import requests
from typing import Dict, Any

# Configuration
API_BASE = "http://localhost:8000/api"

def benchmark_student_login_time():
    """
    SC-001: Students can log in and start their first sentence in under 30 seconds.
    
    Measures:
    1. Time to load login page (frontend)
    2. Time to authenticate
    3. Time to load project selection
    4. Time to open editor and start typing
    """
    print("=" * 60)
    print("BENCHMARK: SC-001 - Student Login to First Sentence")
    print("=" * 60)
    
    start_time = time.time()
    
    # Step 1: Fetch students list (simulates avatar grid load)
    print("Step 1: Loading student avatars...")
    step1_start = time.time()
    try:
        response = requests.get(f"{API_BASE}/student/list")
        students = response.json()
        step1_time = time.time() - step1_start
        print(f"  ✓ Loaded {len(students)} students in {step1_time:.3f}s")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return
    
    if not students:
        print("  ⚠ No students in database. Run roster import first.")
        return
    
    # Step 2: Student login (simulate)
    print("Step 2: Authenticating student...")
    step2_start = time.time()
    try:
        login_data = {
            "student_id": students[0]["id"],
            "password": "password123"  # Default test password
        }
        response = requests.post(f"{API_BASE}/student/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            step2_time = time.time() - step2_start
            print(f"  ✓ Authentication successful in {step2_time:.3f}s")
        else:
            print(f"  ✗ Authentication failed: {response.status_code}")
            return
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return
    
    # Step 3: Fetch assigned projects
    print("Step 3: Loading assigned projects...")
    step3_start = time.time()
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/student/projects", headers=headers)
        projects = response.json()
        step3_time = time.time() - step3_start
        print(f"  ✓ Loaded {len(projects)} projects in {step3_time:.3f}s")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return
    
    if not projects:
        print("  ⚠ No active projects assigned.")
        return
    
    # Step 4: Open project editor (fetch project details)
    print("Step 4: Opening editor...")
    step4_start = time.time()
    try:
        response = requests.get(f"{API_BASE}/student/projects/{projects[0]['id']}", headers=headers)
        project = response.json()
        step4_time = time.time() - step4_start
        print(f"  ✓ Editor loaded in {step4_time:.3f}s")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return
    
    total_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print(f"RESULT: Total time = {total_time:.3f}s")
    if total_time < 30:
        print(f"✓ PASS - Within 30 second target (SC-001)")
    else:
        print(f"✗ FAIL - Exceeds 30 second target (SC-001)")
    print("=" * 60)
    print()


def benchmark_csv_upload_time():
    """
    SC-002: Teachers can successfully roster a class of 30 students via CSV in under 20 seconds.
    
    Measures:
    1. CSV generation time
    2. Upload and processing time
    3. Database insertion time
    """
    print("=" * 60)
    print("BENCHMARK: SC-002 - CSV Upload for 30 Students")
    print("=" * 60)
    
    # Generate test CSV
    print("Generating test CSV with 30 students...")
    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)
    writer.writerow(["Name", "Year Level", "ID Code", "Class Group", "Password", "Avatar ID"])
    
    for i in range(1, 31):
        writer.writerow([
            f"Test Student {i}",
            5,
            f"TEST{i:03d}",
            "5A",
            "password123",
            f"avatar{(i % 3) + 1}"
        ])
    
    csv_content = csv_buffer.getvalue()
    print(f"  ✓ Generated CSV ({len(csv_content)} bytes)")
    
    # Upload CSV
    print("Uploading CSV to server...")
    start_time = time.time()
    
    try:
        files = {"file": ("roster.csv", csv_content, "text/csv")}
        response = requests.post(f"{API_BASE}/roster/upload", files=files)
        
        upload_time = time.time() - start_time
        
        if response.status_code == 200:
            results = response.json()
            print(f"  ✓ Upload completed in {upload_time:.3f}s")
            print(f"    - Total processed: {results['total']}")
            print(f"    - Created: {results['created']}")
            print(f"    - Updated: {results['updated']}")
            print(f"    - Errors: {len(results['errors'])}")
        else:
            print(f"  ✗ Upload failed: {response.status_code}")
            print(f"    {response.text}")
            return
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return
    
    print("\n" + "=" * 60)
    print(f"RESULT: Total time = {upload_time:.3f}s")
    if upload_time < 20:
        print(f"✓ PASS - Within 20 second target (SC-002)")
    else:
        print(f"✗ FAIL - Exceeds 20 second target (SC-002)")
    print("=" * 60)
    print()


def run_all_benchmarks():
    """Run all performance benchmarks"""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 10 + "Abigail Performance Benchmarks" + " " * 17 + "║")
    print("╚" + "═" * 58 + "╝")
    print()
    
    # Verify server is running
    try:
        response = requests.get(f"{API_BASE}/health", timeout=2)
        if response.status_code != 200:
            print("✗ Server is not responding. Please start the application first.")
            return
    except Exception:
        print("✗ Cannot connect to server at", API_BASE)
        print("  Please ensure the application is running.")
        return
    
    print("✓ Server is running\n")
    
    # Run benchmarks
    benchmark_csv_upload_time()
    time.sleep(1)  # Brief pause between tests
    benchmark_student_login_time()
    
    print("\n" + "=" * 60)
    print("All benchmarks completed!")
    print("=" * 60)


if __name__ == "__main__":
    run_all_benchmarks()
