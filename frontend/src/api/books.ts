import { Book, Paginated, Review } from '@/types/api';

import { api } from './client';

/** GET /books/search?q= — q vazio retorna top por nota. */
export async function searchBooks(q: string): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/books/search', { params: q ? { q } : undefined });
  return data;
}

/** GET /books/{id} — inclui my_reading quando autenticado. */
export async function getBook(bookId: string): Promise<Book> {
  const { data } = await api.get<Book>(`/books/${bookId}`);
  return data;
}

/** GET /books/{id}/reviews — paginado. */
export async function getBookReviews(bookId: string, page = 1, perPage = 20): Promise<Paginated<Review>> {
  const { data } = await api.get<Paginated<Review>>(`/books/${bookId}/reviews`, {
    params: { page, per_page: perPage },
  });
  return data;
}

/** GET /discover/trending — top 10 (últimos 7 dias). */
export async function getTrending(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/discover/trending');
  return data;
}

/** GET /discover/top-rated — top 10 (>= 3 avaliações). */
export async function getTopRated(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/discover/top-rated');
  return data;
}
