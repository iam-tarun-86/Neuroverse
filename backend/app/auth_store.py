import json
import os
import threading
from typing import Dict, List, Optional
from datetime import datetime

USERS_FILE_PATH = os.path.join(os.path.dirname(__file__), "users_db.json")
_lock = threading.Lock()

DEFAULT_DATA = {
    "users": [
        {
            "id": "usr-admin",
            "name": "Directorate Administrator",
            "email": "admin@gmail.com",
            "password": "admin@123",
            "role": "Admin",
            "status": "approved",
            "createdAt": "2026-09-01"
        },
        {
            "id": "usr-1",
            "name": "Shri Rajesh Sharma",
            "email": "officer@gov.in",
            "password": "officer@123",
            "role": "Procurement Officer",
            "status": "approved",
            "createdAt": "2026-09-03"
        }
    ],
    "waitlist": [
        {
            "id": "req-1",
            "name": "Er. Vikram Malhotra",
            "email": "vikram.malhotra@cpwd.gov.in",
            "password": "vikram@password",
            "role": "Procurement Engineer (CPWD)",
            "status": "pending",
            "requestedAt": "2026-09-07 15:45"
        }
    ]
}

def _load_data() -> Dict:
    with _lock:
        if not os.path.exists(USERS_FILE_PATH):
            _save_data_unlocked(DEFAULT_DATA)
            return DEFAULT_DATA
        try:
            with open(USERS_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_DATA

def _save_data_unlocked(data: Dict):
    with open(USERS_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _save_data(data: Dict):
    with _lock:
        _save_data_unlocked(data)

def get_all_users() -> List[Dict]:
    data = _load_data()
    users = []
    for u in data.get("users", []):
        safe_u = dict(u)
        safe_u.pop("password", None)
        users.append(safe_u)
    return users

def get_waitlist() -> List[Dict]:
    data = _load_data()
    waitlist = []
    for r in data.get("waitlist", []):
        safe_r = dict(r)
        safe_r.pop("password", None)
        waitlist.append(safe_r)
    return waitlist

def register_user(name: str, email: str, password: str, role: str) -> Dict:
    data = _load_data()
    email_clean = email.strip().lower()

    # Check if already active
    for u in data.get("users", []):
        if u.get("email", "").lower() == email_clean:
            return {"success": False, "message": "An active account with this Email ID already exists."}

    # Check if already pending on waitlist
    for r in data.get("waitlist", []):
        if r.get("email", "").lower() == email_clean and r.get("status") == "pending":
            return {"success": False, "message": "A registration request for this Email ID is already pending on the administrator waitlist."}

    new_req = {
        "id": f"req-{int(datetime.now().timestamp() * 1000)}",
        "name": name.strip(),
        "email": email_clean,
        "password": password.strip(),
        "role": role.strip() or "Procurement Officer",
        "status": "pending",
        "requestedAt": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    data.setdefault("waitlist", []).insert(0, new_req)
    _save_data(data)

    safe_req = dict(new_req)
    safe_req.pop("password", None)
    return {
        "success": True,
        "message": "Registration request submitted. Awaiting administrator permit.",
        "request": safe_req
    }

def login_user(email: str, password: str) -> Dict:
    data = _load_data()
    email_clean = email.strip().lower()
    pw_clean = password.strip()

    # 1. Check waitlist
    for r in data.get("waitlist", []):
        if r.get("email", "").lower() == email_clean:
            if r.get("status") == "pending":
                return {
                    "success": False,
                    "status_code": "PENDING_APPROVAL",
                    "message": "Your registration request has been submitted and is on the waitlist awaiting approval from the Administrator (admin@gmail.com)."
                }
            elif r.get("status") == "rejected":
                return {
                    "success": False,
                    "status_code": "REJECTED",
                    "message": "Your registration request was reviewed and rejected by the Administrator."
                }

    # 2. Check active users
    for u in data.get("users", []):
        if u.get("email", "").lower() == email_clean and u.get("password") == pw_clean:
            if u.get("status") != "approved":
                return {
                    "success": False,
                    "status_code": "INACTIVE",
                    "message": "This account is inactive or pending verification."
                }
            safe_u = dict(u)
            safe_u.pop("password", None)
            return {
                "success": True,
                "user": safe_u
            }

    return {
        "success": False,
        "status_code": "INVALID_CREDENTIALS",
        "message": "Invalid Email ID or Password. Please check your credentials."
    }

def approve_request(request_id: str) -> Dict:
    data = _load_data()
    waitlist = data.get("waitlist", [])
    found_req = None
    new_waitlist = []

    for r in waitlist:
        if r.get("id") == request_id:
            found_req = r
        else:
            new_waitlist.append(r)

    if not found_req:
        return {"success": False, "message": "Request not found on waitlist."}

    new_user = {
        "id": f"usr-{int(datetime.now().timestamp() * 1000)}",
        "name": found_req.get("name"),
        "email": found_req.get("email"),
        "password": found_req.get("password"),
        "role": found_req.get("role"),
        "status": "approved",
        "createdAt": datetime.now().strftime("%Y-%m-%d")
    }

    data["users"] = data.get("users", []) + [new_user]
    data["waitlist"] = new_waitlist
    _save_data(data)

    safe_u = dict(new_user)
    safe_u.pop("password", None)
    return {"success": True, "message": f"Approved {safe_u['name']}. Account is now active.", "user": safe_u}

def reject_request(request_id: str) -> Dict:
    data = _load_data()
    waitlist = data.get("waitlist", [])
    new_waitlist = [r for r in waitlist if r.get("id") != request_id]

    data["waitlist"] = new_waitlist
    _save_data(data)
    return {"success": True, "message": "Registration request rejected."}

def add_user_direct(name: str, email: str, password: str, role: str) -> Dict:
    data = _load_data()
    email_clean = email.strip().lower()

    for u in data.get("users", []):
        if u.get("email", "").lower() == email_clean:
            return {"success": False, "message": "User with this Email ID already exists."}

    new_user = {
        "id": f"usr-{int(datetime.now().timestamp() * 1000)}",
        "name": name.strip(),
        "email": email_clean,
        "password": password.strip(),
        "role": role.strip() or "Procurement Officer",
        "status": "approved",
        "createdAt": datetime.now().strftime("%Y-%m-%d")
    }

    data.setdefault("users", []).append(new_user)
    _save_data(data)

    safe_u = dict(new_user)
    safe_u.pop("password", None)
    return {"success": True, "message": f"User {safe_u['name']} created.", "user": safe_u}

def delete_user(user_id: str) -> Dict:
    data = _load_data()
    users = data.get("users", [])
    user_to_delete = next((u for u in users if u.get("id") == user_id), None)

    if not user_to_delete:
        return {"success": False, "message": "User not found."}

    if user_to_delete.get("email", "").lower() == "admin@gmail.com":
        return {"success": False, "message": "Primary System Administrator cannot be deleted."}

    data["users"] = [u for u in users if u.get("id") != user_id]
    _save_data(data)
    return {"success": True, "message": f"User {user_to_delete.get('name')} deleted successfully."}
