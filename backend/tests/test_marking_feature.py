"""
Test script for AI NAPLAN marking feature.
Run with: python tests/test_marking_feature.py (standalone)
Or: python -m pytest tests/test_marking_feature.py -v
"""
import os
import sys

# Add backend to path so we can import src
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)
TEACHER_USERNAME = "admin"
TEACHER_PASSWORD = "abigail2026"


def get_teacher_token():
    """Login as teacher and return JWT."""
    r = client.post(
        "/api/auth/login",
        json={"username": TEACHER_USERNAME, "password": TEACHER_PASSWORD},
    )
    r.raise_for_status()
    return r.json()["access_token"]


def test_health():
    """Backend health check."""
    r = client.get("/api/health")
    assert r.status_code == 200, r.text
    assert r.json().get("status") == "healthy"
    print("  [OK] Health check passed")


def test_marking_requires_auth():
    """Grade endpoint returns 401 without token."""
    r = client.post("/api/marking/grade/00000000-0000-0000-0000-000000000001")
    assert r.status_code == 401, r.text
    print("  [OK] Marking grade requires auth (401)")


def test_marking_grade_ollama_unavailable():
    """When Ollama is not running, grade returns 503 or 200 if already graded."""
    token = get_teacher_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get a real submission ID if any
    r_projects = client.get("/api/projects", headers=headers)
    r_projects.raise_for_status()
    projects = r_projects.json()
    if not projects:
        print("  [SKIP] No projects; using fake submission ID")
        submission_id = "00000000-0000-0000-0000-000000000001"
    else:
        r_subs = client.get(
            f"/api/submissions/project/{projects[0]['id']}",
            headers=headers,
        )
        r_subs.raise_for_status()
        submissions = r_subs.json()
        submitted = [s for s in submissions if s.get("status") == "SUBMITTED"]
        if submitted:
            submission_id = str(submitted[0]["id"])
        elif submissions:
            submission_id = str(submissions[0]["id"])
        else:
            submission_id = "00000000-0000-0000-0000-000000000001"

    r = client.post(
        f"/api/marking/grade/{submission_id}",
        headers=headers,
        timeout=90,
    )

    # 200 = already graded or just graded (Ollama running)
    # 400 = submission not SUBMITTED or not found
    # 503 = Ollama not available
    assert r.status_code in (200, 400, 503), f"Unexpected {r.status_code}: {r.text}"
    if r.status_code == 503:
        assert "Ollama" in r.json().get("detail", "")
        print("  [OK] Marking grade returns 503 when Ollama unavailable")
        return None
    if r.status_code == 200:
        data = r.json()
        assert "assessment_id" in data
        assert "total_score" in data
        assert "max_score" in data
        print(f"  [OK] Marking grade returned 200 (assessment_id={data['assessment_id']})")
        return data.get("assessment_id")
    print(f"  [OK] Marking grade returned {r.status_code} (validation/not found)")
    return None


def test_marking_results_requires_auth():
    """GET results returns 401 without token."""
    r = client.get("/api/marking/results/00000000-0000-0000-0000-000000000001")
    assert r.status_code == 401, r.text
    print("  [OK] GET results requires auth (401)")


def test_marking_results_get(assessment_id=None):
    """GET results by assessment_id."""
    token = get_teacher_token()
    headers = {"Authorization": f"Bearer {token}"}

    if not assessment_id:
        assessment_id = "00000000-0000-0000-0000-000000000001"

    r = client.get(
        f"/api/marking/results/{assessment_id}",
        headers=headers,
    )

    if r.status_code == 404:
        print("  [OK] GET results 404 for unknown assessment_id")
        return
    r.raise_for_status()
    data = r.json()
    assert "id" in data
    assert "total_score" in data
    assert "criteria_scores" in data
    print(f"  [OK] GET results returned assessment (total_score={data['total_score']}/{data['max_score']})")


def run_standalone():
    """Run tests without pytest."""
    print("Testing AI NAPLAN Marking feature (in-process)")
    print("-" * 50)
    try:
        test_health()
        test_marking_requires_auth()
        test_marking_results_requires_auth()
        assessment_id = test_marking_grade_ollama_unavailable()
        test_marking_results_get(assessment_id)
        print("-" * 50)
        print("All checks passed.")
    except Exception as e:
        print("FAILED:", e)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    run_standalone()
