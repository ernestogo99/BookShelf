import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.list_ import (
    AddBookInput,
    ListCreate,
    ListResponse,
    ListUpdate,
    ReorderInput,
)
from backend.app.services import list_service

router = APIRouter()


@router.post("/", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create_list(
    data: ListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_service.create(db, user_id=current_user.id, data=data)


@router.get("/{list_id}", response_model=ListResponse)
def get_list(
    list_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_service.get_by_id(db, list_id=list_id, user_id=current_user.id)


@router.patch("/{list_id}", response_model=ListResponse)
def update_list(
    list_id: uuid.UUID,
    data: ListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_service.update(db, list_id=list_id, user_id=current_user.id, data=data)


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    list_service.delete(db, list_id=list_id, user_id=current_user.id)


@router.post("/{list_id}/books", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def add_book_to_list(
    list_id: uuid.UUID,
    data: AddBookInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_service.add_book(db, list_id=list_id, user_id=current_user.id, data=data)


@router.delete("/{list_id}/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book_from_list(
    list_id: uuid.UUID,
    book_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    list_service.remove_book(db, list_id=list_id, book_id=book_id, user_id=current_user.id)


@router.patch("/{list_id}/books/reorder", response_model=ListResponse)
def reorder_list_books(
    list_id: uuid.UUID,
    data: ReorderInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_service.reorder(db, list_id=list_id, user_id=current_user.id, data=data)
