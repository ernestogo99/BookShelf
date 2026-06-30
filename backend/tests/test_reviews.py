import pytest


@pytest.fixture()
def book_id(auth_client):
    resp = auth_client.get("/books/search?q=sapiens")
    books = resp.json()
    assert len(books) > 0
    return books[0]["id"]


def test_create_review(auth_client, book_id):
    resp = auth_client.post(
        "/reviews/",
        json={"book_id": book_id, "content": "Excelente livro!", "has_spoiler": False},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["content"] == "Excelente livro!"
    assert "author" in data


def test_duplicate_review_returns_409(auth_client, book_id):
    auth_client.post("/reviews/", json={"book_id": book_id, "content": "Primeira resenha", "has_spoiler": False})
    resp = auth_client.post("/reviews/", json={"book_id": book_id, "content": "Segunda resenha", "has_spoiler": False})
    assert resp.status_code == 409


def test_update_other_user_review_forbidden(client, book_id):
    resp_a = client.post(
        "/auth/register",
        json={"username": "rev_a", "email": "reva@example.com", "password": "pass123", "name": "A"},
    )
    token_a = resp_a.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token_a}"})

    create_resp = client.post(
        "/reviews/",
        json={"book_id": book_id, "content": "Resenha de A", "has_spoiler": False},
    )
    review_id = create_resp.json()["id"]

    resp_b = client.post(
        "/auth/register",
        json={"username": "rev_b", "email": "revb@example.com", "password": "pass123", "name": "B"},
    )
    token_b = resp_b.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token_b}"})

    resp = client.patch(f"/reviews/{review_id}", json={"content": "Alterado por B"})
    assert resp.status_code == 403
