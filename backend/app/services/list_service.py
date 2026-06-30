import uuid

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.models.book import Book
from backend.app.models.list_ import List, ListBook
from backend.app.schemas.list_ import (
    AddBookInput,
    ListCreate,
    ListResponse,
    ListUpdate,
    ReorderInput,
)


def _to_response(lst: List) -> ListResponse:
    return ListResponse(
        id=lst.id,
        title=lst.title,
        description=lst.description,
        created_at=lst.created_at,
        updated_at=lst.updated_at,
        books=[{"book": lb.book, "position": lb.position} for lb in lst.list_books],
    )


def create(db: Session, user_id: uuid.UUID, data: ListCreate) -> ListResponse:
    lst = List(user_id=user_id, title=data.title, description=data.description)
    db.add(lst)
    db.commit()
    db.refresh(lst)
    return _to_response(lst)


def get_by_id(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> ListResponse:
    lst = db.get(List, list_id)
    if not lst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista não encontrada")
    if lst.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
    return _to_response(lst)


def update(db: Session, list_id: uuid.UUID, user_id: uuid.UUID, data: ListUpdate) -> ListResponse:
    lst = db.get(List, list_id)
    if not lst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista não encontrada")
    if lst.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")

    if data.title is not None:
        lst.title = data.title
    if data.description is not None:
        lst.description = data.description
    db.commit()
    db.refresh(lst)
    return _to_response(lst)


def delete(db: Session, list_id: uuid.UUID, user_id: uuid.UUID) -> None:
    lst = db.get(List, list_id)
    if not lst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista não encontrada")
    if lst.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
    db.delete(lst)
    db.commit()


def add_book(
    db: Session, list_id: uuid.UUID, user_id: uuid.UUID, data: AddBookInput
) -> ListResponse:
    lst = db.get(List, list_id)
    if not lst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista não encontrada")
    if lst.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")

    book = db.get(Book, data.book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")

    existing = db.get(ListBook, (list_id, data.book_id))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Livro já está na lista")

    max_pos = (
        db.query(func.max(ListBook.position)).filter(ListBook.list_id == list_id).scalar() or 0
    )
    lb = ListBook(list_id=list_id, book_id=data.book_id, position=max_pos + 1)
    db.add(lb)
    db.commit()
    db.refresh(lst)
    return _to_response(lst)


def remove_book(db: Session, list_id: uuid.UUID, book_id: uuid.UUID, user_id: uuid.UUID) -> None:
    lst = db.get(List, list_id)
    if not lst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista não encontrada")
    if lst.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")

    lb = db.get(ListBook, (list_id, book_id))
    if not lb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não está na lista")
    db.delete(lb)
    db.commit()


def reorder(
    db: Session, list_id: uuid.UUID, user_id: uuid.UUID, data: ReorderInput
) -> ListResponse:
    lst = db.get(List, list_id)
    if not lst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista não encontrada")
    if lst.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")

    existing_book_ids = {lb.book_id for lb in lst.list_books}
    for item in data.items:
        if item.book_id not in existing_book_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Livro {item.book_id} não pertence a esta lista",
            )

    lb_map = {lb.book_id: lb for lb in lst.list_books}
    for item in data.items:
        lb_map[item.book_id].position = item.position

    db.commit()
    db.refresh(lst)
    return _to_response(lst)


def list_by_user(db: Session, user_id: uuid.UUID) -> list[ListResponse]:
    lists = db.query(List).filter(List.user_id == user_id).all()
    return [_to_response(lst) for lst in lists]
