import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_optional_current_user
from backend.app.models.user import User
from backend.app.schemas.book import BookDetailResponse
from backend.app.schemas.common import PaginatedResponse
from backend.app.schemas.review import ReviewResponse
from backend.app.services import review_service
from backend.app.services import book_service

router = APIRouter()


@router.get("/search", response_model=list[BookDetailResponse])
def search_books(
    q: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    return book_service.search(db, q, current_user.id if current_user else None)


@router.get("/{book_id}", response_model=BookDetailResponse)
def get_book(
    book_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    return book_service.get_by_id(db, book_id, current_user.id if current_user else None)


@router.get("/{book_id}/reviews", response_model=PaginatedResponse[ReviewResponse])
def get_book_reviews(
    book_id: uuid.UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = review_service.list_by_book(db, book_id, page, per_page)
    return PaginatedResponse(
        items=[
            ReviewResponse(
                id=r.id,
                book_id=r.book_id,
                content=r.content,
                has_spoiler=r.has_spoiler,
                created_at=r.created_at,
                updated_at=r.updated_at,
                author=r.user,
            )
            for r in items
        ],
        total=total,
        page=page,
        per_page=per_page,
        has_next=(page * per_page) < total,
    )
