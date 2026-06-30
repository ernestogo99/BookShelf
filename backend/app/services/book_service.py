import re
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.book import Book
from app.models.reading import Reading
from app.schemas.book import BookDetailResponse, ReadingEmbedded

# Remove sufixos entre parênteses no final do título:
# "Duna (eBook)" → "duna"
# "Duna (Crônicas de Duna #1)" → "duna"
# "1984 (Clássicos da literatura mundial)" → "1984"
_PAREN_SUFFIX = re.compile(r"\s*\([^)]*\)\s*$")


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


def _dedup_key(title: str) -> str:
    """Título normalizado usado como chave de dedup — ignora sufixos de edição."""
    return _PAREN_SUFFIX.sub("", title).strip().lower()


def search(
    db: Session, query: str, current_user_id: uuid.UUID | None = None
) -> list[BookDetailResponse]:
    fts = func.plainto_tsquery("portuguese", query)
    title_sim = func.similarity(Book.title, query)
    fts_rank = func.coalesce(func.ts_rank(Book.search_vector, fts), 0.0)

    # Busca mais candidatos do que o necessário para absorver as duplicatas.
    candidates = (
        db.query(Book)
        .filter(
            or_(
                Book.search_vector.op("@@")(fts),
                Book.title.ilike(f"%{query}%"),
            )
        )
        .order_by((title_sim + fts_rank).desc())
        .limit(60)
        .all()
    )

    # Mantém apenas o melhor resultado por título normalizado.
    # A ordem já está por score, então o primeiro encontrado é o mais relevante.
    seen: set[str] = set()
    books: list[Book] = []
    for book in candidates:
        key = _dedup_key(book.title)
        if key not in seen:
            seen.add(key)
            books.append(book)
        if len(books) == 20:
            break

    readings_map = {}
    if current_user_id and books:
        ids = [b.id for b in books]
        readings = (
            db.query(Reading)
            .filter(Reading.user_id == current_user_id, Reading.book_id.in_(ids))
            .all()
        )
        readings_map = {r.book_id: r for r in readings}

    return [_row_to_schema(b, readings_map.get(b.id)) for b in books]


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
