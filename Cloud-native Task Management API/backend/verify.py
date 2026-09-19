import os
import threading
import time
import requests
from werkzeug.security import generate_password_hash

os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///verify.db'

from app import create_app, db
from app.models import User, Sprint, Task

app = create_app('dev')

def setup_db():
    with app.app_context():
        db.create_all()
        # Create seed users
        user1 = User(id=1, name='User 1', email='user1@example.com', password_hash=generate_password_hash('pass1'), role='member')
        user2 = User(id=2, name='User 2', email='user2@example.com', password_hash=generate_password_hash('pass2'), role='member')
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()

def run_app():
    app.run(port=5001, use_reloader=False)

if __name__ == "__main__":
    if os.path.exists("verify.db"):
        os.remove("verify.db")
        
    setup_db()
    
    server_thread = threading.Thread(target=run_app)
    server_thread.daemon = True
    server_thread.start()
    
    time.sleep(2) # wait for server to start
    
    base_url = "http://127.0.0.1:5001/api"
    print("\n--- Starting Verifications ---")
    
    # 1. POST /api/auth/login (Correct)
    resp = requests.post(f"{base_url}/auth/login", json={"email": "user1@example.com", "password": "pass1"})
    print(f"Login (Correct) Status: {resp.status_code}")
    assert resp.status_code == 200
    token = resp.json().get('token')
    assert token is not None
    print("Login successful, token received.")
    
    # 2. POST /api/auth/login (Wrong)
    resp = requests.post(f"{base_url}/auth/login", json={"email": "user1@example.com", "password": "wrong"})
    print(f"Login (Wrong) Status: {resp.status_code}")
    assert resp.status_code == 401
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Hit protected POST without auth
    resp = requests.post(f"{base_url}/tasks/", json={"title": "Test"})
    print(f"Protected Endpoint without Auth Status: {resp.status_code}")
    assert resp.status_code == 401
    
    # 4. POST /api/tasks with nonexistent sprint_id
    resp = requests.post(f"{base_url}/tasks/", json={
        "title": "Bad Task",
        "sprint_id": 99999,
        "assignee_id": 1,
        "status": "todo",
        "priority": "low"
    }, headers=headers)
    print(f"POST Task with bad sprint_id Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    assert resp.status_code == 400
    
    # 5. GET /api/tasks?status=done filters correctly
    # First create a valid sprint
    resp = requests.post(f"{base_url}/sprints/", json={
        "name": "Sprint 1", "start_date": "2026-01-01", "end_date": "2026-01-14"
    }, headers=headers)
    sprint_id = resp.json()['id']
    
    # Create two tasks
    requests.post(f"{base_url}/tasks/", json={"title": "Task 1", "status": "todo", "sprint_id": sprint_id}, headers=headers)
    requests.post(f"{base_url}/tasks/", json={"title": "Task 2", "status": "done", "sprint_id": sprint_id}, headers=headers)
    
    resp = requests.get(f"{base_url}/tasks/?status=done", headers=headers)
    tasks = resp.json().get('items', [])
    print(f"Tasks with status=done count: {len(tasks)}")
    for t in tasks:
        assert t['status'] == 'done'
    print("Filter status=done verified.")
    
    # 6. Pagination GET /api/users?page=1&per_page=1
    resp1 = requests.get(f"{base_url}/users/?page=1&per_page=1", headers=headers)
    resp2 = requests.get(f"{base_url}/users/?page=2&per_page=1", headers=headers)
    user_p1 = resp1.json()['items'][0]['id']
    user_p2 = resp2.json()['items'][0]['id']
    print(f"User Page 1 ID: {user_p1}")
    print(f"User Page 2 ID: {user_p2}")
    assert user_p1 != user_p2
    print("Pagination verified.")
    
    print("\nAll verifications passed successfully!")
    os._exit(0)
