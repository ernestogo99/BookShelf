import { Paginated, ProfileUpdate, Reading, ReadingStatus, Review, User, UserWithStats } from '@/types/api';

import { api } from './client';

/** GET /users/ → usuário atual com contadores. */
export async function getMe(): Promise<UserWithStats> {
  const { data } = await api.get<UserWithStats>('/users/');
  return data;
}

/** PATCH /users/ → usuário atualizado (sem contadores). */
export async function updateProfile(body: ProfileUpdate): Promise<User> {
  const { data } = await api.patch<User>('/users/', body);
  return data;
}

/** GET /users/readings?status=&page=&per_page= — estante paginada. */
export async function getUserReadings(
  params: { status?: ReadingStatus; page?: number; perPage?: number } = {},
): Promise<Paginated<Reading>> {
  const { status, page = 1, perPage = 20 } = params;
  const { data } = await api.get<Paginated<Reading>>('/users/readings', {
    params: { status, page, per_page: perPage },
  });
  return data;
}

/** GET /users/reviews — resenhas do usuário (paginado). */
export async function getMyReviews(page = 1, perPage = 50): Promise<Paginated<Review>> {
  const { data } = await api.get<Paginated<Review>>('/users/reviews', {
    params: { page, per_page: perPage },
  });
  return data;
}

/**
 * Encontra a resenha do usuário para um livro (ou null).
 * Pagina /users/reviews (poucas por usuário neste app) com limite de segurança.
 */
export async function getMyReviewForBook(bookId: string): Promise<Review | null> {
  let page = 1;
  const MAX_PAGES = 20;
  while (page <= MAX_PAGES) {
    const res = await getMyReviews(page, 50);
    const found = res.items.find((r) => r.book_id === bookId);
    if (found) return found;
    if (!res.has_next) break;
    page += 1;
  }
  return null;
}
