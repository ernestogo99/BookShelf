import uuid
from collections import Counter, defaultdict

from fastapi import HTTPException, status
from sqlalchemy import cast, extract, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Session, joinedload

from app.models.book import Book
from app.models.reading import Reading
from app.schemas.user import UserStatsResponse


def get_profile_counts(db: Session, user_id: uuid.UUID) -> dict[str, int]:
    """Contadores de leitura por status para a tela de perfil."""
    rows = (
        db.query(Reading.status, func.count())
        .filter(Reading.user_id == user_id)
        .group_by(Reading.status)
        .all()
    )
    counts = dict(rows)
    return {
        "total_read": counts.get("read", 0),
        "total_reading": counts.get("reading", 0),
        "total_want_to_read": counts.get("want_to_read", 0),
    }


def get_user_stats(db: Session, user_id: uuid.UUID) -> UserStatsResponse:
    readings = (
        db.query(Reading)
        .filter(Reading.user_id == user_id, Reading.status == "read")
        .options(joinedload(Reading.book))
        .all()
    )

    total_read = len(readings)
    total_pages = 0
    ratings = []
    books_by_month: dict[str, int] = defaultdict(int)
    genre_counts: Counter = Counter()

    for reading in readings:
        book: Book = reading.book
        if book and book.pages:
            total_pages += book.pages
        if reading.rating is not None:
            ratings.append(reading.rating)

        updated = str(reading.updated_at)
        if updated and len(updated) >= 7:
            month_key = updated[:7]
            books_by_month[month_key] += 1

        if book and book.genres:
            genre_counts.update(book.genres)

    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None
    top_genres = [{"genre": g, "count": c} for g, c in genre_counts.most_common(5)]

    return UserStatsResponse(
        total_read=total_read,
        total_pages=total_pages,
        avg_rating_given=avg_rating,
        books_by_month=dict(books_by_month),
        top_genres=top_genres,
    )


def get_year_summary(db: Session, user_id: uuid.UUID, year: int) -> dict:
    year_readings = (
        db.query(Reading)
        .filter(
            Reading.user_id == user_id,
            Reading.status == "read",
            extract("year", cast(Reading.updated_at, TIMESTAMP)) == year,
        )
        .options(joinedload(Reading.book))
        .all()
    )

    if len(year_readings) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você precisa de pelo menos 3 livros lidos para gerar o resumo",
        )

    total_books = len(year_readings)
    total_pages = 0
    ratings = []
    genre_counts: Counter = Counter()
    author_counts: Counter = Counter()
    favorite_book = None
    best_rating = -1

    for reading in year_readings:
        book: Book = reading.book
        if book and book.pages:
            total_pages += book.pages
        if reading.rating is not None:
            ratings.append(reading.rating)
            if reading.rating > best_rating:
                best_rating = reading.rating
                favorite_book = book
        if book and book.genres:
            genre_counts.update(book.genres)
        if book and book.authors:
            author_counts.update(book.authors)

    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None
    top_genre = genre_counts.most_common(1)[0][0] if genre_counts else None
    top_author = author_counts.most_common(1)[0][0] if author_counts else None

    return {
        "total_books": total_books,
        "total_pages": total_pages,
        "top_genre": top_genre,
        "top_author": top_author,
        "favorite_book": {
            "id": str(favorite_book.id),
            "title": favorite_book.title,
            "cover_url": (favorite_book.cover_url or "")
            .replace("-S.jpg", "-L.jpg")
            .replace("-M.jpg", "-L.jpg")
            or None,
        }
        if favorite_book
        else None,
        "avg_rating": avg_rating,
    }
