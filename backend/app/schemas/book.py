import uuid

from pydantic import BaseModel


class BookResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    ol_key: str | None
    title: str
    authors: list[str]
    publisher: str | None
    published_year: int | None
    pages: int | None
    synopsis: str | None
    cover_url: str | None
    genres: list[str] | None
    avg_rating: float
    total_ratings: int


class BookDetailResponse(BookResponse):
    my_reading: "ReadingEmbedded | None" = None


class ReadingEmbedded(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    status: str
    rating: int | None


BookDetailResponse.model_rebuild()
