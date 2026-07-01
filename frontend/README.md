# Movel — Frontend

App mobile **Android** de registro pessoal de leituras (referência visual: Letterboxd — tema escuro, denso, capas como protagonistas). Consome a API FastAPI do diretório `../backend`.

- **React Native + Expo SDK 54** · **TypeScript strict**
- Roda no **Expo Go** (sem dev build)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.81 + Expo **SDK 54** |
| Linguagem | TypeScript (strict) |
| Navegação | React Navigation v7 (stacks + bottom tabs + modais) |
| Estado global | Zustand |
| Sessão / token | expo-secure-store |
| HTTP | Axios |
| Formulários | React Hook Form + Zod |
| UI | React Native Paper (MD3 escuro) |
| Imagens | expo-image (cache + placeholder) |
| Drag-and-drop | react-native-draggable-flatlist (+ reanimated / gesture-handler) |
| Gradiente | expo-linear-gradient |
| Compartilhamento | react-native-svg (`toDataURL`) + expo-file-system + expo-media-library + expo-sharing |

> **Compatibilidade travada:** o projeto é **SDK 54** porque o Expo Go do aparelho é 54. Não suba o SDK. Libs nativas sempre via `npx expo install`.

---

## Pré-requisitos

- **Node.js 18+** (testado com Node 22) e npm.
- **Expo Go (SDK 54)** instalado no celular Android.
- Celular e computador na **mesma rede Wi-Fi**.
- **Backend rodando** e acessível pela rede (ver abaixo).

---

## 1. Instalar dependências

```bash
cd frontend
npm install
```

## 2. Subir o backend (necessário)

A API precisa responder no **IP da máquina na LAN** (não `localhost`, que o celular físico não enxerga). No diretório do backend:

```bash
cd ../backend
docker compose up -d            # sobe PostgreSQL + API em 0.0.0.0:8000
# (opcional, para ter catálogo e atividade)
docker exec backend-api-1 python import_books.py livros.json   # importa o catálogo
docker exec backend-api-1 python fake_data.py --users 15        # usuários/leituras/resenhas de exemplo
```

Confirme no navegador da máquina: `http://<IP-DA-MAQUINA>:8000/docs`.

## 3. Configurar o `.env`

Copie o exemplo e coloque o **IP da sua máquina na Wi-Fi**:

```bash
cp .env.example .env
```

```env
# .env
EXPO_PUBLIC_API_URL=http://192.168.0.111:8000
```

Descubra o IP com `ip addr` (Linux) / `ifconfig` (macOS) — algo como `192.168.x.y`.
O `.env` **não é commitado** (está no `.gitignore`); versione apenas o `.env.example`.

## 4. Rodar

```bash
npx expo start
```

Abra o **Expo Go** no celular e **escaneie o QR Code** (mesma Wi-Fi). O app abre direto no Expo Go.

Atalhos no terminal do Metro: `r` recarrega · `j` abre o debugger · `?` lista tudo.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` / `npx expo start` | Inicia o Metro + QR Code para o Expo Go |
| `npm run android` | Inicia já tentando abrir no Android conectado |
| `npx tsc --noEmit` | Type-check (deve terminar sem erros) |
| `npx expo-doctor` | Diagnóstico de compatibilidade do projeto |

---

## Estrutura

```text
frontend/
├── App.tsx                 # raiz: GestureHandlerRootView > SafeAreaProvider > PaperProvider > RootNavigator
├── src/
│   ├── config.ts           # API_URL (lê EXPO_PUBLIC_API_URL)
│   ├── theme/              # colors, spacing, typography, paperTheme (única fonte de cores)
│   ├── components/         # ScreenContainer, BookCard, BookCover, StarRating, StatusBadge, BarChart, etc.
│   ├── navigation/         # RootNavigator, AppNavigator (tabs + modais), Explore/Profile stacks, tipos
│   ├── screens/            # Login, Cadastro, Explorar, Detalhe, Modal de Leitura, Perfil, Listas, Stats, ...
│   ├── store/              # authStore (Zustand) + tokenStorage (SecureStore)
│   ├── api/                # client (axios + Bearer + 401→logout) e módulos por recurso
│   ├── hooks/              # useAsync, useDebounce, useToast
│   ├── lib/                # schemas Zod de validação
│   ├── types/              # tipos do contrato da API
│   └── utils/              # format, stats, share
├── API_CONTRACT.md         # contrato real da API (derivado do backend)
└── .env.example
```

Alias de import: `@/*` → `src/*` (ex.: `import { colors } from '@/theme'`).

---

## Funcionalidades

- **Autenticação** JWT com sessão persistida (SecureStore) — login, cadastro, logout, auto-login.
- **Explorar** — busca com debounce (300ms) + seções "Em alta" e "Mais avaliados".
- **Detalhe do livro** — capa, sinopse, gêneros, nota média e resenhas (spoiler oculto até tocar).
- **Registro de leitura** — status (Quero ler / Lendo / Lido), nota em estrelas, resenha.
- **Perfil** — estante filtrável por status, editar perfil (nome/bio/avatar por URL).
- **Listas** — criar, adicionar/remover livros e **reordenar arrastando** (drag-and-drop).
- **Estatísticas** — cards, gráfico de barras por mês, gêneros favoritos.
- **Resumo anual** + **compartilhamento** — card estilo Letterboxd (capa + estrelas) gerado no cliente, salvar na galeria / compartilhar.

---

## Solução de problemas

- **App não conecta na API:** confira o IP em `.env`, se o celular está na **mesma Wi-Fi**, se o backend subiu em `0.0.0.0:8000` e se a porta 8000 não está bloqueada pelo firewall.
- **"Something went wrong" / SDK incompatível no Expo Go:** o Expo Go do celular precisa ser **SDK 54**. Não atualize o SDK do projeto.
- **Explorar vazio:** rode `import_books.py` (catálogo) e `fake_data.py` (atividade) no backend.
- **Primeira imagem compartilhada:** o Android pedirá **permissão de mídia** — aceite para salvar na galeria.
- **Erros estranhos após trocar de branch/deps:** limpe o cache com `npx expo start -c`.
