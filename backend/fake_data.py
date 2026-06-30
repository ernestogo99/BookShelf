"""
Gera usuários falsos com leituras, resenhas e listas a partir dos livros já no banco.

Uso:
    uv run python fake_data.py                     # 15 usuários
    uv run python fake_data.py --users 50          # 50 usuários
    uv run python fake_data.py --users 20 --clean  # limpa dados falsos e recria
"""

import argparse
import random
import sys
import uuid

from faker import Faker
from passlib.context import CryptContext
from sqlalchemy.dialects.postgresql import insert

from backend.app.database import SessionLocal
from backend.app.models.book import Book
from backend.app.models.list_ import List, ListBook
from backend.app.models.reading import Reading
from backend.app.models.review import Review
from backend.app.models.user import User

fake = Faker("pt_BR")
Faker.seed(42)
random.seed(42)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
FAKE_PASSWORD_HASH = pwd_ctx.hash("senha123")

STATUSES = ["read", "read", "read", "reading", "want_to_read"]  # 60% read

REVIEW_TEMPLATES = [
    "Um livro incrível, recomendo muito para quem gosta do gênero.",
    "Leitura envolvente do começo ao fim. Os personagens são muito bem construídos.",
    "Superou minhas expectativas. A narrativa é fluida e o final surpreende.",
    "Obra essencial. Mudou minha perspectiva sobre o tema.",
    "Muito bom, mas achei o ritmo um pouco lento no meio.",
    "Escrita primorosa e história cativante. Com certeza vou reler.",
    "Não é para todos, mas quem curte o estilo vai adorar.",
    "Um dos melhores que li nos últimos anos. Simplesmente incrível.",
    "A tradução é excelente e preserva o estilo do autor original.",
    "História intensa e personagens complexos. Difícil de largar.",
    "Terminei em dois dias, não conseguia parar de ler.",
    "Clássico que merece ser mais conhecido no Brasil.",
    "Leitura rápida mas deixa muito para refletir.",
    "A construção do mundo é detalhada e imersiva. Recomendo.",
    "Esperava mais, mas ainda assim é uma leitura agradável.",
]

LIST_NAMES = [
    "Quero ler em {year}",
    "Meus favoritos",
    "Leituras do momento",
    "Para ler nas férias",
    "Clássicos que preciso ler",
    "Recomendados por amigos",
    "Releituras",
    "Ficção científica favorita",
    "Não ficção essencial",
    "Romance imperdíveis",
]


def _random_username(name: str, existing: set[str]) -> str:
    base = name.lower().split()[0] + str(random.randint(10, 999))
    username = base
    while username in existing:
        username = base + str(random.randint(0, 99))
    existing.add(username)
    return username


def _random_email(name: str, existing: set[str]) -> str:
    parts = name.lower().split()
    domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br"]
    base = f"{parts[0]}.{parts[-1]}{random.randint(1, 999)}@{random.choice(domains)}"
    email = base
    while email in existing:
        email = f"{parts[0]}{random.randint(100, 9999)}@{random.choice(domains)}"
    existing.add(email)
    return email


def clean(db) -> None:
    count = db.query(User).filter(User.bio.like("FAKE:%")).count()
    db.query(User).filter(User.bio.like("FAKE:%")).delete(synchronize_session=False)
    db.commit()
    print(f"  {count} usuários falsos removidos.")


def run(n_users: int, db) -> None:
    books = db.query(Book.id).all()
    if not books:
        print(
            "Erro: nenhum livro no banco. Importe livros antes de gerar dados falsos.",
            file=sys.stderr,
        )
        sys.exit(1)

    book_ids = [row[0] for row in books]
    print(f"  {len(book_ids)} livros disponíveis no banco.")

    # Carrega usernames e emails já existentes para evitar conflitos
    existing_usernames: set[str] = {r[0] for r in db.query(User.username).all()}
    existing_emails: set[str] = {r[0] for r in db.query(User.email).all()}

    for i in range(n_users):
        name = fake.name()
        username = _random_username(name, existing_usernames)
        email = _random_email(name, existing_emails)

        user = User(
            id=uuid.uuid4(),
            name=name,
            username=username,
            email=email,
            password_hash=FAKE_PASSWORD_HASH,
            bio=f"FAKE:{fake.sentence(nb_words=8)}",
            avatar_url=None,
        )
        db.add(user)
        db.flush()

        # ── Leituras ─────────────────────────────────────────────────────────
        n_readings = random.randint(8, min(40, len(book_ids)))
        chosen_books = random.sample(book_ids, n_readings)
        read_book_ids = []

        readings = []
        for book_id in chosen_books:
            status = random.choice(STATUSES)
            rating = random.randint(3, 5) if status == "read" else None
            readings.append(
                {
                    "id": uuid.uuid4(),
                    "user_id": user.id,
                    "book_id": book_id,
                    "status": status,
                    "rating": rating,
                }
            )
            if status == "read":
                read_book_ids.append((book_id, rating))

        if readings:
            db.execute(
                insert(Reading)
                .values(readings)
                .on_conflict_do_nothing(index_elements=["user_id", "book_id"])
            )

        # ── Resenhas (~60% dos livros lidos) ─────────────────────────────────
        reviews = []
        for book_id, rating in read_book_ids:
            if random.random() < 0.6:
                reviews.append(
                    {
                        "id": uuid.uuid4(),
                        "user_id": user.id,
                        "book_id": book_id,
                        "content": random.choice(REVIEW_TEMPLATES),
                        "has_spoiler": random.random() < 0.1,
                    }
                )

        if reviews:
            db.execute(
                insert(Review)
                .values(reviews)
                .on_conflict_do_nothing(index_elements=["user_id", "book_id"])
            )

        # ── Listas (1–3 por usuário) ──────────────────────────────────────────
        n_lists = random.randint(1, 3)
        list_book_pool = [bid for bid, _ in read_book_ids]

        for _ in range(n_lists):
            if not list_book_pool:
                break
            lst = List(
                id=uuid.uuid4(),
                user_id=user.id,
                title=random.choice(LIST_NAMES).format(year=random.randint(2024, 2026)),
                description=fake.sentence(nb_words=10) if random.random() < 0.5 else None,
            )
            db.add(lst)
            db.flush()

            n_books_in_list = min(random.randint(3, 10), len(list_book_pool))
            list_books = random.sample(list_book_pool, n_books_in_list)
            for pos, book_id in enumerate(list_books, start=1):
                db.add(ListBook(list_id=lst.id, book_id=book_id, position=pos))

        db.commit()
        print(f"  [{i + 1}/{n_users}] {name} — {n_readings} leituras, {len(reviews)} resenhas")

    print(f"\nConcluído. {n_users} usuários criados. Senha de todos: senha123")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gera usuários falsos com dados relacionados.")
    parser.add_argument(
        "--users", type=int, default=15, metavar="N", help="Nº de usuários (padrão: 15)"
    )
    parser.add_argument(
        "--clean", action="store_true", help="Remove usuários falsos antes de criar"
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.clean:
            print("Removendo usuários falsos existentes...")
            clean(db)
        print(f"Gerando {args.users} usuários falsos...")
        run(args.users, db)
    finally:
        db.close()
