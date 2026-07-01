from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import stats_service

router = APIRouter()


@router.get("/year-summary", response_model=dict)
def year_summary(
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return stats_service.get_year_summary(db, user_id=current_user.id, year=year)
