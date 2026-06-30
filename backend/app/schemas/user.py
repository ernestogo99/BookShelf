import uuid

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=100)


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    username: str
    email: str
    name: str
    bio: str | None
    avatar_url: str | None


class UserUpdateInput(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    bio: str | None = Field(default=None, max_length=150)
    avatar_url: str | None = Field(default=None, max_length=500)


class LoginInput(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileResponse(UserResponse):
    total_read: int
    total_reading: int
    total_want_to_read: int


class UserStatsResponse(BaseModel):
    total_read: int
    total_pages: int
    avg_rating_given: float | None
    books_by_month: dict[str, int]
    top_genres: list[dict]
