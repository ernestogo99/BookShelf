import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.reading import ReadingCreate, ReadingResponse
from app.services import reading_service

router = APIRouter()


@router.post("/", response_model=ReadingResponse, status_code=status.HTTP_201_CREATED)
def upsert_reading(
    data: ReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reading_service.upsert(db, user_id=current_user.id, data=data)


@router.delete("/{reading_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reading(
    reading_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reading_service.delete(db, reading_id=reading_id, user_id=current_user.id)
