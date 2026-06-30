import uuid

from sqlalchemy import ForeignKey, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database import Base


class List(Base):
    __tablename__ = "lists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(server_default=func.now())
    updated_at: Mapped[str] = mapped_column(server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="lists")
    list_books = relationship(
        "ListBook",
        back_populates="list",
        cascade="all, delete-orphan",
        order_by="ListBook.position",
    )


class ListBook(Base):
    __tablename__ = "list_books"

    list_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lists.id", ondelete="CASCADE"), primary_key=True
    )
    book_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("books.id"), primary_key=True
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    added_at: Mapped[str] = mapped_column(server_default=func.now())

    list = relationship("List", back_populates="list_books")
    book = relationship("Book", back_populates="list_books")
