"""indexes and full-text search

Revision ID: b8f3a92d1e05
Revises: 387a3f7fd520
Create Date: 2026-06-28 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import TSVECTOR

revision: str = "b8f3a92d1e05"
down_revision: Union[str, None] = "387a3f7fd520"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Extensão trigram ──────────────────────────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # ── Coluna search_vector ──────────────────────────────────────────────────
    op.add_column("books", sa.Column("search_vector", TSVECTOR(), nullable=True))

    # ── Trigger que mantém search_vector atualizado automaticamente ───────────
    op.execute("""
        CREATE OR REPLACE FUNCTION books_search_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector := to_tsvector(
                'portuguese',
                coalesce(NEW.title, '') || ' ' ||
                coalesce(array_to_string(NEW.authors, ' '), '') || ' ' ||
                coalesce(NEW.synopsis, '')
            );
            RETURN NEW;
        END
        $$ LANGUAGE plpgsql
    """)

    op.execute("""
        CREATE TRIGGER books_search_vector_trigger
        BEFORE INSERT OR UPDATE OF title, authors, synopsis ON books
        FOR EACH ROW EXECUTE FUNCTION books_search_update()
    """)

    # ── Popula linhas existentes ──────────────────────────────────────────────
    op.execute("""
        UPDATE books SET search_vector = to_tsvector(
            'portuguese',
            coalesce(title, '') || ' ' ||
            coalesce(array_to_string(authors, ' '), '') || ' ' ||
            coalesce(synopsis, '')
        )
    """)

    # ── Indexes de busca textual ──────────────────────────────────────────────
    # GIN no tsvector — full-text search com stemming português
    op.execute("CREATE INDEX ix_books_search_vector ON books USING GIN(search_vector)")
    # GIN trigram no título — acelera ILIKE e busca parcial
    op.execute("CREATE INDEX ix_books_title_trgm ON books USING GIN(title gin_trgm_ops)")
    # GIN no array de autores — acelera filtragem por autor exato
    op.execute("CREATE INDEX ix_books_authors ON books USING GIN(authors)")

    # ── Indexes de FK sem cobertura ───────────────────────────────────────────
    op.create_index("ix_reviews_book_id", "reviews", ["book_id"])
    op.create_index("ix_lists_user_id", "lists", ["user_id"])

    # ── Indexes para ordenação e filtro ───────────────────────────────────────
    op.create_index("ix_books_avg_rating", "books", ["avg_rating"])
    op.create_index("ix_readings_updated_at", "readings", ["updated_at"])


def downgrade() -> None:
    op.drop_index("ix_readings_updated_at", table_name="readings")
    op.drop_index("ix_books_avg_rating", table_name="books")
    op.drop_index("ix_lists_user_id", table_name="lists")
    op.drop_index("ix_reviews_book_id", table_name="reviews")
    op.execute("DROP INDEX IF EXISTS ix_books_authors")
    op.execute("DROP INDEX IF EXISTS ix_books_title_trgm")
    op.execute("DROP INDEX IF EXISTS ix_books_search_vector")
    op.execute("DROP TRIGGER IF EXISTS books_search_vector_trigger ON books")
    op.execute("DROP FUNCTION IF EXISTS books_search_update()")
    op.drop_column("books", "search_vector")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
