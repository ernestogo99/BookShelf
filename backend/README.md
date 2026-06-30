# BookShelf — Backend API

API REST do aplicativo mobile **Movel**, um registro pessoal de leituras desenvolvido como projeto acadêmico de desenvolvimento mobile.

---

## Sumário

- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Setup rápido](#setup-rápido)
- [Rodando com Docker](#rodando-com-docker)
- [Rodando localmente](#rodando-localmente)
- [Populando o banco](#populando-o-banco)
- [Testes](#testes)
- [Arquitetura do sistema](#arquitetura-do-sistema)
- [Banco de dados](#banco-de-dados)
- [Endpoints](#endpoints)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | Python 3.13 |
| Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 (síncrono) |
| Banco de dados | PostgreSQL 15 |
| Migrações | Alembic 1.14 |
| Autenticação | JWT via `python-jose` |
| Hash de senha | `passlib[bcrypt]` |
| Validação | Pydantic v2 |
| Configuração | `pydantic-settings` |
| Gerenciador de deps | `uv` |
| Linter / Formatter | `ruff` |
| Testes | `pytest` |

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/)
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — apenas para rodar localmente

---

## Setup rápido

Um único script sobe o servidor, importa o catálogo de livros e gera usuários com dados falsos para demonstração.

```bash
# Dê permissão de execução (apenas na primeira vez)
chmod +x setup.sh

# Padrão: usa books_sample.json + 15 usuários falsos
./setup.sh

# Com catálogo customizado
./setup.sh livros.json

# Com número diferente de usuários
./setup.sh livros.json --users 30

# Derruba tudo (volumes incluídos), reconstrói e repovoa
./setup.sh --clean
```

> Na primeira execução sem `.env`, o script cria o arquivo a partir de `.env.example` e encerra. Edite `.env` definindo `SECRET_KEY` e execute novamente.

O script executa automaticamente:
1. `uv sync` — instala as dependências locais
2. `docker compose up -d --build` — sobe banco + API
3. Aguarda a API responder em `http://localhost:8000`
4. `import_books.py` — importa o catálogo JSON localmente (se fornecido)
5. `fake_data.py` — gera usuários, leituras, resenhas e listas localmente

Os scripts de dados rodam **fora do container**, conectando ao banco via porta `5432` exposta pelo Docker Compose.

Após concluir, acesse a documentação interativa em **http://localhost:8000/docs**.

---

## Rodando com Docker

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e defina uma `SECRET_KEY` forte:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookapp
SECRET_KEY=sua-chave-secreta-aqui-minimo-32-caracteres
ACCESS_TOKEN_EXPIRE_DAYS=30
```

> `SECRET_KEY` é obrigatória — a API recusa iniciar se estiver ausente.

### 2. Suba os containers

```bash
docker compose up -d
```

Isso irá:
1. Subir o PostgreSQL 15 com volume persistente
2. Aguardar o banco ficar saudável (`healthcheck`)
3. Executar `alembic upgrade head` (cria as tabelas automaticamente)
4. Iniciar o servidor na porta `8000`

### Comandos úteis

```bash
docker compose up -d          # sobe em background
docker compose down           # para os containers (dados persistem)
docker compose down -v        # para e apaga o volume do banco
docker compose logs -f api    # acompanha logs da API
docker compose restart api    # reinicia apenas a API
```

---

## Rodando localmente

### 1. Configure o ambiente

```bash
uv sync --all-extras
cp .env.example .env
```

O `.env` deve apontar para um PostgreSQL local:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookapp
SECRET_KEY=sua-chave-secreta-aqui-minimo-32-caracteres
ACCESS_TOKEN_EXPIRE_DAYS=30
```

### 2. Crie o banco e aplique as migrações

```bash
createdb bookapp
uv run alembic upgrade head
```

### 3. Inicie o servidor

```bash
uv run uvicorn app.main:app --reload
```

O servidor estará disponível em **http://localhost:8000**.

---

## Populando o banco

### Importação de catálogo (livros reais)

O script `import_books.py` importa livros a partir de um arquivo JSON exportado do **Skoob**. A importação é idempotente — pode ser executada várias vezes sem duplicar registros.

**Com Docker:**

```bash
docker cp seu_arquivo.json backend-api-1:/app/livros.json
docker exec backend-api-1 python import_books.py livros.json
```

**Localmente:**

```bash
uv run python import_books.py seu_arquivo.json
```

**Opções:**

```bash
python import_books.py livros.json --batch-size 1000  # lote maior (padrão: 500)
```

**Formato esperado** — lista JSON com objetos no formato Skoob:

```json
[
  {
    "book_id": 15354,
    "title": "Curveball",
    "year": 2008,
    "pages": 272,
    "publisher": "Novo Conceito",
    "cover_filename": "https://...",
    "detail": {
      "author": "Bob Drogin",
      "about": { "description": "Sinopse..." },
      "genres": { "items": [{ "name": "Não-ficção" }] },
      "ratings": { "average_rating": 3.8, "count_ratings": 32 }
    }
  }
]
```

| Campo Skoob | Campo no banco |
|-------------|----------------|
| `detail.title` | `title` |
| `detail.author` | `authors` (lista) |
| `detail.publisher` | `publisher` |
| `year` | `published_year` |
| `detail.pages` | `pages` |
| `detail.about.description` | `synopsis` |
| `cover_filename` | `cover_url` |
| `detail.genres.items[].name` | `genres` |
| `detail.ratings.average_rating` | `avg_rating` |
| `detail.ratings.count_ratings` | `total_ratings` |

Os livros importados recebem `ol_key` no formato `skoob:{book_id}`.

---

### Dados falsos (usuários e atividade)

O script `fake_data.py` gera usuários com nomes brasileiros realistas (via Faker `pt_BR`) e popula leituras, resenhas e listas a partir dos livros já existentes no banco.

**Com Docker:**

```bash
docker exec backend-api-1 python fake_data.py --users 15
```

**Localmente:**

```bash
uv run python fake_data.py --users 15
```

**Opções:**

```bash
python fake_data.py                    # 15 usuários (padrão)
python fake_data.py --users 50         # 50 usuários
python fake_data.py --users 20 --clean # remove usuários falsos existentes e recria
```

Por usuário gerado:

| Recurso | Quantidade |
|---------|-----------|
| Leituras | 8–40 livros aleatórios |
| Resenhas | ~60% dos livros lidos |
| Listas | 1–3 listas com 3–10 livros |

A senha de todos os usuários falsos é `senha123`.

---

### Seed de desenvolvimento

O script `seed.py` insere um conjunto fixo e pequeno de dados para desenvolvimento:

```bash
uv run python seed.py           # insere (idempotente)
uv run python seed.py --clean   # limpa e reinsere
```

| Recurso | Qtd |
|---------|-----|
| Usuários | 3 (ana, carlos, julia) |
| Livros | 8 |
| Leituras | 15 |
| Resenhas | 11 |
| Listas | 4 |

Credenciais: `ana@example.com`, `carlos@example.com`, `julia@example.com` — senha `senha123`.

---

## Testes

```bash
# Requer um banco de teste: createdb bookapp_test
uv run pytest tests/

# Um módulo específico
uv run pytest tests/test_auth.py -v
```

---

## Arquitetura do sistema

```
┌─────────────────────────────────────────────────────┐
│                  App Mobile (React Native)           │
│                  Android — Expo                      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / JSON
                       ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                   │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │ Routers  │──▶│ Services │──▶│     Models      │  │
│  │          │   │          │   │  (SQLAlchemy)   │  │
│  └──────────┘   └──────────┘   └────────┬────────┘  │
│                                         │            │
│                      ┌──────────────────┘            │
│                      ▼                               │
│             ┌────────────────┐                       │
│             │  PostgreSQL 15 │                       │
│             └────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

### Estrutura de pastas

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, registro de routers
│   ├── config.py            # Variáveis de ambiente (pydantic-settings)
│   ├── database.py          # Engine, SessionLocal, Base declarativa
│   ├── dependencies.py      # get_current_user, get_optional_current_user
│   │
│   ├── models/              # Tabelas SQLAlchemy (mapeamento do banco)
│   │   ├── user.py
│   │   ├── book.py
│   │   ├── reading.py
│   │   ├── review.py
│   │   └── list_.py         # List + ListBook (N:N com posição)
│   │
│   ├── schemas/             # Contratos Pydantic (request / response)
│   │   ├── common.py        # PaginatedResponse[T] genérico
│   │   ├── user.py
│   │   ├── book.py
│   │   ├── reading.py
│   │   ├── review.py
│   │   └── list_.py
│   │
│   ├── routers/             # Camada HTTP — recebe, delega, responde
│   │   ├── auth.py          # POST /auth/register|login
│   │   ├── users.py         # GET|PATCH /users/ + /stats|readings|reviews|lists
│   │   ├── books.py         # GET /books/search|{id}|{id}/reviews
│   │   ├── readings.py      # POST|DELETE /readings/
│   │   ├── reviews.py       # POST|PATCH|DELETE /reviews/
│   │   ├── lists.py         # CRUD /lists/ + gestão de livros na lista
│   │   ├── discover.py      # GET /discover/trending|top-rated
│   │   └── stats.py         # GET /stats/year-summary
│   │
│   └── services/            # Lógica de negócio — única fonte de verdade
│       ├── auth_service.py
│       ├── book_service.py  # Busca full-text + trigram no banco local
│       ├── reading_service.py
│       ├── review_service.py
│       ├── list_service.py
│       ├── user_service.py
│       └── stats_service.py
│
├── alembic/                 # Migrações de banco
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_readings.py
│   └── test_reviews.py
│
├── setup.sh                 # Setup completo em um comando
├── import_books.py          # Importa catálogo de livros (formato Skoob)
├── fake_data.py             # Gera usuários e atividade falsos
├── seed.py                  # Dados fixos de desenvolvimento
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── .env.example
```

### Padrão de camadas

```
Request HTTP
    │
    ▼
Router          — valida tipos, extrai dependências, chama service
    │
    ▼
Service         — lógica de negócio, regras, consultas ao banco
    │
    ▼
Model           — mapeamento da tabela, sem métodos de negócio
    │
    ▼
PostgreSQL
```

> Routers nunca acessam o banco diretamente. Services nunca conhecem `Request`/`Response`.

### Autenticação

```
POST /auth/login
    │
    ├── verifica e-mail + bcrypt hash
    ├── gera JWT (HS256, sub=user_id, exp=30 dias)
    └── retorna { access_token, token_type }

Endpoints autenticados:
    Authorization: Bearer <token>
        │
        ▼
    get_current_user()  →  decodifica JWT  →  db.get(User, uuid)
```

Endpoints de leitura pública (`GET /books/search`, `GET /books/{id}`, `GET /books/{id}/reviews`) aceitam requisições sem token.

### Busca de livros

```
GET /books/search?q=<query>
    │
    ├── Full-text search: search_vector @@ plainto_tsquery('portuguese', query)
    ├── Fallback:         title ILIKE '%query%'  (acelerado por índice GIN trigram)
    ├── Ordenação:        similarity(title, query) + ts_rank
    └── Dedup:            remove edições duplicadas da mesma obra
```

O campo `search_vector` é um `tsvector` com stemming em português mantido por trigger automático — atualiza sempre que `title`, `authors` ou `synopsis` mudam.

### Cache de avaliações

O campo `avg_rating` e `total_ratings` em `books` são caches atualizados de forma síncrona sempre que uma leitura com `rating` é criada, atualizada ou removida.

---

## Banco de dados

### Diagrama de entidades

```
users
├── id (PK, UUID)
├── username (UNIQUE)
├── email (UNIQUE)
├── password_hash
├── name, bio, avatar_url
└── created_at

books
├── id (PK, UUID)
├── ol_key (UNIQUE) ── identificador da fonte (ex: "skoob:15354")
├── title, authors[], publisher
├── published_year, pages, synopsis, cover_url, genres[]
├── avg_rating, total_ratings ── cache calculado
├── search_vector (TSVECTOR) ── índice full-text, mantido por trigger
└── created_at

readings
├── id (PK, UUID)
├── user_id (FK → users)
├── book_id (FK → books)
├── status: 'read' | 'reading' | 'want_to_read'
├── rating: 1–5 (nullable)
├── created_at, updated_at
└── UNIQUE (user_id, book_id)

reviews
├── id (PK, UUID)
├── user_id (FK → users)
├── book_id (FK → books)
├── content, has_spoiler
├── created_at, updated_at
└── UNIQUE (user_id, book_id)

lists
├── id (PK, UUID)
├── user_id (FK → users)
├── title, description
└── created_at, updated_at

list_books
├── list_id (FK → lists)  ┐
├── book_id (FK → books)  ┘ PK composta
├── position (ordem manual)
└── added_at
```

### Índices

| Índice | Tipo | Finalidade |
|--------|------|-----------|
| `ix_books_search_vector` | GIN (tsvector) | Full-text search com stemming |
| `ix_books_title_trgm` | GIN trigram | `ILIKE` rápido em títulos |
| `ix_books_authors` | GIN array | Filtro por autor |
| `ix_books_avg_rating` | B-tree | Ordenação em top-rated |
| `ix_reviews_book_id` | B-tree | Reviews por livro |
| `ix_lists_user_id` | B-tree | Listas por usuário |
| `ix_readings_updated_at` | B-tree | Trending (últimos 7 dias) |

---

## Endpoints

### Autenticação
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/register` | — | Cria conta e retorna token |
| POST | `/auth/login` | — | Autentica e retorna token |

### Usuário
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/users/` | ✓ | Dados do usuário logado |
| PATCH | `/users/` | ✓ | Atualiza nome, bio ou avatar |
| GET | `/users/stats` | ✓ | Estatísticas de leitura |
| GET | `/users/readings` | ✓ | Leituras com filtro `?status=` |
| GET | `/users/reviews` | ✓ | Resenhas escritas |
| GET | `/users/lists` | ✓ | Listas criadas |

### Livros
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/books/search?q=` | Opcional | Busca full-text no catálogo local |
| GET | `/books/{id}` | Opcional | Detalhe com `my_reading` |
| GET | `/books/{id}/reviews` | — | Resenhas de todos os usuários |

### Leituras
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/readings/` | ✓ | Cria ou atualiza leitura (upsert) |
| DELETE | `/readings/{id}` | ✓ | Remove leitura |

### Resenhas
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/reviews/` | ✓ | Cria resenha |
| PATCH | `/reviews/{id}` | ✓ | Atualiza (apenas o autor) |
| DELETE | `/reviews/{id}` | ✓ | Remove (apenas o autor) |

### Listas
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/lists/` | ✓ | Cria lista |
| GET | `/lists/{id}` | ✓ | Detalhe da lista |
| PATCH | `/lists/{id}` | ✓ | Atualiza título/descrição |
| DELETE | `/lists/{id}` | ✓ | Remove lista |
| POST | `/lists/{id}/books` | ✓ | Adiciona livro |
| DELETE | `/lists/{id}/books/{book_id}` | ✓ | Remove livro |
| PATCH | `/lists/{id}/books/reorder` | ✓ | Reordena livros |

### Descoberta
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/discover/trending` | — | Top 10 dos últimos 7 dias |
| GET | `/discover/top-rated` | — | Top 10 mais bem avaliados |

### Estatísticas
| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/stats/year-summary?year=` | ✓ | Resumo anual (mín. 3 livros) |
