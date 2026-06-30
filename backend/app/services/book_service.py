import re
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.book import Book
from backend.app.models.reading import Reading
from backend.app.schemas.book import BookDetailResponse, ReadingEmbedded
from backend.app.services import openlibrary

# Remove sufixos entre parênteses no final do título:
# "Duna (eBook)" → "duna"
# "Duna (Crônicas de Duna #1)" → "duna"
# "1984 (Clássicos da literatura mundial)" → "1984"
_PAREN_SUFFIX = re.compile(r"\s*\([^)]*\)\s*$")

# Tokeniza apenas caracteres de palavra (ignora pontuação/acentos especiais).
_WORD = re.compile(r"\w+", re.UNICODE)

# Limiar de word_similarity (trigram) para tolerância a erros de digitação.
_WORD_SIM_THRESHOLD = 0.5

# Comprimento mínimo da busca para acionar o fallback da Open Library.
_OL_FALLBACK_MIN_LEN = 3


def _row_to_schema(book: Book, user_reading: Reading | None = None) -> BookDetailResponse:
    reading_embed = None
    if user_reading:
        reading_embed = ReadingEmbedded(
            id=user_reading.id, status=user_reading.status, rating=user_reading.rating
        )
    return BookDetailResponse(
        id=book.id,
        ol_key=book.ol_key,
        title=book.title,
        authors=book.authors or [],
        publisher=book.publisher,
        published_year=book.published_year,
        pages=book.pages,
        synopsis=book.synopsis,
        cover_url=book.cover_url,
        genres=book.genres,
        avg_rating=float(book.avg_rating or 0),
        total_ratings=book.total_ratings or 0,
        my_reading=reading_embed,
    )


def _dedup_key(title: str) -> str:
    """Título normalizado usado como chave de dedup — ignora sufixos de edição."""
    return _PAREN_SUFFIX.sub("", title).strip().lower()


def _dedup(books: list[Book], limit: int) -> list[Book]:
    seen: set[str] = set()
    out: list[Book] = []
    for book in books:
        key = _dedup_key(book.title)
        if key not in seen:
            seen.add(key)
            out.append(book)
        if len(out) == limit:
            break
    return out


def _prefix_tsquery(query: str) -> str | None:
    """Converte a busca em tsquery com prefixo: "harr pott" → "harr:* & pott:*".

    Tokeniza só em caracteres de palavra, evitando erros de sintaxe do ``to_tsquery``
    com caracteres especiais (``& | ! : '`` etc.). O sufixo ``:*`` casa palavras
    parciais — essencial para a busca em tempo real enquanto o usuário digita.
    """
    tokens = _WORD.findall(query.lower())
    if not tokens:
        return None
    return " & ".join(f"{t}:*" for t in tokens)


def _search_local(db: Session, query: str) -> list[Book]:
    """Busca no catálogo local combinando full-text com prefixo e trigram (typo).

    - ``to_tsquery`` com ``:*`` casa palavras parciais em título, autores e sinopse.
    - ``word_similarity`` compara a busca com o melhor trecho do título, tolerando
      erros de digitação e casando termos curtos dentro de títulos longos.
    """
    word_sim = func.word_similarity(query, Book.title)
    conditions = [word_sim >= _WORD_SIM_THRESHOLD]
    score = word_sim

    tsq_str = _prefix_tsquery(query)
    if tsq_str:
        fts = func.to_tsquery("portuguese", tsq_str)
        conditions.insert(0, Book.search_vector.op("@@")(fts))
        score = func.coalesce(func.ts_rank(Book.search_vector, fts), 0.0) + word_sim

    candidates = (
        db.query(Book)
        .filter(or_(*conditions))
        .order_by(score.desc(), Book.total_ratings.desc())
        .limit(60)
        .all()
    )
    return _dedup(candidates, 20)


def search(
    db: Session, query: str | None = None, current_user_id: uuid.UUID | None = None
) -> list[BookDetailResponse]:
    if not query:
        books = db.query(Book).order_by(Book.total_ratings.desc()).limit(10).all()
    else:
        books = _search_local(db, query)
        # Catálogo local não cobriu a busca → recorre à Open Library e persiste.
        if (
            not books
            and settings.OPENLIBRARY_ENABLED
            and len(query.strip()) >= _OL_FALLBACK_MIN_LEN
        ):
            books = openlibrary.search_and_persist(db, query)

    readings_map = {}
    if current_user_id and books:
        ids = [b.id for b in books]
        readings = (
            db.query(Reading)
            .filter(Reading.user_id == current_user_id, Reading.book_id.in_(ids))
            .all()
        )
        readings_map = {r.book_id: r for r in readings}

    return [_row_to_schema(b, readings_map.get(b.id)) for b in books]


def get_by_id(
    db: Session, book_id: uuid.UUID, current_user_id: uuid.UUID | None = None
) -> BookDetailResponse:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")

    reading = None
    if current_user_id:
        reading = (
            db.query(Reading)
            .filter(Reading.user_id == current_user_id, Reading.book_id == book_id)
            .first()
        )
    return _row_to_schema(book, reading)
