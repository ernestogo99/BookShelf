import { AuthToken, LoginRequest, RegisterRequest, RegisterResponse } from '@/types/api';

import { api } from './client';

/** POST /auth/register → token + user (já logado). */
export async function register(body: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/auth/register', body);
  return data;
}

/** POST /auth/login → apenas token (NÃO retorna user → chamar GET /users/ depois). */
export async function login(body: LoginRequest): Promise<AuthToken> {
  const { data } = await api.post<AuthToken>('/auth/login', body);
  return data;
}
