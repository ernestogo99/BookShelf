"""
Popula o banco com dados de teste.

Uso:
    uv run python seed.py           # insere dados (idempotente)
    uv run python seed.py --clean   # limpa tudo antes de inserir
"""

import argparse
import uuid
from decimal import Decimal

from sqlalchemy import text

from app.database import SessionLocal
from app.models.book import Book
from app.models.list_ import List, ListBook
from app.models.reading import Reading
from app.models.review import Review
from app.models.user import User
from app.services.auth_service import pwd_context

# ---------------------------------------------------------------------------
# Dados
# ---------------------------------------------------------------------------

USERS = [
    {
        "username": "ana_leitora",
        "email": "ana@example.com",
        "password": "senha123",
        "name": "Ana Silva",
        "bio": "Apaixonada por ficção científica e fantasia.",
        "avatar_url": None,
    },
    {
        "username": "carlos_pages",
        "email": "carlos@example.com",
        "password": "senha123",
        "name": "Carlos Mendes",
        "bio": "Leitor ávido de clássicos e história.",
        "avatar_url": None,
    },
    {
        "username": "julia_books",
        "email": "julia@example.com",
        "password": "senha123",
        "name": "Júlia Rocha",
        "bio": None,
        "avatar_url": None,
    },
]

BOOKS = [
    {
        "ol_key": "/works/OL27482W",
        "title": "Duna",
        "authors": ["Frank Herbert"],
        "publisher": "Aleph",
        "published_year": 1965,
        "pages": 680,
        "synopsis": (
            "Em um futuro distante, o jovem Paul Atreides chega ao planeta desértico Arrakis, "
            "único lugar no universo onde é encontrada a especiaria, a substância mais valiosa "
            "da galáxia. Uma épica jornada de traição, sobrevivência e profecia."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8231480-L.jpg",
        "genres": ["Ficção Científica", "Aventura", "Épico"],
    },
    {
        "ol_key": "/works/OL45804W",
        "title": "O Senhor dos Anéis: A Sociedade do Anel",
        "authors": ["J.R.R. Tolkien"],
        "publisher": "Martins Fontes",
        "published_year": 1954,
        "pages": 576,
        "synopsis": (
            "O hobbit Frodo Bolseiro herda um anel mágico de seu tio Bilbo e descobre que "
            "se trata do Um Anel criado pelo Senhor das Trevas Sauron. Uma grande jornada "
            "tem início para destruí-lo nas chamas da Montanha da Perdição."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8406786-L.jpg",
        "genres": ["Fantasia", "Aventura", "Épico"],
    },
    {
        "ol_key": "/works/OL262474W",
        "title": "1984",
        "authors": ["George Orwell"],
        "publisher": "Companhia das Letras",
        "published_year": 1949,
        "pages": 336,
        "synopsis": (
            "Em um futuro distópico, Winston Smith vive sob o regime totalitário do Partido, "
            "liderado pelo misterioso Grande Irmão. Uma história sobre vigilância, controle "
            "e a resistência do espírito humano."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8575708-L.jpg",
        "genres": ["Distopia", "Ficção Científica", "Clássico"],
    },
    {
        "ol_key": "/works/OL98143W",
        "title": "Cem Anos de Solidão",
        "authors": ["Gabriel García Márquez"],
        "publisher": "Record",
        "published_year": 1967,
        "pages": 448,
        "synopsis": (
            "A saga da família Buendía ao longo de sete gerações na cidade fictícia de Macondo, "
            "obra-prima do realismo mágico latino-americano."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8231476-L.jpg",
        "genres": ["Realismo Mágico", "Clássico", "Literatura Latino-Americana"],
    },
    {
        "ol_key": "/works/OL17860744W",
        "title": "Sapiens: Uma Breve História da Humanidade",
        "authors": ["Yuval Noah Harari"],
        "publisher": "L&PM",
        "published_year": 2011,
        "pages": 464,
        "synopsis": (
            "Uma narrativa abrangente da história da espécie humana, desde a pré-história "
            "até o presente, explorando como o Homo Sapiens dominou o planeta."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8739161-L.jpg",
        "genres": ["Não-Ficção", "História", "Ciência"],
    },
    {
        "ol_key": "/works/OL25788W",
        "title": "O Guia do Mochileiro das Galáxias",
        "authors": ["Douglas Adams"],
        "publisher": "Arqueiro",
        "published_year": 1979,
        "pages": 224,
        "synopsis": (
            "Arthur Dent tem um dia muito ruim: primeiro a sua casa é demolida, depois a Terra. "
            "Felizmente seu amigo Ford Prefect é um alien que trabalha para o Guia do Mochileiro "
            "das Galáxias, e os dois escapam pela galáxia afora."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8302039-L.jpg",
        "genres": ["Ficção Científica", "Comédia", "Aventura"],
    },
    {
        "ol_key": "/works/OL5735778W",
        "title": "A Revolução dos Bichos",
        "authors": ["George Orwell"],
        "publisher": "Companhia das Letras",
        "published_year": 1945,
        "pages": 152,
        "synopsis": (
            "Em uma fazenda, os animais se rebelam contra seus donos humanos sob a liderança "
            "dos porcos. Uma fábula política sobre poder, corrupção e igualdade."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8314866-L.jpg",
        "genres": ["Clássico", "Sátira Política", "Fábula"],
    },
    {
        "ol_key": "/works/OL11975A",
        "title": "Dom Casmurro",
        "authors": ["Machado de Assis"],
        "publisher": "Martin Claret",
        "published_year": 1899,
        "pages": 256,
        "synopsis": (
            "Bentinho, narrador não-confiável, conta sua história de amor com Capitu e a "
            "suspeita de traição que o consumiu. Um dos maiores romances da literatura brasileira."
        ),
        "cover_url": "https://covers.openlibrary.org/b/id/8371476-L.jpg",
        "genres": ["Clássico", "Literatura Brasileira", "Romance"],
    },
]

# (username, ol_key, status, rating)
READINGS = [
    ("ana_leitora",  "/works/OL27482W",    "read",         5),
    ("ana_leitora",  "/works/OL45804W",    "read",         5),
    ("ana_leitora",  "/works/OL262474W",   "read",         4),
    ("ana_leitora",  "/works/OL25788W",    "read",         5),
    ("ana_leitora",  "/works/OL98143W",    "reading",      None),
    ("ana_leitora",  "/works/OL17860744W", "want_to_read", None),
    ("carlos_pages", "/works/OL98143W",    "read",         5),
    ("carlos_pages", "/works/OL262474W",   "read",         5),
    ("carlos_pages", "/works/OL11975A",    "read",         4),
    ("carlos_pages", "/works/OL5735778W",  "read",         4),
    ("carlos_pages", "/works/OL27482W",    "want_to_read", None),
    ("julia_books",  "/works/OL45804W",    "read",         4),
    ("julia_books",  "/works/OL27482W",    "read",         4),
    ("julia_books",  "/works/OL25788W",    "reading",      None),
    ("julia_books",  "/works/OL17860744W", "read",         3),
]

# (username, ol_key, content, has_spoiler)
REVIEWS = [
    (
        "ana_leitora",
        "/works/OL27482W",
        "Uma obra-prima absoluta da ficção científica. A construção do mundo de Arrakis é "
        "incrível — política, religião, ecologia tudo entrelaçado de forma genial. "
        "Releitura obrigatória a cada poucos anos.",
        False,
    ),
    (
        "ana_leitora",
        "/works/OL45804W",
        "Tolkien criou uma mitologia inteira. A jornada de Frodo é ao mesmo tempo épica e "
        "profundamente humana. A Sociedade do Anel é o início perfeito de uma trilogia monumental.",
        False,
    ),
    (
        "ana_leitora",
        "/works/OL262474W",
        "Perturbadoramente relevante hoje. Orwell escreveu isso em 1949 e parece que estava "
        "descrevendo o século XXI. Leitura obrigatória, ainda que sombria.",
        False,
    ),
    (
        "ana_leitora",
        "/works/OL25788W",
        "A resposta para a vida, o universo e tudo mais é 42. Mas a pergunta real é: como "
        "Adams conseguiu ser tão absurdo e ao mesmo tempo tão preciso sobre a existência humana?",
        False,
    ),
    (
        "carlos_pages",
        "/works/OL98143W",
        "García Márquez criou algo que não tem paralelo na literatura mundial. Cada página é "
        "uma revelação. O realismo mágico aqui não é artifício — é a única linguagem que faz "
        "sentido para contar essa história.",
        False,
    ),
    (
        "carlos_pages",
        "/works/OL262474W",
        "Grande Irmão está assistindo. O newspeak, o doublethink — conceitos que saíram do livro "
        "e entraram no vocabulário político global. Assustador e essencial.",
        False,
    ),
    (
        "carlos_pages",
        "/works/OL11975A",
        "Capitu traiu ou não? A genialidade de Machado está em fazer essa dúvida impossível de "
        "resolver. O narrador não-confiável elevado à sua máxima potência na literatura brasileira.",
        True,
    ),
    (
        "carlos_pages",
        "/works/OL5735778W",
        "Curtíssimo e devastador. Todos os animais são iguais, mas alguns são mais iguais que "
        "outros. Em menos de 200 páginas Orwell desmonta qualquer utopia autoritária.",
        False,
    ),
    (
        "julia_books",
        "/works/OL45804W",
        "Minha primeira leitura de fantasia épica e entendo agora por que tudo se compara a "
        "Tolkien. A criação de idiomas, culturas e histórias inteiras é de tirar o fôlego.",
        False,
    ),
    (
        "julia_books",
        "/works/OL27482W",
        "Demorei para entrar, mas depois das 100 primeiras páginas não consegui parar. "
        "A política das casas, a importância da especiaria — tudo faz um sentido absurdo.",
        False,
    ),
    (
        "julia_books",
        "/works/OL17860744W",
        "Fascinante como perspectiva macro da humanidade. Alguns argumentos são simplificados "
        "demais, mas como introdução ao pensamento histórico é excelente.",
        False,
    ),
]

# (username, title, description, [ol_keys])
LISTS = [
    (
        "ana_leitora",
        "Ficção Científica Essencial",
        "Os melhores que já li no gênero",
        ["/works/OL27482W", "/works/OL262474W", "/works/OL25788W"],
    ),
    (
        "ana_leitora",
        "Próximas Leituras",
        "Fila para 2025",
        ["/works/OL17860744W", "/works/OL98143W"],
    ),
    (
        "carlos_pages",
        "Clássicos Indispensáveis",
        "Literatura que todo mundo deveria ler",
        ["/works/OL98143W", "/works/OL262474W", "/works/OL11975A", "/works/OL5735778W"],
    ),
    (
        "julia_books",
        "Fantasia & Aventura",
        None,
        ["/works/OL45804W", "/works/OL27482W"],
    ),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _recalculate_ratings(db, book_id: uuid.UUID) -> None:
    from sqlalchemy import func, select

    result = db.execute(
        select(func.avg(Reading.rating), func.count(Reading.id)).where(
            Reading.book_id == book_id, Reading.rating.isnot(None)
        )
    ).one()
    avg, total = result
    book = db.get(Book, book_id)
    if book:
        book.avg_rating = round(float(avg), 2) if avg else 0
        book.total_ratings = total or 0


# ---------------------------------------------------------------------------
# Seed
# ---------------------------------------------------------------------------


def seed(clean: bool = False) -> None:
    db = SessionLocal()
    try:
        if clean:
            print("Limpando banco...")
            db.execute(text("DELETE FROM list_books"))
            db.execute(text("DELETE FROM lists"))
            db.execute(text("DELETE FROM reviews"))
            db.execute(text("DELETE FROM readings"))
            db.execute(text("DELETE FROM books"))
            db.execute(text("DELETE FROM users"))
            db.commit()
            print("Banco limpo.")

        # -- Users -----------------------------------------------------------
        print("Inserindo usuários...")
        user_map: dict[str, User] = {}
        for u in USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                user_map[u["username"]] = existing
                continue
            user = User(
                username=u["username"],
                email=u["email"],
                password_hash=pwd_context.hash(u["password"]),
                name=u["name"],
                bio=u["bio"],
                avatar_url=u["avatar_url"],
            )
            db.add(user)
            user_map[u["username"]] = user
        db.flush()

        # -- Books -----------------------------------------------------------
        print("Inserindo livros...")
        book_map: dict[str, Book] = {}
        for b in BOOKS:
            existing = db.query(Book).filter(Book.ol_key == b["ol_key"]).first()
            if existing:
                book_map[b["ol_key"]] = existing
                continue
            book = Book(**b)
            db.add(book)
            book_map[b["ol_key"]] = book
        db.flush()

        # -- Readings --------------------------------------------------------
        print("Inserindo leituras...")
        for username, ol_key, status, rating in READINGS:
            user = user_map[username]
            book = book_map[ol_key]
            existing = (
                db.query(Reading)
                .filter(Reading.user_id == user.id, Reading.book_id == book.id)
                .first()
            )
            if existing:
                continue
            db.add(Reading(user_id=user.id, book_id=book.id, status=status, rating=rating))
        db.flush()

        for book in book_map.values():
            _recalculate_ratings(db, book.id)
        db.flush()

        # -- Reviews ---------------------------------------------------------
        print("Inserindo resenhas...")
        for username, ol_key, content, has_spoiler in REVIEWS:
            user = user_map[username]
            book = book_map[ol_key]
            existing = (
                db.query(Review)
                .filter(Review.user_id == user.id, Review.book_id == book.id)
                .first()
            )
            if existing:
                continue
            db.add(
                Review(
                    user_id=user.id,
                    book_id=book.id,
                    content=content,
                    has_spoiler=has_spoiler,
                )
            )
        db.flush()

        # -- Lists -----------------------------------------------------------
        print("Inserindo listas...")
        for username, title, description, ol_keys in LISTS:
            user = user_map[username]
            existing = (
                db.query(List)
                .filter(List.user_id == user.id, List.title == title)
                .first()
            )
            if existing:
                continue
            lst = List(user_id=user.id, title=title, description=description)
            db.add(lst)
            db.flush()
            for pos, ol_key in enumerate(ol_keys, start=1):
                book = book_map[ol_key]
                db.add(ListBook(list_id=lst.id, book_id=book.id, position=pos))

        db.commit()

        # -- Resumo ----------------------------------------------------------
        print("\n✓ Seed concluído:")
        print(f"  {db.query(User).count()} usuários")
        print(f"  {db.query(Book).count()} livros")
        print(f"  {db.query(Reading).count()} leituras")
        print(f"  {db.query(Review).count()} resenhas")
        print(f"  {db.query(List).count()} listas")
        print()
        print("Credenciais de teste:")
        for u in USERS:
            print(f"  {u['email']}  /  {u['password']}")

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--clean", action="store_true", help="Limpa o banco antes de inserir")
    args = parser.parse_args()
    seed(clean=args.clean)
