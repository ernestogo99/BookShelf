# Movel — app mobile (React Native + Expo)

App Android de registro de leituras (referência visual: Letterboxd, tema escuro denso).

## Regras inegociáveis
- **Expo SDK 54** — travado, pois o Expo Go do celular é o 54. Nunca subir o SDK.
- Libs nativas SEMPRE via `npx expo install` (resolve a versão do SDK 54). `npm install` só para libs 100% JS (zustand, axios, zod, react-hook-form).
- **Nada de cor/spacing hardcoded** fora de `src/theme/*`.
- Só libs que rodam no **Expo Go** (sem dev build). Gráficos = `View` custom. Card compartilhável = `react-native-svg` + `toDataURL()` (NÃO usar `react-native-view-shot`).
- TypeScript strict, zero warnings.

## Documentação
Docs versionadas do SDK 54: https://docs.expo.dev/versions/v54.0.0/

## Estrutura
- `src/config.ts` — `API_URL` (de `EXPO_PUBLIC_API_URL`; IP da LAN no `.env`).
- `src/theme/` — colors, typography, spacing, paperTheme. Import via `@/theme`.
- `src/components/` — componentes base reutilizáveis.
- `src/screens/` — telas.
- `API_CONTRACT.md` — contrato real da API (derivado do backend; não inventar campos).

Alias de import: `@/*` → `src/*`.

## Rodar
`npx expo start` na máquina (backend em `0.0.0.0:8000`), abrir Expo Go no celular (mesma Wi-Fi), escanear QR.
