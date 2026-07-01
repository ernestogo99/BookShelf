import uuid

from pydantic import BaseModel, Field

from app.schemas.book import BookResponse


class ListCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class ListUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


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
