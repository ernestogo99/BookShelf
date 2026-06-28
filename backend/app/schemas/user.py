import uuid

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    username: str
    email: str
    name: str
    bio: str | None
    avatar_url: str | None


class UserUpdateInput(BaseModel):
    name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


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
