import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from backend.app.models.review import Review
from backend.app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate


def _to_response(review: Review) -> ReviewResponse:
    return ReviewResponse(
        id=review.id,
        book_id=review.book_id,
        content=review.content,
        has_spoiler=review.has_spoiler,
        created_at=review.created_at,
        updated_at=review.updated_at,
        author=review.user,
    )


def create(db: Session, user_id: uuid.UUID, data: ReviewCreate) -> ReviewResponse:
    existing = (
        db.query(Review).filter(Review.user_id == user_id, Review.book_id == data.book_id).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Você já escreveu uma resenha para este livro",
        )

    review = Review(
        user_id=user_id,
        book_id=data.book_id,
        content=data.content,
        has_spoiler=data.has_spoiler,
    )
    db.add(review)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Você já escreveu uma resenha para este livro",
        )
    db.refresh(review)
    return _to_response(review)


def update(
    db: Session, review_id: uuid.UUID, user_id: uuid.UUID, data: ReviewUpdate
) -> ReviewResponse:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resenha não encontrada")
    if review.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")

    if data.content is not None:
        review.content = data.content
    if data.has_spoiler is not None:
        review.has_spoiler = data.has_spoiler
    db.commit()
    db.refresh(review)
    return _to_response(review)


def delete(db: Session, review_id: uuid.UUID, user_id: uuid.UUID) -> None:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resenha não encontrada")
    if review.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
    db.delete(review)
    db.commit()


def list_by_book(
    db: Session, book_id: uuid.UUID, page: int = 1, per_page: int = 20
) -> tuple[list[Review], int]:
    query = db.query(Review).filter(Review.book_id == book_id).options(selectinload(Review.user))
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total


def list_by_user(
    db: Session, user_id: uuid.UUID, page: int = 1, per_page: int = 20
) -> tuple[list[Review], int]:
    query = db.query(Review).filter(Review.user_id == user_id).options(selectinload(Review.user))
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total
