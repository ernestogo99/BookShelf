/**
 * Tipos do contrato da API (derivados do backend — ver API_CONTRACT.md).
 * NÃO inventar campos: refletem exatamente os schemas Pydantic do FastAPI.
 */

export type ReadingStatus = 'want_to_read' | 'reading' | 'read';

/** Usuário base (retornado em register, autores de resenha, PATCH /users/). */
export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
};

/** Usuário com contadores (GET /users/). */
export type UserWithStats = User & {
  total_read: number;
  total_reading: number;
  total_want_to_read: number;
};

/** Leitura resumida embutida no Book (my_reading). */
export type MyReading = {
  id: string;
  status: ReadingStatus;
  rating: number | null;
};

export type Book = {
  id: string;
  ol_key: string | null;
  title: string;
  authors: string[];
  publisher: string | null;
  published_year: number | null;
  pages: number | null;
  synopsis: string | null;
  cover_url: string | null;
  genres: string[] | null;
  avg_rating: number;
  total_ratings: number;
  /** Presente quando a requisição é autenticada. */
  my_reading?: MyReading | null;
};

/** Registro de leitura completo (com livro). */
export type Reading = {
  id: string;
  status: ReadingStatus;
  rating: number | null;
  book: Book;
};

export type Review = {
  id: string;
  book_id: string;
  content: string;
  has_spoiler: boolean;
  created_at: string;
  updated_at: string;
  author: User;
};

export type ListBookItem = {
  book: Book;
  position: number;
};

export type BookList = {
  id: string;
  title: string;
  description: string | null;
  books: ListBookItem[];
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
};

export type TopGenre = {
  genre: string;
  count: number;
};

export type UserStats = {
  total_read: number;
  total_pages: number;
  avg_rating_given: number | null;
  books_by_month: Record<string, number>;
  top_genres: TopGenre[];
};

export type YearSummary = {
  total_books: number;
  total_pages: number;
  top_genre: string | null;
  top_author: string | null;
  favorite_book: { id: string; title: string; cover_url: string | null } | null;
  avg_rating: number | null;
};

// ---- Auth ----

export type AuthToken = {
  access_token: string;
  token_type: string;
};

/** POST /auth/register devolve token + user. */
export type RegisterResponse = AuthToken & {
  user: User;
};

// ---- Corpos de requisição ----

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ProfileUpdate = {
  name?: string;
  bio?: string | null;
  avatar_url?: string | null;
};

export type ReadingUpsert = {
  book_id: string;
  status: ReadingStatus;
  rating?: number | null;
};

export type ReviewCreate = {
  book_id: string;
  content: string;
  has_spoiler?: boolean;
};

export type ReviewUpdate = {
  content?: string;
  has_spoiler?: boolean;
};

export type ListCreate = {
  title: string;
  description?: string | null;
};

export type ListUpdate = {
  title?: string;
  description?: string | null;
};

export type ReorderRequest = {
  items: { book_id: string; position: number }[];
};
