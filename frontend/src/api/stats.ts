import { UserStats, YearSummary } from '@/types/api';

import { api } from './client';

/** GET /users/stats — estatísticas pessoais. */
export async function getUserStats(): Promise<UserStats> {
  const { data } = await api.get<UserStats>('/users/stats');
  return data;
}

/** GET /stats/year-summary?year= — 400 se < 3 livros lidos no ano. */
export async function getYearSummary(year: number): Promise<YearSummary> {
  const { data } = await api.get<YearSummary>('/stats/year-summary', { params: { year } });
  return data;
}
