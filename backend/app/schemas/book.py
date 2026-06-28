import uuid

from pydantic import BaseModel, field_validator


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

    @field_validator("cover_url", mode="before")
    @classmethod
    def upgrade_cover_size(cls, v: object) -> object:
        if isinstance(v, str):
            return v.replace("-S.jpg", "-L.jpg").replace("-M.jpg", "-L.jpg")
        return v


class BookDetailResponse(BookResponse):
    my_reading: "ReadingEmbedded | None" = None


class ReadingEmbedded(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    status: str
    rating: int | None


BookDetailResponse.model_rebuild()
