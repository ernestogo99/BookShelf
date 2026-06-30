import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate
from backend.app.services import review_service

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return review_service.create(db, user_id=current_user.id, data=data)


@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: uuid.UUID,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return review_service.update(db, review_id=review_id, user_id=current_user.id, data=data)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review_service.delete(db, review_id=review_id, user_id=current_user.id)
