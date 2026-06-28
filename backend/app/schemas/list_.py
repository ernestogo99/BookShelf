import uuid

from pydantic import BaseModel

from app.schemas.book import BookResponse


class ListCreate(BaseModel):
    title: str
    description: str | None = None


class ListUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class ListBookResponse(BaseModel):
    model_config = {"from_attributes": True}

    book: BookResponse
    position: int


class ListResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    description: str | None
    books: list[ListBookResponse]
    created_at: str
    updated_at: str


class AddBookInput(BaseModel):
    book_id: uuid.UUID


class ReorderItem(BaseModel):
    book_id: uuid.UUID
    position: int


class ReorderInput(BaseModel):
    items: list[ReorderItem]
