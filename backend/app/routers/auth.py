from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.user import LoginInput, TokenResponse, UserCreate, UserResponse
from backend.app.services import auth_service

router = APIRouter()


class RegisterResponse(TokenResponse):
    user: UserResponse


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    user, token = auth_service.register(db, data)
    return RegisterResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: LoginInput, db: Session = Depends(get_db)):
    user, token = auth_service.login(db, data.email, data.password)
    return TokenResponse(access_token=token)
