import { Reading, ReadingUpsert } from '@/types/api';

import { api } from './client';

/** POST /readings/ — upsert (cria ou atualiza a leitura do usuário). */
export async function upsertReading(body: ReadingUpsert): Promise<Reading> {
  const { data } = await api.post<Reading>('/readings/', body);
  return data;
}

/** DELETE /readings/{id} — remove a leitura. */
export async function deleteReading(readingId: string): Promise<void> {
  await api.delete(`/readings/${readingId}`);
}
