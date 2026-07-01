# Movel API Contract (derived from backend code — do not invent fields)

Server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`. JWT Bearer (HS256, 30d). CORS `*`.
All IDs are UUID strings. Timestamps ISO-8601 strings. Pagination envelope: `{items, total, page, per_page, has_next}`.
Status enum (exact): `want_to_read` | `reading` | `read`. Rating 1–5 int, only when status=`read`.

## Auth
- `POST /auth/register` 201 → `{access_token, token_type, user:{id,username,email,name,bio,avatar_url}}`.
  Body: `{username(3–50), email, password(6–128), name(1–100)}`. 409 email/username taken (`detail`).
- `POST /auth/login` 200 → `{access_token, token_type}` (NO user). Body JSON `{email, password}`. 401 invalid (`detail`).
  → After login MUST call `GET /users/` to load the user.

## Users (Bearer)
- `GET /users/` → `{id,username,email,name,bio,avatar_url,total_read,total_reading,total_want_to_read}`.
- `PATCH /users/` body (all optional) `{name(1–100), bio(≤150), avatar_url(≤500)}` → user (no totals).
- `GET /users/stats` → `{total_read, total_pages, avg_rating_given|null, books_by_month:{"YYYY-MM":int}, top_genres:[{genre,count}]}`.
- `GET /users/readings?status=&page=1&per_page=20` → paginated Reading items `{id,status,rating,book}`.
- `GET /users/reviews?page&per_page` → paginated Review items.
- `GET /users/lists` → `[{id,title,description,books:[{book,position}],created_at,updated_at}]`.

## Books / Discover (auth optional → adds my_reading)
Book: `{id, ol_key, title, authors[], publisher, published_year, pages, synopsis, cover_url, genres[]|null, avg_rating, total_ratings, my_reading?}`.
my_reading: `{id, status, rating|null} | null`.
- `GET /books/search?q=` → Book[] (≤20, q null/empty → top 10 by rating).
- `GET /books/{book_id}` → Book. 404 not found.
- `GET /books/{book_id}/reviews?page&per_page` → paginated Reviews.
- `GET /discover/trending` → Book[] (top 10, last 7d). NO my_reading.
- `GET /discover/top-rated` → Book[] (top 10, ≥3 ratings). NO my_reading.

## Readings (Bearer)
- `POST /readings/` 201 (UPSERT) body `{book_id, status, rating?(1–5, only if read)}` → `{id,status,rating,book}`. 404 book.
- `DELETE /readings/{reading_id}` 204. 403 not owner, 404.

## Reviews (Bearer)
Review: `{id, book_id, content, has_spoiler, created_at, updated_at, author:{id,username,email,name,bio,avatar_url}}`.
- `POST /reviews/` 201 body `{book_id, content(1–2000), has_spoiler=false}`. 409 already reviewed → fall back to PATCH.
- `PATCH /reviews/{review_id}` 200 body `{content?, has_spoiler?}`. 403/404.
- `DELETE /reviews/{review_id}` 204. 403/404.

## Lists (Bearer)
List: `{id, title, description, books:[{book, position}], created_at, updated_at}`.
- `POST /lists/` 201 body `{title(1–200), description?(≤2000)}`.
- `GET /lists/{list_id}` 200. 403/404.
- `PATCH /lists/{list_id}` body `{title?, description?}`.
- `DELETE /lists/{list_id}` 204.
- `POST /lists/{list_id}/books` 201 body `{book_id}` → full list. 409 already in list, 404.
- `DELETE /lists/{list_id}/books/{book_id}` 204.
- `PATCH /lists/{list_id}/books/reorder` 200 body `{items:[{book_id, position}]}` → full list.
  position sequential starting at 1; ALL books must be included. 400 if book_id not in list.

## Stats (Bearer)
- `GET /stats/year-summary?year=YYYY` → `{total_books, total_pages, top_genre|null, top_author|null, favorite_book:{id,title,cover_url}|null, avg_rating|null}`.
  400 if <3 books read that year (`detail` = "Você precisa de pelo menos 3 livros lidos para gerar o resumo").

## Health
- `GET /` → `{status:"ok"}`.
