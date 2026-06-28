# BookShelf — Backend API

API REST do aplicativo mobile **Movel**, um registro pessoal de leituras desenvolvido como projeto acadêmico de desenvolvimento mobile.

---

## Sumário

- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Rodando com Docker (recomendado)](#rodando-com-docker-recomendado)
- [Rodando localmente](#rodando-localmente)
- [Seed — dados de teste](#seed--dados-de-teste)
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
| HTTP client | `httpx` (Open Library API) |
| Configuração | `pydantic-settings` |
| Gerenciador de deps | `uv` |
| Linter / Formatter | `ruff` |
| Testes | `pytest` |

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) — para o modo Docker
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — para o modo local

---

## Rodando com Docker (recomendado)

### 1. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (`backend/`):

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

### 3. Verifique

```bash
curl http://localhost:8000/
# {"status":"ok"}
```

Documentação interativa disponível em: **http://localhost:8000/docs**

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
# Instale as dependências (incluindo dev)
uv sync --all-extras

# Copie e edite o .env
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
# Crie o banco no PostgreSQL (se ainda não existir)
createdb bookapp

# Aplique as migrações
uv run alembic upgrade head
```

### 3. Inicie o servidor

```bash
uv run uvicorn app.main:app --reload
```

O servidor estará disponível em **http://localhost:8000**.

### Linter e formatação

```bash
uv run ruff check app/ --fix
uv run ruff format app/
```

---

## Seed — dados de teste

O script `seed.py` popula o banco com usuários, livros, leituras, resenhas e listas prontos para desenvolvimento e demonstração.

```bash
# Inserir dados (idempotente — seguro de rodar múltiplas vezes)
uv run python seed.py

# Limpar o banco e reinserir do zero
uv run python seed.py --clean
```

### O que é inserido

| Recurso | Qtd | Detalhes |
|---------|-----|---------|
| Usuários | 3 | ana, carlos, julia |
| Livros | 8 | Duna, 1984, LOTR, Sapiens... |
| Leituras | 15 | Status variados (`read`, `reading`, `want_to_read`) |
| Resenhas | 11 | Conteúdo em português, algumas com spoiler |
| Listas | 4 | Temáticas com livros ordenados |

### Credenciais dos usuários de teste

| E-mail | Senha |
|--------|-------|
| ana@example.com | senha123 |
| carlos@example.com | senha123 |
| julia@example.com | senha123 |

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
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  book_service  ──▶  Open Library API (httpx) │   │
│  └──────────────────────────────────────────────┘   │
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
│       ├── book_service.py  # Busca local + fallback Open Library
│       ├── reading_service.py
│       ├── review_service.py
│       ├── list_service.py
│       ├── user_service.py
│       └── stats_service.py
│
├── alembic/                 # Migrações de banco
│   └── versions/
├── tests/
│   ├── conftest.py          # Fixtures: client, db, auth_client
│   ├── test_auth.py
│   ├── test_readings.py
│   └── test_reviews.py
│
├── seed.py                  # Script de dados de teste
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── .env.example
```

### Padrão de camadas

Cada funcionalidade percorre o mesmo fluxo:

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

Endpoints de leitura pública (`GET /books/search`, `GET /books/{id}`, `GET /books/{id}/reviews`) aceitam requisições sem token via `get_optional_current_user`.

### Integração com Open Library

```
GET /books/search?q=<query>
    │
    ├── 1. Busca local (ILIKE em title + authors)
    ├── 2. Se >= 5 resultados → retorna do banco
    └── 3. Se < 5 → GET openlibrary.org/search.json
              │
              ├── Persiste livros novos no banco
              └── Retorna banco + recém-criados
```

### Cache de avaliações

O campo `avg_rating` e `total_ratings` em `books` são caches atualizados de forma síncrona sempre que uma leitura com `rating` é criada, atualizada ou removida — sem necessidade de calcular na hora da consulta.

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
├── ol_key (UNIQUE) ── chave da Open Library
├── title, authors[], publisher
├── published_year, pages, synopsis, cover_url, genres[]
├── avg_rating, total_ratings ── cache calculado
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
| GET | `/books/search?q=` | Opcional | Busca local + Open Library |
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
