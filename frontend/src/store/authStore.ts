import { create } from 'zustand';

import * as authApi from '@/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { getMe } from '@/api/users';
import { LoginRequest, RegisterRequest, User, UserWithStats } from '@/types/api';

import { tokenStorage } from './tokenStorage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: UserWithStats | null;

  /** Lê o token do SecureStore e valida a sessão (chamar uma vez no boot). */
  bootstrap: () => Promise<void>;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  /** Recarrega o usuário (contadores) a partir de GET /users/. */
  refreshUser: () => Promise<void>;
  /** Mescla o usuário atualizado (PATCH) preservando os contadores. */
  applyUserUpdate: (updated: User) => void;
  logout: () => Promise<void>;
};

/** Aplica o token na sessão (memória + axios). */
async function persistToken(token: string): Promise<void> {
  setAuthToken(token);
  await tokenStorage.set(token);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  token: null,
  user: null,

  bootstrap: async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) {
        set({ status: 'unauthenticated', token: null, user: null });
        return;
      }
      setAuthToken(token);
      const user = await getMe();
      set({ status: 'authenticated', token, user });
    } catch {
      // Token inválido/expirado ou rede fora → trata como deslogado.
      setAuthToken(null);
      await tokenStorage.clear();
      set({ status: 'unauthenticated', token: null, user: null });
    }
  },

  login: async (body) => {
    const { access_token } = await authApi.login(body);
    await persistToken(access_token);
    // Login não retorna o usuário → buscar em GET /users/.
    const user = await getMe();
    set({ status: 'authenticated', token: access_token, user });
  },

  register: async (body) => {
    const { access_token } = await authApi.register(body);
    await persistToken(access_token);
    // register devolve o user sem contadores → buscar versão completa.
    const user = await getMe();
    set({ status: 'authenticated', token: access_token, user });
  },

  refreshUser: async () => {
    if (!get().token) return;
    const user = await getMe();
    set({ user });
  },

  applyUserUpdate: (updated) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...updated } });
  },

  logout: async () => {
    setAuthToken(null);
    await tokenStorage.clear();
    set({ status: 'unauthenticated', token: null, user: null });
  },
}));

// Em qualquer 401, encerra a sessão automaticamente.
setUnauthorizedHandler(() => {
  void useAuthStore.getState().logout();
});
