import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, joinedload

from backend.app.models.book import Book
from backend.app.models.reading import Reading
from backend.app.schemas.reading import ReadingCreate, ReadingResponse


def _update_book_rating_cache(db: Session, book_id: uuid.UUID) -> None:
    result = db.execute(
        select(func.avg(Reading.rating), func.count(Reading.id)).where(
            Reading.book_id == book_id, Reading.rating.isnot(None)
        )
    ).one()
    avg, total = result
    book = db.get(Book, book_id)
    if book:
        book.avg_rating = round(float(avg), 2) if avg else 0
        book.total_ratings = total or 0


def upsert(db: Session, user_id: uuid.UUID, data: ReadingCreate) -> ReadingResponse:
    book = db.get(Book, data.book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")

    # A nota só faz sentido para livros lidos; descarta-a nos demais status.
    rating = data.rating if data.status == "read" else None

    stmt = (
        insert(Reading)
        .values(
            id=uuid.uuid4(),
            user_id=user_id,
            book_id=data.book_id,
            status=data.status,
            rating=rating,
        )
        .on_conflict_do_update(
            index_elements=["user_id", "book_id"],
            set_={"status": data.status, "rating": rating, "updated_at": text("now()")},
        )
        .returning(Reading.id)
    )
    result = db.execute(stmt)
    reading_id = result.scalar_one()

    _update_book_rating_cache(db, data.book_id)
    db.commit()

    reading = db.get(Reading, reading_id)
    return ReadingResponse(
        id=reading.id,
        status=reading.status,
        rating=reading.rating,
        book=reading.book,
    )


def delete(db: Session, reading_id: uuid.UUID, user_id: uuid.UUID) -> None:
    reading = db.get(Reading, reading_id)
    if not reading:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leitura não encontrada")
    if reading.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")

    book_id = reading.book_id
    db.delete(reading)
    _update_book_rating_cache(db, book_id)
    db.commit()


def list_by_user(
    db: Session,
    user_id: uuid.UUID,
    status_filter: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Reading], int]:
    query = db.query(Reading).filter(Reading.user_id == user_id).options(joinedload(Reading.book))
    if status_filter:
        query = query.filter(Reading.status == status_filter)
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total
