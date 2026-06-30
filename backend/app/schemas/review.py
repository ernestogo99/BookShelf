import uuid

from pydantic import BaseModel, Field

from backend.app.schemas.user import UserResponse


class ReviewCreate(BaseModel):
    book_id: uuid.UUID
    content: str = Field(min_length=1, max_length=2000)
    has_spoiler: bool = False


class ReviewUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1, max_length=2000)
    has_spoiler: bool | None = None


class ReviewResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    book_id: uuid.UUID
    content: str
    has_spoiler: bool
    created_at: str
    updated_at: str
    author: UserResponse
