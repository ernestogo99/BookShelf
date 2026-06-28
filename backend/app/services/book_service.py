import uuid

import httpx
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.book import Book
from app.models.reading import Reading
from app.schemas.book import BookDetailResponse, ReadingEmbedded


def _row_to_schema(book: Book, user_reading: Reading | None = None) -> BookDetailResponse:
    reading_embed = None
    if user_reading:
        reading_embed = ReadingEmbedded(
            id=user_reading.id, status=user_reading.status, rating=user_reading.rating
        )
    return BookDetailResponse(
        id=book.id,
        ol_key=book.ol_key,
        title=book.title,
        authors=book.authors or [],
        publisher=book.publisher,
        published_year=book.published_year,
        pages=book.pages,
        synopsis=book.synopsis,
        cover_url=book.cover_url,
        genres=book.genres,
        avg_rating=float(book.avg_rating or 0),
        total_ratings=book.total_ratings or 0,
        my_reading=reading_embed,
    )


def _ol_call(query: str, extra_params: dict) -> list[dict]:
    try:
        resp = httpx.get(
            "https://openlibrary.org/search.json",
            params={
                "q": query,
                "limit": 15,
                # editions = nº de edições é o melhor proxy para "livro mais conhecido"
                "sort": "editions",
                "fields": "key,title,author_name,publisher,first_publish_year,"
                "number_of_pages_median,cover_i,subject",
                **extra_params,
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("docs", [])
    except Exception:
        return []


def _doc_to_item(doc: dict) -> dict | None:
    ol_key = doc.get("key")
    if not ol_key:
        return None
    cover_i = doc.get("cover_i")
    return {
        "ol_key": ol_key,
        "title": doc.get("title", ""),
        "authors": doc.get("author_name", []),
        "publisher": (doc.get("publisher") or [None])[0],
        "published_year": doc.get("first_publish_year"),
        "pages": doc.get("number_of_pages_median"),
        # -L.jpg = imagem grande (800px); -M = média (180px)
        "cover_url": f"https://covers.openlibrary.org/b/id/{cover_i}-L.jpg" if cover_i else None,
        "genres": (doc.get("subject") or [])[:5],
    }


def _fetch_from_open_library(query: str) -> list[dict]:
    # Busca 1: resultados em português (prioridade)
    pt_docs = _ol_call(query, {"language": "por"})
    # Busca 2: busca geral para cobrir títulos sem edição em pt
    all_docs = _ol_call(query, {})

    # Deduplica por work key — evita múltiplas edições do mesmo livro.
    # Resultados pt vêm primeiro, então a versão portuguesa tem prioridade.
    seen_keys: set[str] = set()
    results = []
    for doc in pt_docs + all_docs:
        work_key = doc.get("key")
        if not work_key or work_key in seen_keys:
            continue
        seen_keys.add(work_key)
        item = _doc_to_item(doc)
        if item:
            results.append(item)
        if len(results) >= 10:
            break

    return results


def search(
    db: Session, query: str, current_user_id: uuid.UUID | None = None
) -> list[BookDetailResponse]:
    local = (
        db.query(Book)
        .filter(
            or_(
                Book.title.ilike(f"%{query}%"),
                Book.authors.any(query),
            )
        )
        .limit(20)
        .all()
    )

    if len(local) >= 5:
        readings_map = {}
        if current_user_id:
            ids = [b.id for b in local]
            readings = (
                db.query(Reading)
                .filter(Reading.user_id == current_user_id, Reading.book_id.in_(ids))
                .all()
            )
            readings_map = {r.book_id: r for r in readings}
        return [_row_to_schema(b, readings_map.get(b.id)) for b in local]

    ol_results = _fetch_from_open_library(query)
    existing_keys = {b.ol_key for b in local if b.ol_key}

    new_books = []
    for item in ol_results:
        ol_key = item.get("ol_key")
        if ol_key and ol_key in existing_keys:
            continue
        if ol_key:
            existing = db.query(Book).filter(Book.ol_key == ol_key).first()
            if existing:
                existing_keys.add(ol_key)
                if existing not in local:
                    local.append(existing)
                continue
        book = Book(**item)
        db.add(book)
        new_books.append(book)

    if new_books:
        db.commit()
        for b in new_books:
            db.refresh(b)
        local.extend(new_books)

    readings_map = {}
    if current_user_id:
        ids = [b.id for b in local]
        readings = (
            db.query(Reading)
            .filter(Reading.user_id == current_user_id, Reading.book_id.in_(ids))
            .all()
        )
        readings_map = {r.book_id: r for r in readings}

    return [_row_to_schema(b, readings_map.get(b.id)) for b in local]


def get_by_id(
    db: Session, book_id: uuid.UUID, current_user_id: uuid.UUID | None = None
) -> BookDetailResponse:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")

    reading = None
    if current_user_id:
        reading = (
            db.query(Reading)
            .filter(Reading.user_id == current_user_id, Reading.book_id == book_id)
            .first()
        )
    return _row_to_schema(book, reading)
