import uuid

from pydantic import BaseModel, field_validator

from app.schemas.book import BookResponse, ReadingEmbedded  # noqa: F401


class ReadingCreate(BaseModel):
    book_id: uuid.UUID
    status: str
    rating: int | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"read", "reading", "want_to_read"}
        if v not in allowed:
            raise ValueError(f"status deve ser um de: {allowed}")
        return v

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int | None) -> int | None:
        if v is not None and v not in range(1, 6):
            raise ValueError("rating deve ser entre 1 e 5")
        return v


class ReadingResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    status: str
    rating: int | None
    book: BookResponse
