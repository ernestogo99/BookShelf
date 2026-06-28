import uuid

from sqlalchemy import ARRAY, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ol_key: Mapped[str | None] = mapped_column(String(50), unique=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    authors: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, default=list)
    publisher: Mapped[str | None] = mapped_column(String(200))
    published_year: Mapped[int | None] = mapped_column(Integer)
    pages: Mapped[int | None] = mapped_column(Integer)
    synopsis: Mapped[str | None] = mapped_column(Text)
    cover_url: Mapped[str | None] = mapped_column(String(500))
    genres: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    avg_rating: Mapped[float] = mapped_column(Numeric(3, 2), server_default="0")
    total_ratings: Mapped[int] = mapped_column(Integer, server_default="0")
    created_at: Mapped[str] = mapped_column(server_default=func.now())

    readings = relationship("Reading", back_populates="book")
    reviews = relationship("Review", back_populates="book")
    list_books = relationship("ListBook", back_populates="book")
