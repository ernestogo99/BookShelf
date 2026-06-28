def test_register_success(client):
    resp = client.post(
        "/auth/register",
        json={"username": "newuser", "email": "new@example.com", "password": "pass123", "name": "New User"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    payload = {"username": "user1", "email": "dup@example.com", "password": "pass", "name": "User"}
    client.post("/auth/register", json=payload)
    payload["username"] = "user2"
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success(client):
    client.post(
        "/auth/register",
        json={"username": "loginuser", "email": "login@example.com", "password": "mypass", "name": "Login User"},
    )
    resp = client.post("/auth/login", json={"email": "login@example.com", "password": "mypass"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={"username": "wrongpass", "email": "wp@example.com", "password": "correct", "name": "WP"},
    )
    resp = client.post("/auth/login", json={"email": "wp@example.com", "password": "wrong"})
    assert resp.status_code == 401
