# Prompt para Agente de IA — Implementação do Backend

---

## Contexto do Projeto

Você está implementando o **backend completo** de um aplicativo mobile Android de **registro pessoal de leituras**, similar ao Letterboxd mas sem funcionalidades sociais. O app é um projeto acadêmico desenvolvido em React Native. O backend é uma API REST em Python consumida pelo app mobile.

O escopo é deliberadamente enxuto: o app permite buscar livros, registrar leituras, escrever resenhas e organizar listas pessoais. Na página de um livro, o usuário pode ver resenhas escritas por outros usuários, mas **não há feed social, seguidores, curtidas ou notificações**.

---

## Stack Obrigatória

### Runtime
- **Linguagem:** Python 3.11+
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 (modo síncrono)
- **Banco de dados:** PostgreSQL 15
- **Migrações:** Alembic
- **Autenticação:** JWT com `python-jose`
- **Hash de senha:** `passlib[bcrypt]`
- **Validação:** Pydantic v2 (já incluso no FastAPI)
- **HTTP client:** `httpx` (para chamadas à Open Library API)
- **Configuração:** `pydantic-settings` (leitura do `.env`)

### Development & Tooling
- **Gerenciador de dependências:** `uv`
- **Linter & Formatter:** `ruff`
- **Testes:** `pytest`

**Não introduza outras dependências sem justificativa explícita.**

---

## Estrutura de Pastas Obrigatória

```
app/
├── main.py
├── database.py
├── dependencies.py
├── config.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── book.py
│   ├── reading.py
│   ├── review.py
│   └── list_.py
├── schemas/
│   ├── __init__.py
│   ├── user.py
│   ├── book.py
│   ├── reading.py
│   ├── review.py
│   ├── list_.py
│   └── common.py
├── routers/
│   ├── __init__.py
│   ├── auth.py
│   ├── users.py
│   ├── books.py
│   ├── readings.py
│   ├── reviews.py
│   ├── lists.py
│   ├── discover.py
│   └── stats.py
└── services/
    ├── __init__.py
    ├── auth_service.py
    ├── book_service.py
    ├── reading_service.py
    ├── review_service.py
    ├── list_service.py
    └── stats_service.py
```

Não crie `social.py` em nenhuma pasta — a funcionalidade social não existe neste projeto.

---

## Ferramentas de Desenvolvimento

### `uv`

```bash
uv sync
uv add fastapi
uv add --dev pytest
```

### `ruff`

```bash
uv run ruff check . --fix && uv run ruff format .
```

---

## Modelagem do Banco de Dados

O banco possui **6 tabelas**. Não adicione campos ou tabelas extras sem justificativa.

### `users`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
username      VARCHAR(50)  UNIQUE NOT NULL
email         VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
name          VARCHAR(100) NOT NULL
bio           VARCHAR(150)
avatar_url    VARCHAR(500)
created_at    TIMESTAMP DEFAULT now()
```

### `books`
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
ol_key         VARCHAR(50) UNIQUE        -- chave da Open Library ex: "/works/OL45804W"
title          VARCHAR(500) NOT NULL
authors        TEXT[]        NOT NULL
publisher      VARCHAR(200)
published_year INTEGER
pages          INTEGER
synopsis       TEXT
cover_url      VARCHAR(500)
genres         TEXT[]
avg_rating     NUMERIC(3,2)  DEFAULT 0   -- cacheado, atualizado a cada avaliação
total_ratings  INTEGER       DEFAULT 0   -- cacheado
created_at     TIMESTAMP     DEFAULT now()
```

### `readings`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
book_id     UUID NOT NULL REFERENCES books(id)
status      VARCHAR(20)  NOT NULL   -- 'read' | 'reading' | 'want_to_read'
rating      SMALLINT                -- 1 a 5, NULL se sem avaliação
created_at  TIMESTAMP DEFAULT now()
updated_at  TIMESTAMP DEFAULT now()
UNIQUE (user_id, book_id)
```

### `reviews`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
book_id     UUID NOT NULL REFERENCES books(id)
content     TEXT      NOT NULL
has_spoiler BOOLEAN   DEFAULT FALSE
created_at  TIMESTAMP DEFAULT now()
updated_at  TIMESTAMP DEFAULT now()
UNIQUE (user_id, book_id)            -- um usuário, uma resenha por livro
```

