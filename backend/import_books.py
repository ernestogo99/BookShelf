"""
Importa livros de um JSON exportado do Skoob para o banco da aplicação.

Uso:
    uv run python import_books.py books_sample.json
    uv run python import_books.py books_sample.json --batch-size 500
"""

import argparse
import json
import sys

from sqlalchemy.dialects.postgresql import insert

from app.database import SessionLocal
from app.models.book import Book


def _map(item: dict) -> dict | None:
    d = item.get("detail") or {}
    title = d.get("title") or item.get("title", "")
    if not title:
        return None

    book_id = item.get("book_id")
    ol_key = f"skoob:{book_id}" if book_id else None
    if not ol_key:
        return None

    author = d.get("author") or ""
    authors = [a.strip() for a in author.split(";") if a.strip()] if author else []

    genres_raw = (d.get("genres") or {}).get("items") or []
    genres = [g["name"] for g in genres_raw if g.get("name")][:5]

    ratings = d.get("ratings") or {}
    avg_rating = ratings.get("average_rating")
    total_ratings = ratings.get("count_ratings") or 0

    synopsis = (d.get("about") or {}).get("description") or None

    cover = d.get("cover_filename") or item.get("cover_filename") or None

    return {
        "ol_key": ol_key,
        "title": title,
        "authors": authors,
        "publisher": d.get("publisher") or item.get("publisher") or None,
        "published_year": item.get("year") or None,
        "pages": d.get("pages") or item.get("pages") or None,
        "synopsis": synopsis,
        "cover_url": cover,
        "genres": genres,
        "avg_rating": avg_rating,
        "total_ratings": total_ratings,
    }


def run(file_path: str, batch_size: int) -> None:
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("Erro: o arquivo deve ser uma lista JSON de livros.", file=sys.stderr)
        sys.exit(1)

    rows = []
    skipped = 0
    for item in data:
        mapped = _map(item)
        if mapped:
            rows.append(mapped)
        else:
            skipped += 1

    print(f"Total no arquivo : {len(data)}")
    print(f"Aproveitados     : {len(rows)}")
    print(f"Ignorados        : {skipped} (sem título ou book_id)")

    db = SessionLocal()
    try:
        inserted = 0
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            stmt = (
                insert(Book)
                .values(batch)
                .on_conflict_do_nothing(index_elements=["ol_key"])
            )
            result = db.execute(stmt)
            db.commit()
            inserted += result.rowcount
            done = min(i + batch_size, len(rows))
            print(f"  {done}/{len(rows)} processados — {inserted} inseridos até agora")
    finally:
        db.close()

    print(f"\nConcluído. {inserted} livros novos inseridos.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Importa livros do Skoob JSON para o banco.")
    parser.add_argument("file", help="Caminho para o arquivo JSON")
    parser.add_argument("--batch-size", type=int, default=500, metavar="N",
                        help="Livros por lote (padrão: 500)")
    args = parser.parse_args()
    run(args.file, args.batch_size)
