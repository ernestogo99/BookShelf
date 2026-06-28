from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.models.reading import Reading
from app.schemas.book import BookResponse

router = APIRouter()


@router.get("/trending", response_model=list[BookResponse])
def trending_books(db: Session = Depends(get_db)):
    seven_days_ago = datetime.now(UTC) - timedelta(days=7)
    results = (
        db.query(Book)
        .join(Reading, Reading.book_id == Book.id)
        .filter(Reading.updated_at >= str(seven_days_ago)[:19])
        .group_by(Book.id)
        .order_by(func.count(Reading.id).desc())
        .limit(10)
        .all()
    )
    return [
        BookResponse(
            id=b.id,
            ol_key=b.ol_key,
            title=b.title,
            authors=b.authors or [],
            publisher=b.publisher,
            published_year=b.published_year,
            pages=b.pages,
            synopsis=b.synopsis,
            cover_url=b.cover_url,
            genres=b.genres,
            avg_rating=float(b.avg_rating or 0),
            total_ratings=b.total_ratings or 0,
        )
        for b in results
    ]


@router.get("/top-rated", response_model=list[BookResponse])
def top_rated_books(db: Session = Depends(get_db)):
    results = (
        db.query(Book)
        .filter(Book.total_ratings >= 3)
        .order_by(Book.avg_rating.desc())
        .limit(10)
        .all()
    )
    return [
        BookResponse(
            id=b.id,
            ol_key=b.ol_key,
            title=b.title,
            authors=b.authors or [],
            publisher=b.publisher,
            published_year=b.published_year,
            pages=b.pages,
            synopsis=b.synopsis,
            cover_url=b.cover_url,
            genres=b.genres,
            avg_rating=float(b.avg_rating or 0),
            total_ratings=b.total_ratings or 0,
        )
        for b in results
    ]
