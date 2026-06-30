from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import PaginatedResponse
from backend.app.schemas.list_ import ListResponse
from backend.app.schemas.reading import ReadingResponse
from backend.app.schemas.review import ReviewResponse
from backend.app.schemas.user import (
    UserProfileResponse,
    UserResponse,
    UserStatsResponse,
    UserUpdateInput,
)
from backend.app.services import user_service
from backend.app.services import list_service, reading_service, review_service, stats_service

router = APIRouter()


@router.get("/", response_model=UserProfileResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    counts = stats_service.get_profile_counts(db, current_user.id)
    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        name=current_user.name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        **counts,
    )


@router.patch("/", response_model=UserResponse)
def update_me(
    data: UserUpdateInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.update(db, current_user.id, data)


@router.get("/stats", response_model=UserStatsResponse)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return stats_service.get_user_stats(db, current_user.id)


@router.get("/readings", response_model=PaginatedResponse[ReadingResponse])
def get_my_readings(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = reading_service.list_by_user(db, current_user.id, status, page, per_page)
    return PaginatedResponse(
        items=[
            ReadingResponse(id=r.id, status=r.status, rating=r.rating, book=r.book) for r in items
        ],
        total=total,
        page=page,
        per_page=per_page,
        has_next=(page * per_page) < total,
    )


@router.get("/reviews", response_model=PaginatedResponse[ReviewResponse])
def get_my_reviews(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = review_service.list_by_user(db, current_user.id, page, per_page)
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


@router.get("/lists", response_model=list[ListResponse])
def get_my_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_service.list_by_user(db, current_user.id)
