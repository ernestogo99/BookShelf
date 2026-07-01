import axios, { AxiosError } from 'axios';

import { API_URL } from '@/config';

/**
 * Instância axios central. O token e o handler de logout são injetados pelo
 * authStore (setAuthToken / setUnauthorizedHandler) para evitar import circular
 * entre client ↔ store.
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Define (ou limpa) o Bearer token usado em todas as requisições. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Registra o callback de logout disparado em respostas 401. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Extrai a mensagem `detail` do backend (ou um fallback amigável). */
export function getApiErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      // Erros de validação do FastAPI: [{ msg, loc, ... }]
      const first = detail[0] as { msg?: unknown } | undefined;
      if (first && typeof first.msg === 'string') {
        return first.msg;
      }
    }
    if (!error.response) {
      return 'Sem conexão com o servidor. Verifique a rede e o IP da API.';
    }
  }
  return fallback;
}

/** Retorna o status HTTP do erro, se houver. */
export function getApiErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}
