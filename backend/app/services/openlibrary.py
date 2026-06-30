"""Fallback de catálogo via Open Library.

Acionado por ``book_service.search`` quando o catálogo local não cobre a busca.
Os resultados são mapeados para o modelo ``Book``, persistidos (idempotente por
``ol_key``) e devolvidos já com UUID e ``search_vector`` preenchidos pelo trigger.
"""

import httpx
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.book import Book

_SEARCH_URL = "https://openlibrary.org/search.json"
_FIELDS = (
    "key,title,author_name,first_publish_year,number_of_pages_median,publisher,cover_i,subject"
)
_COVER_URL = "https://covers.openlibrary.org/b/id/{cover_i}-L.jpg"


def _map_doc(doc: dict) -> dict | None:
    title = doc.get("title")
    key = doc.get("key")
    if not title or not key:
        return None

    cover_i = doc.get("cover_i")
    publishers = doc.get("publisher") or []

    return {
        "ol_key": key,
        "title": title[:500],
        "authors": (doc.get("author_name") or [])[:10],
        "publisher": (publishers[0][:200] if publishers else None),
        "published_year": doc.get("first_publish_year"),
        "pages": doc.get("number_of_pages_median"),
        "synopsis": None,
        "cover_url": _COVER_URL.format(cover_i=cover_i) if cover_i else None,
        "genres": (doc.get("subject") or [])[:5],
    }


def search_and_persist(db: Session, query: str, limit: int = 10) -> list[Book]:
    try:
        resp = httpx.get(
            _SEARCH_URL,
            params={"q": query, "limit": limit, "fields": _FIELDS},
            timeout=settings.OPENLIBRARY_TIMEOUT,
        )
        resp.raise_for_status()
        docs = resp.json().get("docs", [])
    except (httpx.HTTPError, ValueError):
        # Rede indisponível ou resposta inválida → mantém resultado local vazio.
        return []

    rows = [m for m in (_map_doc(d) for d in docs) if m]
    if not rows:
        return []

    keys = [r["ol_key"] for r in rows]
    stmt = insert(Book).values(rows).on_conflict_do_nothing(index_elements=["ol_key"])
    db.execute(stmt)
    db.commit()

    # Re-busca para obter os UUIDs e o search_vector, preservando a ordem de
    # relevância devolvida pela Open Library.
    persisted = db.query(Book).filter(Book.ol_key.in_(keys)).all()
    by_key = {b.ol_key: b for b in persisted}
    return [by_key[k] for k in keys if k in by_key]
