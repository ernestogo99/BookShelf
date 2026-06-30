import uuid

from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.schemas.user import UserUpdateInput


def update(db: Session, user_id: uuid.UUID, data: UserUpdateInput) -> User:
    user = db.get(User, user_id)
    if data.name is not None:
        user.name = data.name
    if data.bio is not None:
        user.bio = data.bio
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(user)
    return user
