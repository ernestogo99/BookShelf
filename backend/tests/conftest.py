import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.app.config import settings
from backend.app.database import Base, get_db
from backend.app.main import app

TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/bookapp_test"

engine_test = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

# Recria o gatilho de full-text search (normalmente criado via migration) para que
# o esquema de teste — montado por create_all — fique fiel à produção.
_SEARCH_TRIGGER = """
    CREATE OR REPLACE FUNCTION books_search_update() RETURNS trigger AS $$
    BEGIN
        NEW.search_vector := to_tsvector(
            'portuguese',
            coalesce(NEW.title, '') || ' ' ||
            coalesce(array_to_string(NEW.authors, ' '), '') || ' ' ||
            coalesce(NEW.synopsis, '')
        );
        RETURN NEW;
    END
    $$ LANGUAGE plpgsql
"""

# Catálogo mínimo e determinístico para a busca local não depender de rede.
_SEED_BOOKS = """
    INSERT INTO books (id, title, authors, avg_rating, total_ratings)
    VALUES
        (gen_random_uuid(), 'Duna', ARRAY['Frank Herbert'], 0, 0),
        (gen_random_uuid(),
         'Sapiens: Uma Breve História da Humanidade',
         ARRAY['Yuval Noah Harari'], 0, 0)
"""


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Desliga o fallback da Open Library para a suíte nunca tocar a rede.
    settings.OPENLIBRARY_ENABLED = False

    Base.metadata.create_all(bind=engine_test)
    with engine_test.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        conn.execute(text(_SEARCH_TRIGGER))
        conn.execute(text("DROP TRIGGER IF EXISTS books_search_vector_trigger ON books"))
        conn.execute(
            text(
                "CREATE TRIGGER books_search_vector_trigger "
                "BEFORE INSERT OR UPDATE OF title, authors, synopsis ON books "
                "FOR EACH ROW EXECUTE FUNCTION books_search_update()"
            )
        )
        conn.execute(text(_SEED_BOOKS))
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture()
def db():
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_client(client):
    resp = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "secret123",
            "name": "Test User",
        },
    )
    token = resp.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


@pytest.fixture()
def auth_client_b(client):
    resp = client.post(
        "/auth/register",
        json={
            "username": "testuserb",
            "email": "testb@example.com",
            "password": "secret123",
            "name": "User B",
        },
    )
    token = resp.json()["access_token"]
    return client, token
