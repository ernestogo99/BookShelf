import { Review, ReviewCreate, ReviewUpdate } from '@/types/api';

import { api } from './client';

/** POST /reviews/ — cria resenha. 409 se já existir uma para o livro. */
export async function createReview(body: ReviewCreate): Promise<Review> {
  const { data } = await api.post<Review>('/reviews/', body);
  return data;
}

/** PATCH /reviews/{id} — edita resenha. */
export async function updateReview(reviewId: string, body: ReviewUpdate): Promise<Review> {
  const { data } = await api.patch<Review>(`/reviews/${reviewId}`, body);
  return data;
}

/** DELETE /reviews/{id}. */
export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}