> Sem `likes_count` — não há curtidas neste projeto.

### `lists`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE
title       VARCHAR(200) NOT NULL
description TEXT
created_at  TIMESTAMP DEFAULT now()
updated_at  TIMESTAMP DEFAULT now()
```

### `list_books`
```sql
list_id    UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE
book_id    UUID NOT NULL REFERENCES books(id)
position   SMALLINT NOT NULL
added_at   TIMESTAMP DEFAULT now()
PRIMARY KEY (list_id, book_id)
```

---

## Regras de Implementação

### Separação de responsabilidades

- **Router:** recebe request, chama service, retorna response. Sem lógica de negócio.
- **Service:** contém toda a lógica. Recebe `db: Session` e dados validados. Retorna objetos do modelo ou lança `HTTPException`.
- **Model:** apenas definição da tabela SQLAlchemy. Sem métodos de negócio.
- **Schema:** apenas definição Pydantic. Sem lógica.

```python
# Exemplo correto de router
@router.post("/", response_model=ReadingResponse, status_code=201)
def upsert_reading(
    data: ReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reading_service.upsert(db, user_id=current_user.id, data=data)
```

### Autenticação

- Todo endpoint autenticado usa `Depends(get_current_user)`.
- Token JWT: algoritmo `HS256`, `sub` = `str(user.id)`, expiração de 30 dias.

### Paginação

Endpoints que retornam listas usam `?page=1&per_page=20` e retornam:
```json
{ "items": [...], "total": 42, "page": 1, "per_page": 20, "has_next": true }
```

Defina `PaginatedResponse` como generic em `schemas/common.py`.

### Erros HTTP

| Situação | Status |
|---|---|
| Recurso não encontrado | 404 |
| Sem permissão (não é o dono) | 403 |
| Conflito (e-mail duplicado, resenha duplicada) | 409 |
| Dados inválidos de negócio | 400 |
| Token ausente ou inválido | 401 |

### Integridade dos dados

- Ao criar/remover `rating` → recalcular `avg_rating` e `total_ratings` em `books` **na mesma transação**.
- Toda operação multi-tabela: único `db.commit()` no final.

---

## Comportamentos Específicos

### `POST /readings` — upsert

Usar `INSERT ... ON CONFLICT (user_id, book_id) DO UPDATE` via SQLAlchemy. Não fazer SELECT + INSERT separados.

### `GET /books/search` — integração Open Library

```
1. Busca no banco local com ILIKE em título/autores
2. Se >= 5 resultados → retorna do banco
3. Se < 5 → GET https://openlibrary.org/search.json?q=<query>&limit=10
4. Para cada resultado sem ol_key existente → persiste em books
5. Retorna banco + recém-criados, sem duplicatas
```

URL da capa: `https://covers.openlibrary.org/b/id/<cover_i>-M.jpg`

### `GET /books/{id}/reviews`

Retorna resenhas de **todos os usuários** para o livro, com paginação. O campo `author` é embutido na resposta para o frontend exibir nome e avatar. Não há campo `is_liked_by_me`.

### `PATCH /lists/{id}/books/reorder`

Recebe array de `{ book_id, position }`. Valida que todos os `book_id` pertencem à lista antes de atualizar. Tudo em uma transação.

---

## O Que Não Implementar

- Login social (Google, Apple)
- Recuperação de senha por e-mail
- Notificações (push ou in-app)
- Feed de atividades
- Follow/unfollow de usuários
- Curtidas em resenhas
- Perfis públicos visitáveis (não há `GET /users/{username}` público — só `GET /users/me`)
- Upload de arquivos para o servidor
- Comentários em resenhas
- Refresh token
- Rate limiting / Redis / WebSocket / Celery
- Painel administrativo

---

## Etapas de Implementação

Execute **uma etapa por vez**. Só avance quando o checklist estiver completo.

---

### Etapa 1 — Setup do Projeto

1. Criar a estrutura de pastas completa (todos os `__init__.py` incluídos)
2. Criar `pyproject.toml`:

```toml
[build-system]
requires = ["setuptools"]
build-backend = "setuptools.build_meta"

[project]
name = "bookapp-api"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi==0.111.0",
    "uvicorn[standard]==0.29.0",
    "sqlalchemy==2.0.30",
    "alembic==1.13.1",
    "psycopg2-binary==2.9.9",
    "python-jose[cryptography]==3.3.0",
    "passlib[bcrypt]==1.7.4",
    "pydantic-settings==2.2.1",
    "httpx==0.27.0",
]

[project.optional-dependencies]
dev = [
    "pytest==8.2.0",
    "ruff==0.5.1",
]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "W", "F", "I", "C4", "UP"]
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

3. Criar `.env.example`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookapp
SECRET_KEY=troque-por-uma-chave-secreta-de-pelo-menos-32-caracteres
ACCESS_TOKEN_EXPIRE_DAYS=30
```

4. Criar `app/config.py`, `app/database.py`, `app/main.py` (com CORS), `schemas/common.py` com `PaginatedResponse`
5. Inicializar Alembic

**Checklist:**
- [ ] `uv sync` sem erro
- [ ] `uv run uvicorn app.main:app --reload` sobe sem erro
- [ ] `/docs` abre o Swagger UI
- [ ] `uv run ruff check .` sem erros

---

### Etapa 2 — Autenticação

1. Criar `app/models/user.py`, migration, aplicar
2. Criar schemas: `UserCreate`, `UserResponse`, `LoginInput`, `TokenResponse`
3. Criar `app/services/auth_service.py`: `register()`, `login()`, `create_token()`
4. Criar `app/dependencies.py` com `get_current_user`
5. Criar `app/routers/auth.py`: `POST /auth/register`, `POST /auth/login`
6. Registrar router em `main.py`
7. Criar `tests/test_auth.py` com 4 casos: register success, e-mail duplicado, login success, senha errada

**Checklist:**
- [ ] `POST /auth/register` retorna 201 com `access_token`
- [ ] E-mail duplicado retorna 409
- [ ] `POST /auth/login` com credenciais corretas retorna token
- [ ] Senha errada retorna 401
- [ ] `uv run pytest tests/test_auth.py` passa

---

### Etapa 3 — Livros e Open Library

1. Criar `app/models/book.py`, migration, aplicar
2. Criar schemas: `BookResponse`, `BookDetailResponse` (com `my_reading` opcional)
3. Criar `app/services/book_service.py`:
   - `search(db, query, current_user_id)` — busca local + Open Library (veja comportamento específico)
   - `get_by_id(db, book_id, current_user_id)` — retorna livro com `my_reading` injetado
4. Criar `app/routers/books.py`:
   - `GET /books/search?q=`
   - `GET /books/{id}`
   - `GET /books/{id}/reviews` — retorna lista vazia por ora (schemas de review ainda não existem)
5. Registrar router

**Checklist:**
- [ ] `GET /books/search?q=tolkien` retorna livros da Open Library na primeira busca
- [ ] Segunda busca retorna do banco local
- [ ] `GET /books/{id}` retorna `my_reading: null` para livro não registrado
- [ ] `uv run ruff check .` sem erros

---

### Etapa 4 — Leituras e Cache de Rating

1. Criar `app/models/reading.py`, migration, aplicar
2. Criar schemas: `ReadingCreate` (`book_id`, `status`, `rating?`), `ReadingResponse` (com `book: BookResponse`)
3. Criar `app/services/reading_service.py`:
   - `upsert(db, user_id, data)` — INSERT ON CONFLICT DO UPDATE; após upsert, chamar `_update_book_rating_cache()`
   - `delete(db, reading_id, user_id)` — valida dono (403); após deletar, recalcular cache
   - `_update_book_rating_cache(db, book_id)` — recalcula `avg_rating` e `total_ratings` a partir das leituras com rating não nulo
4. Criar `app/routers/readings.py`: `POST /readings`, `DELETE /readings/{id}`
5. Criar `tests/test_readings.py`: upsert cria, upsert atualiza, rating atualiza cache, delete recalcula cache

**Checklist:**
- [ ] `POST /readings` cria leitura
- [ ] Segundo POST no mesmo livro atualiza (não duplica)
- [ ] POST com `rating: 4` atualiza `avg_rating` do livro
- [ ] DELETE recalcula `avg_rating`
- [ ] DELETE com id de outro usuário retorna 403
- [ ] `uv run pytest tests/test_readings.py` passa

---

### Etapa 5 — Resenhas

1. Criar `app/models/review.py` (tabela `reviews` apenas — sem `review_likes`), migration, aplicar
2. Criar schemas:
   - `ReviewCreate`: `book_id`, `content`, `has_spoiler`
   - `ReviewUpdate`: `content?`, `has_spoiler?`
   - `ReviewResponse`: todos os campos + `author: UserResponse`
3. Criar `app/services/review_service.py`:
   - `create(db, user_id, data)` — valida UNIQUE user+book (409)
   - `update(db, review_id, user_id, data)` — valida autoria (403)
   - `delete(db, review_id, user_id)` — valida autoria (403)
4. Criar `app/routers/reviews.py`: `POST /reviews`, `PATCH /reviews/{id}`, `DELETE /reviews/{id}`
5. Atualizar `GET /books/{id}/reviews` para retornar `ReviewResponse` paginado (resenhas de **todos os usuários**)
6. Criar `tests/test_reviews.py`: create success, duplicate retorna 409, update de outro usuário retorna 403

**Checklist:**
- [ ] `POST /reviews` cria resenha
- [ ] Segundo POST no mesmo livro retorna 409
- [ ] `PATCH /reviews/{id}` com token de outro usuário retorna 403
- [ ] `GET /books/{id}/reviews` retorna resenhas de todos os usuários com `author` embutido
- [ ] `uv run pytest tests/test_reviews.py` passa

---

### Etapa 6 — Perfil e Estatísticas de Usuário

1. Atualizar `app/schemas/user.py` com:
   - `UserProfileResponse`: `UserResponse` + `total_read`, `total_reading`, `total_want_to_read`
   - `UserUpdateInput`: `name?`, `bio?`, `avatar_url?`
   - `UserStatsResponse`: `total_read`, `total_pages`, `avg_rating_given`, `books_by_month: dict[str, int]`, `top_genres: list[dict]`
2. Criar `app/services/stats_service.py`:
   - `get_user_stats(db, user_id)` — agrega leituras com `status='read'`. Calcula: total lido, soma de páginas dos livros, média de ratings, distribuição por mês (chave "YYYY-MM"), ranking de gêneros
3. Criar `app/routers/users.py`:
   - `GET /users/me` — retorna `UserResponse`
   - `PATCH /users/me` — atualiza nome/bio/avatar
   - `GET /users/me/stats` — delega para `stats_service`
   - `GET /users/me/readings?status=` — leituras do usuário autenticado com filtro opcional
   - `GET /users/me/reviews` — resenhas do usuário autenticado
   - `GET /users/me/lists` — listas do usuário autenticado

> Todos os endpoints de usuário são `/users/me/...` — não há perfis públicos por username.

**Checklist:**
- [ ] `GET /users/me` retorna dados do autenticado
- [ ] `PATCH /users/me` atualiza e retorna dados atualizados
- [ ] `GET /users/me/stats` retorna `books_by_month` com meses no formato "YYYY-MM"
- [ ] `GET /users/me/readings?status=read` filtra corretamente
- [ ] `uv run ruff check .` sem erros

---

### Etapa 7 — Listas

1. Criar `app/models/list_.py`, migration, aplicar
2. Criar schemas: `ListCreate`, `ListUpdate`, `ListResponse` (com `books: list[ListBookResponse]`), `ListBookResponse`, `AddBookInput`, `ReorderInput`
3. Criar `app/services/list_service.py`:
   - `create`, `get_by_id`, `update` (403 se não dono), `delete` (403), `add_book`, `remove_book`, `reorder`
   - `reorder`: valida que todos `book_id` pertencem à lista antes de atualizar; tudo em uma transação
4. Criar `app/routers/lists.py`:
   - `POST /lists`, `GET /lists/{id}`, `PATCH /lists/{id}`, `DELETE /lists/{id}`
   - `POST /lists/{id}/books`, `DELETE /lists/{id}/books/{book_id}`, `PATCH /lists/{id}/books/reorder`
5. Atualizar `GET /users/me/lists` para retornar `list[ListResponse]`

**Checklist:**
- [ ] `POST /lists` cria lista com `books: []`
- [ ] Adicionar livro → position 1; segundo livro → position 2
- [ ] Reorder com posições trocadas funciona
- [ ] Reorder com `book_id` inválido retorna 400
- [ ] DELETE de lista de outro usuário retorna 403
- [ ] `uv run ruff check .` sem erros

---

### Etapa 8 — Descoberta e Resumo Anual

1. Criar `app/routers/discover.py`:
   - `GET /discover/trending` — top 10 livros com mais readings nos últimos 7 dias
   - `GET /discover/top-rated` — `WHERE total_ratings >= 3 ORDER BY avg_rating DESC LIMIT 10`
2. Criar `app/routers/stats.py`:
   - `GET /stats/year-summary?year=` — usa usuário autenticado:
     - Filtra `readings` com `status='read'` e `updated_at` no ano solicitado
     - Retorna 400 com `{"detail": "Você precisa de pelo menos 3 livros lidos para gerar o resumo"}` se `total_books < 3`
     - Campos: `total_books`, `total_pages`, `top_genre`, `top_author`, `favorite_book` (livro com maior rating), `avg_rating`
3. Registrar ambos os routers

**Checklist:**
- [ ] `GET /discover/trending` retorna até 10 livros sem erro
- [ ] `GET /discover/top-rated` retorna somente livros com `total_ratings >= 3`
- [ ] `GET /stats/year-summary` com < 3 livros retorna 400 com mensagem
- [ ] Com 3+ livros retorna `top_genre`, `top_author` e `favorite_book` corretos
- [ ] `uv run ruff check .` sem erros

---

### Etapa 9 — Testes e Validação Final

1. Criar `tests/conftest.py` com fixtures compartilhadas (TestClient, db de teste, `auth_client`)
2. Completar todos os testes das etapas anteriores
3. Rodar o fluxo completo manualmente via Swagger UI:

```
1. POST /auth/register — criar usuário A
2. POST /auth/register — criar usuário B
3. GET /books/search?q=duna — retorna livros da Open Library
4. POST /readings — A marca "Duna" como lido com rating 5 (autenticado como A)
5. POST /reviews — A escreve resenha de "Duna"
6. GET /books/{id}/reviews — B consulta resenhas do livro (autenticado como B, vê resenha de A)
7. POST /readings — B marca "Duna" como want_to_read (autenticado como B)
8. POST /lists — A cria lista "Favoritos"
9. POST /lists/{id}/books — A adiciona "Duna"
10. GET /stats/year-summary?year=2025 — A verifica resumo
```

**Checklist final:**
- [ ] `uv run alembic upgrade head` cria as 6 tabelas sem erro
- [ ] `uv run uvicorn app.main:app --reload` inicia sem erro
- [ ] `/docs` exibe todos os endpoints organizados por tag
- [ ] Os 10 passos do fluxo manual passam sem erro 500
- [ ] `uv run pytest tests/` passa com todos os testes
- [ ] `uv run ruff check .` sem erros
- [ ] Nenhum endpoint retorna 500 para inputs válidos
