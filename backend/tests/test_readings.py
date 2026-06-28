import pytest


@pytest.fixture()
def book_id(auth_client):
    resp = auth_client.get("/books/search?q=duna")
    assert resp.status_code == 200
    books = resp.json()
    assert len(books) > 0
    return books[0]["id"]


def test_upsert_creates_reading(auth_client, book_id):
    resp = auth_client.post("/readings/", json={"book_id": book_id, "status": "want_to_read"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "want_to_read"
    assert data["book"]["id"] == book_id


def test_upsert_updates_existing(auth_client, book_id):
    auth_client.post("/readings/", json={"book_id": book_id, "status": "want_to_read"})
    resp = auth_client.post("/readings/", json={"book_id": book_id, "status": "read", "rating": 4})
    assert resp.status_code == 201
    assert resp.json()["status"] == "read"
    assert resp.json()["rating"] == 4


def test_rating_updates_book_cache(auth_client, book_id):
    auth_client.post("/readings/", json={"book_id": book_id, "status": "read", "rating": 5})
    resp = auth_client.get(f"/books/{book_id}")
    assert resp.status_code == 200
    book = resp.json()
    assert book["total_ratings"] >= 1
    assert float(book["avg_rating"]) > 0


def test_delete_recalculates_cache(auth_client, book_id):
    create_resp = auth_client.post("/readings/", json={"book_id": book_id, "status": "read", "rating": 3})
    reading_id = create_resp.json()["id"]

    auth_client.delete(f"/readings/{reading_id}")

    resp = auth_client.get(f"/books/{book_id}")
    assert resp.status_code == 200


def test_delete_other_user_forbidden(client, book_id):
    resp_a = client.post(
        "/auth/register",
        json={"username": "ruser_a", "email": "ra@example.com", "password": "pass", "name": "A"},
    )
    token_a = resp_a.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token_a}"})
    create_resp = client.post("/readings/", json={"book_id": book_id, "status": "read"})
    reading_id = create_resp.json()["id"]

    resp_b = client.post(
        "/auth/register",
        json={"username": "ruser_b", "email": "rb@example.com", "password": "pass", "name": "B"},
    )
    token_b = resp_b.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token_b}"})

    resp = client.delete(f"/readings/{reading_id}")
    assert resp.status_code == 403
