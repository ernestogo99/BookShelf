/**
 * Configuração central do app.
 *
 * A URL da API vem da variável de ambiente EXPO_PUBLIC_API_URL (lida pelo Expo
 * em build/start). Em celular físico, NUNCA use localhost/10.0.2.2 — use o IP
 * da máquina na rede Wi-Fi (ex.: http://192.168.0.10:8000). Veja .env.example.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

if (!process.env.EXPO_PUBLIC_API_URL) {
  // Aviso em dev: o IP da LAN precisa estar no .env para o celular enxergar a API.
  console.warn(
    '[movel] EXPO_PUBLIC_API_URL não definido — usando fallback localhost. ' +
      'Defina o IP da sua máquina no .env para testar no celular físico.',
  );
}
