# Prompt para Agente de IA — Implementação do Frontend

---

## Contexto do Projeto

Você está implementando o **frontend completo** de um aplicativo mobile Android de **registro pessoal de leituras**, similar ao Letterboxd mas sem funcionalidades sociais. É um projeto acadêmico em React Native. O app consome uma API REST em FastAPI rodando localmente.

O escopo é enxuto: 11 telas, foco em funcionalidades que aparecem numa demo ao vivo. Não há feed, seguidores, curtidas ou notificações. Na página de um livro, o usuário pode **ler** resenhas de outros usuários, mas não interagir com elas.

O backend está rodando em `http://10.0.2.2:3000` (endereço do host no emulador Android). Documentação em `http://10.0.2.2:3000/docs`.

---

## Stack Obrigatória

### Core
- **Framework:** React Native 0.74+ com **Expo** (managed workflow)
- **Linguagem:** TypeScript — strict mode, sem `any` explícito
- **Navegação:** React Navigation v6 (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`)
- **Estado global:** Zustand
- **HTTP:** Axios com interceptor de token JWT
- **Formulários:** React Hook Form + Zod
- **Async Storage:** `@react-native-async-storage/async-storage`
- **Imagens:** `expo-image`

### UI
- **Componentes base:** React Native Paper
- **Ícones:** `@expo/vector-icons` (MaterialCommunityIcons)
- **Gráficos:** `react-native-gifted-charts`

### Funcionalidades específicas
- **Captura de tela:** `react-native-view-shot`
- **Salvar na galeria:** `expo-media-library`
- **Drag and drop:** `react-native-draggable-flatlist`
- **Seleção de imagem:** `expo-image-picker`

### Linting
- ESLint com `eslint-config-expo` + Prettier
- `tsc --noEmit` para verificação de tipos

**Não instale outras bibliotecas sem justificativa explícita.**

---

## Estrutura de Pastas Obrigatória

```
src/
├── api/
│   ├── client.ts       # Axios com baseURL e interceptor JWT
│   ├── auth.ts         # login(), register()
│   ├── books.ts        # searchBooks(), getBook(), getBookReviews()
│   ├── readings.ts     # upsertReading(), deleteReading()
│   ├── reviews.ts      # createReview(), updateReview(), deleteReview()
│   ├── lists.ts        # getMyLists(), getList(), createList(), updateList(), deleteList(), addBook(), removeBook(), reorderBooks()
│   ├── users.ts        # getMe(), updateMe(), getMyStats(), getMyReadings(), getMyReviews()
│   └── discover.ts     # getTrending(), getTopRated()
├── components/
│   ├── common/
│   │   ├── BookCard.tsx
│   │   ├── StarRating.tsx
│   │   ├── Avatar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── book/
│       └── ReviewCard.tsx   # card de resenha (somente leitura)
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── explore/
│   │   └── ExploreScreen.tsx
│   ├── book/
│   │   ├── BookDetailScreen.tsx
│   │   └── ReadingModal.tsx
│   ├── profile/
│   │   ├── ProfileScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── YearSummaryScreen.tsx
│   └── lists/
│       ├── ListsScreen.tsx
│       └── ListDetailScreen.tsx
├── store/
│   └── authStore.ts
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthStack.tsx
│   └── MainTabs.tsx
├── hooks/
│   ├── useDebounce.ts
│   └── useRefreshOnFocus.ts
├── utils/
│   ├── formatDate.ts
│   ├── formatRating.ts
│   └── constants.ts
└── types/
    └── api.ts
```

---

## Design System

```typescript
// src/utils/constants.ts

export const API_URL = "http://10.0.2.2:3000";

export const Colors = {
  background:    "#0F0E17",
  surface:       "#1A1925",
  surfaceHigh:   "#252336",
  textPrimary:   "#FFFFFE",
  textSecondary: "#A7A9BE",
  textMuted:     "#6B6D85",
  accent:        "#E53170",
  accentMuted:   "#7B2D4A",
  border:        "#2E2C42",
  success:       "#2CB67D",
  error:         "#FF6B6B",
  warning:       "#F9C74F",
} as const;

export const FontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, hero: 32,
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const BorderRadius = {
  sm: 6, md: 12, lg: 20, full: 9999,
} as const;
```

---

## Tipos TypeScript (`src/types/api.ts`)

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UserProfile extends User {
  total_read: number;
  total_reading: number;
  total_want_to_read: number;
}

export interface Book {
  id: string;
  ol_key: string | null;
  title: string;
  authors: string[];
  publisher: string | null;
  published_year: number | null;
  pages: number | null;
  synopsis: string | null;
  cover_url: string | null;
  genres: string[];
  avg_rating: number;
  total_ratings: number;
  created_at: string;
}

export interface BookDetail extends Book {
  my_reading: MyReading | null;
}

export interface MyReading {
  id: string;
  status: ReadingStatus;
  rating: number | null;
}

export type ReadingStatus = "read" | "reading" | "want_to_read";

export interface Reading {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  rating: number | null;
  created_at: string;
  updated_at: string;
  book: Book;
}

// Review com author embutido — retornado por GET /books/{id}/reviews
export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  content: string;
  has_spoiler: boolean;
  created_at: string;
  updated_at: string;
  author: User;
}

export interface BookList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  books: BookListItem[];
  created_at: string;
  updated_at: string;
}

export interface BookListItem {
  position: number;
  book: Book;
}

export interface UserStats {
  total_read: number;
  total_pages: number;
  avg_rating_given: number;
  books_by_month: Record<string, number>;   // chave: "YYYY-MM"
  top_genres: Array<{ genre: string; count: number }>;
}

export interface YearSummary {
  total_books: number;
  total_pages: number;
  avg_rating: number;
  top_genre: string | null;
  top_author: string | null;
  favorite_book: { id: string; title: string; authors: string[]; cover_url: string | null } | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

// Inputs de formulário
export interface LoginInput { email: string; password: string; }
export interface RegisterInput { name: string; username: string; email: string; password: string; }
export interface UpsertReadingInput { book_id: string; status: ReadingStatus; rating?: number; }
export interface CreateReviewInput { book_id: string; content: string; has_spoiler: boolean; }
export interface UpdateReviewInput { content?: string; has_spoiler?: boolean; }
export interface CreateListInput { title: string; description?: string; }
export interface UpdateListInput { title?: string; description?: string; }
export interface ReorderBooksInput { items: Array<{ book_id: string; position: number }>; }
```

---

## Camada de API (`src/api/`)

### `client.ts`

```typescript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

export const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
```

### Mapeamento de endpoints

#### `auth.ts`
| Função | Endpoint |
|---|---|
| `login(data)` | `POST /auth/login` → `{ access_token, user }` |
| `register(data)` | `POST /auth/register` → `{ access_token, user }` |

#### `books.ts`
| Função | Endpoint |
|---|---|
| `searchBooks(q)` | `GET /books/search?q=` → `Book[]` |
| `getBook(id)` | `GET /books/{id}` → `BookDetail` |
| `getBookReviews(id, page, perPage)` | `GET /books/{id}/reviews?page=&per_page=` → `Review[]` |

#### `readings.ts`
| Função | Endpoint |
|---|---|
| `upsertReading(data)` | `POST /readings` → `Reading` com `book` embutido |
| `deleteReading(id)` | `DELETE /readings/{id}` |

#### `reviews.ts`
| Função | Endpoint |
|---|---|
| `createReview(data)` | `POST /reviews` → 409 se já existe |
| `updateReview(id, data)` | `PATCH /reviews/{id}` |
| `deleteReview(id)` | `DELETE /reviews/{id}` |

#### `lists.ts`
| Função | Endpoint |
|---|---|
| `getMyLists()` | `GET /users/me/lists` → `BookList[]` |
| `getList(id)` | `GET /lists/{id}` |
| `createList(data)` | `POST /lists` |
| `updateList(id, data)` | `PATCH /lists/{id}` |
| `deleteList(id)` | `DELETE /lists/{id}` |
| `addBook(listId, bookId)` | `POST /lists/{id}/books` body: `{ book_id }` |
| `removeBook(listId, bookId)` | `DELETE /lists/{id}/books/{book_id}` |
| `reorderBooks(listId, items)` | `PATCH /lists/{id}/books/reorder` body: `{ items: [{ book_id, position }] }` |

#### `users.ts`
| Função | Endpoint |
|---|---|
| `getMe()` | `GET /users/me` → `User` |
| `updateMe(data)` | `PATCH /users/me` |
| `getMyStats()` | `GET /users/me/stats` → `UserStats` |
| `getMyReadings(status?, page, perPage)` | `GET /users/me/readings?status=` → `Reading[]` |
| `getMyReviews(page, perPage)` | `GET /users/me/reviews` |

#### `discover.ts`
| Função | Endpoint |
|---|---|
| `getTrending()` | `GET /discover/trending` → `Book[]` |
| `getTopRated()` | `GET /discover/top-rated` → `Book[]` |

#### Stats (em `users.ts` ou `stats.ts`)
| Função | Endpoint |
|---|---|
| `getYearSummary(year)` | `GET /stats/year-summary?year=` → `YearSummary` — 400 se < 3 livros |

---

## Gerenciamento de Estado

### `authStore.ts`

```typescript
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { getMe } from "../api/users";
import type { User, LoginInput, RegisterInput } from "../types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,

  hydrate: async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      try {
        const user = await getMe();
        set({ token, user });
      } catch {
        await AsyncStorage.removeItem("token");
      }
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const { access_token, user } = await apiLogin(data);
      await AsyncStorage.setItem("token", access_token);
      set({ token: access_token, user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { access_token, user } = await apiRegister(data);
      await AsyncStorage.setItem("token", access_token);
      set({ token: access_token, user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
```

Não crie outros stores — não há notificações ou estado social para gerenciar.

---

## Navegação

```
RootNavigator
├── AuthStack (token === null)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainTabs (token !== null)
    ├── Tab: Explorar
    │   └── Stack: ExploreScreen → BookDetailScreen
    └── Tab: Perfil
        └── Stack: ProfileScreen → EditProfileScreen → StatsScreen
                       → YearSummaryScreen → ListsScreen → ListDetailScreen
```

Duas abas apenas: **Explorar** e **Perfil**. Não há aba Feed.

---

## Regras de Implementação

### Componentes
- Função com `export default`. Sem class components.
- Props tipadas com `interface` local. Sem `any`.
- Telas em `screens/` têm no máximo 200 linhas.
- Componentes que fazem chamadas de API usam `useEffect` + `useState` locais.

### Formulários
Use sempre React Hook Form + Zod.

### Chamadas de API

Padrão obrigatório:

```typescript
const [data, setData] = useState<Book | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;
  setIsLoading(true);
  getBook(bookId)
    .then((result) => { if (!cancelled) setData(result); })
    .catch(() => { if (!cancelled) setError("Não foi possível carregar o livro."); })
    .finally(() => { if (!cancelled) setIsLoading(false); });
  return () => { cancelled = true; };
}, [bookId]);
```

Sempre exiba `<LoadingSpinner />` durante `isLoading` e `<ErrorMessage />` quando `error !== null`.

### Listas
Use `FlatList`. Nunca `ScrollView` com `.map()`.

### Imagens
Use `expo-image` com `placeholder` e `contentFit="cover"`.

---

## Etapas de Implementação

---

### Etapa 1 — Setup do Projeto

1. `npx create-expo-app bookapp --template expo-template-blank-typescript`
2. Instalar todas as dependências da stack
3. Configurar `tsconfig.json` com `strict: true`
4. Criar `src/utils/constants.ts` com o design system
5. Criar `src/types/api.ts`
6. Criar `src/api/client.ts`
7. Configurar ESLint e Prettier
8. Configurar tema escuro do React Native Paper em `App.tsx`

```typescript
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { Colors } from "./src/utils/constants";

const theme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: Colors.accent, background: Colors.background, surface: Colors.surface },
};
```

**Checklist:**
- [ ] `npx expo start` sobe sem erros
- [ ] App abre com fundo `#0F0E17`
- [ ] `tsc --noEmit` passa

---

### Etapa 2 — Navegação e Autenticação

1. Criar `RootNavigator`, `AuthStack`, `MainTabs` (2 abas: Explorar | Perfil)
2. Implementar `authStore.ts`
3. Chamar `hydrate()` em `App.tsx`
4. Criar `src/api/auth.ts`
5. Implementar `LoginScreen` (RHF + Zod)
6. Implementar `RegisterScreen` com login automático após cadastro

**LoginScreen:** campos E-mail e Senha; erro inline (não `Alert`); link "Criar conta".
**RegisterScreen:** Nome completo, Username, E-mail, Senha; erro 409 inline.

**Checklist:**
- [ ] Sem token → LoginScreen
- [ ] Login correto → Explorar
- [ ] Login errado → mensagem inline
- [ ] Cadastro → login automático → Explorar
- [ ] Reabrir app mantém sessão
- [ ] Logout limpa token e volta ao Login
- [ ] `tsc --noEmit` passa

---

### Etapa 3 — Componentes Comuns

1. **`BookCard`** — `book: Book`, capa (`expo-image`), título, autor, nota ★. Variantes `size`: `"sm"` (60×90) e `"md"` (80×120).
2. **`StarRating`** — `rating: number`, `editable: boolean`, `onRate?: (n: number) => void`. Cor `Colors.accent`.
3. **`Avatar`** — `uri: string | null`, `name: string`, `size: number`. Fallback: inicial em `Colors.accent`.
4. **`EmptyState`** — `icon: string`, `title: string`, `subtitle?: string`.
5. **`LoadingSpinner`** — `fullScreen?: boolean`, `color={Colors.accent}`.
6. **`ErrorMessage`** — `message: string`, `onRetry?: () => void`.
7. **`ReviewCard`** — `review: Review`, read-only. Avatar + nome do autor + data relativa + nota do autor em estrelas + conteúdo (com botão "ver spoiler" se `has_spoiler`). Sem botão de curtir.

**Checklist:**
- [ ] Renderizar todos em tela temporária com dados fictícios
- [ ] `BookCard` mostra placeholder quando `cover_url` é nulo
- [ ] `Avatar` exibe inicial quando `uri` é nulo
- [ ] `ReviewCard` oculta spoiler por padrão com botão para revelar
- [ ] `tsc --noEmit` passa
- [ ] Remover tela temporária antes de avançar

---

### Etapa 4 — Explorar e Catálogo

1. Criar `src/api/books.ts` e `src/hooks/useDebounce.ts`
2. Implementar `ExploreScreen`:
   - Campo de busca com `useDebounce(query, 300)`
   - Com `query` vazia: duas seções de descoberta em scroll vertical com `FlatList` horizontal ("Em alta" e "Melhor avaliados")
   - Com resultado: `FlatList` vertical de `BookCard size="md"` + `EmptyState` para busca sem resultado
3. Implementar `BookDetailScreen`:
   - Hero: capa 200px, título, autores, chips de gênero
   - Nota média + total de avaliações
   - Status atual da leitura do usuário (de `my_reading`) com botão "Registrar leitura" ou "Editar leitura"
   - Sinopse com "ver mais"
   - Seção "Resenhas" com `FlatList` de `ReviewCard` paginada e botão "Carregar mais"

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

**Checklist:**
- [ ] Busca dispara após ~300ms
- [ ] Com query vazia, seções de descoberta aparecem
- [ ] Tocar num livro abre `BookDetailScreen`
- [ ] Resenhas de outros usuários aparecem na seção "Resenhas"
- [ ] `LoadingSpinner` durante carregamento, `ErrorMessage` em falha

---

### Etapa 5 — Registro de Leitura e Resenha

1. Criar `src/api/readings.ts` e `src/api/reviews.ts`
2. Implementar `ReadingModal` (bottom sheet do React Native Paper):
   - Três botões de status com seleção visual (`Colors.accent` quando ativo)
   - `StarRating` editável (só ativo quando status = "read")
   - Textarea de resenha (só visível quando status = "read", limite 2000 chars com contador)
   - Checkbox "Contém spoilers"
   - Botão "Salvar" → `upsertReading()` + `createReview()` se houver texto
   - Botão "Remover registro" (só se `my_reading !== null`) → `deleteReading()`
   - Pré-preenche campos ao abrir se já há leitura/resenha
   - Ao fechar com sucesso, chama callback `onSave` para atualizar `BookDetailScreen`
3. Implementar **card de compartilhamento de leitura** dentro do `ReadingModal`:
   - Botão "Compartilhar leitura" visível apenas quando status = "read" e rating não é nulo
   - Ao tocar, exibe um `<ViewShot>` com o card gerado e dois botões: "Salvar na galeria" e "Compartilhar"
   - **Layout do card** (fundo `Colors.surface`, border-radius `BorderRadius.lg`, padding `Spacing.lg`):
     - Capa do livro centralizada (100×150px)
     - Título em bold + autor em `Colors.textSecondary`
     - `StarRating` read-only com a nota do usuário
     - "@username" em `Colors.textMuted` + nome do app "Movel" em `Colors.accent`
   - Lógica de captura e salvamento:

```typescript
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { Share } from "react-native";

const cardRef = useRef<ViewShot>(null);

const handleSave = async () => {
  const [status] = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") return;
  const uri = await cardRef.current?.capture();
  if (uri) await MediaLibrary.saveToLibraryAsync(uri);
};

const handleShare = async () => {
  const uri = await cardRef.current?.capture();
  if (uri) await Share.share({ url: uri });
};
```

**Checklist:**
- [ ] Modal abre ao tocar em "Registrar leitura"
- [ ] Status atualiza visualmente
- [ ] Estrelas desabilitadas quando status ≠ "read"
- [ ] Salvar chama API e fecha modal
- [ ] `BookDetailScreen` reflete novo status após fechar
- [ ] Spoiler oculto por padrão com botão para revelar no ReviewCard
- [ ] Modal pré-preenchido ao reabrir
- [ ] Botão "Compartilhar leitura" aparece apenas quando status = "read" e rating preenchido
- [ ] "Salvar na galeria" solicita permissão e salva a imagem do card
- [ ] "Compartilhar" abre o seletor nativo do Android com a imagem gerada

---

### Etapa 6 — Perfil e Biblioteca Pessoal

1. Criar `src/api/users.ts`
2. Implementar `ProfileScreen`:
   - Header: avatar, nome, @username, bio
   - Contadores: "X lidos · Y lendo · Z quero ler" — cada contador é tocável e abre lista filtrada
   - Botão "Editar perfil"
   - Duas abas: **Leituras** (lista filtrada) | **Listas**
   - Aba Leituras: usa `getMyReadings()`, mostra `BookCard` com status badge
   - Aba Listas: usa `getMyLists()`, mostra cartões de lista com thumbnails de capas
3. Implementar `EditProfileScreen`:
   - Campos: Nome, Bio (150 chars com contador)
   - Avatar: `expo-image-picker` → `updateMe({ avatar_url })`
   - RHF + Zod

**Checklist:**
- [ ] Perfil exibe contadores corretos
- [ ] Tocar em contador filtra a lista de leituras
- [ ] Editar perfil salva e reflete mudanças imediatamente
- [ ] Aba Listas exibe as listas do usuário

---

### Etapa 7 — Listas

1. Criar `src/api/lists.ts`
2. Implementar `ListsScreen`:
   - Botão "Nova lista" → dialog para título + descrição
   - Cartões com título, contagem e thumbnails de capas
   - Ícone de deletar em cada cartão
3. Implementar `ListDetailScreen`:
   - Título, descrição, contagem
   - `DraggableFlatList` para reordenar
   - `onDragEnd` → `reorderBooks(listId, items)` com `[{ book_id, position }]`
   - Botão remover livro → `removeBook(listId, bookId)`
   - Botão "Adicionar livro" → busca inline → `addBook(listId, bookId)`

**Checklist:**
- [ ] Criar lista funciona
- [ ] Drag and drop reordena os livros e persiste
- [ ] Remover livro da lista funciona
- [ ] Busca inline para adicionar livro funciona

---

### Etapa 8 — Estatísticas e Compartilhamento

1. Implementar `StatsScreen`:
   - Cards: total lidos, páginas estimadas, média ★
   - Gráfico de barras (`react-native-gifted-charts`) com `books_by_month` filtrado para o ano atual, barras `Colors.accent`, labels mês abreviado
   - Ranking de gêneros com barras de progresso
   - Botão "Meu ano em livros" → `YearSummaryScreen`
2. Implementar `YearSummaryScreen`:
   - Chamar `getYearSummary(anoAtual)`
   - 400 do backend → `EmptyState` ("Leia pelo menos 3 livros para gerar seu resumo")
   - Card visual dentro de `<ViewShot ref={cardRef}>`: nome do app, capa favorita, stats 2×2, nota média, @username
   - Botões "Salvar na galeria" e "Compartilhar"

```typescript
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { Share } from "react-native";

const cardRef = useRef<ViewShot>(null);

const handleSave = async () => {
  const [status] = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") return;
  const uri = await cardRef.current?.capture();
  if (uri) await MediaLibrary.saveToLibraryAsync(uri);
};

const handleShare = async () => {
  const uri = await cardRef.current?.capture();
  if (uri) await Share.share({ url: uri });
};
```

**Checklist:**
- [ ] Gráfico de barras exibe dados por mês
- [ ] `EmptyState` quando backend retorna 400
- [ ] "Salvar na galeria" solicita permissão e salva
- [ ] "Compartilhar" abre seletor nativo do Android

---

### Etapa 9 — Polimento e Validação Final

1. Revisar todas as telas: toda chamada de API tem `LoadingSpinner` e `ErrorMessage`
2. Configurar ícone e splash screen no `app.json`; travar orientação em retrato
3. Revisar consistência visual — sem cores fora das constantes
4. `accessibilityLabel` em todos os botões de ícone
5. `npx eslint src/ --fix` + `tsc --noEmit`

**Fluxo completo de demo (11 passos):**
1. Abrir o app → LoginScreen
2. Cadastrar um novo usuário
3. Buscar "Duna" na aba Explorar
4. Abrir o livro → ler resenhas de outros usuários
5. Registrar como Lido com nota 5
6. Escrever uma resenha
7. Ver que a resenha aparece na página do livro
8. Criar uma lista "Favoritos" e adicionar o livro
9. Reordenar livros da lista por drag and drop
10. Ver estatísticas no perfil
11. Gerar e salvar o resumo anual

**Checklist final:**
- [ ] Todos os 11 passos funcionam sem crash
- [ ] Nenhuma tela exibe `undefined` ou `null` como texto visível
- [ ] Todas as imagens têm placeholder
- [ ] `npx eslint src/` sem erros
- [ ] `tsc --noEmit` sem erros
- [ ] Todas as telas com fundo `Colors.background`

---

## O Que Não Implementar

- Feed de atividades sociais
- Follow/unfollow de usuários
- Curtidas em resenhas
- Notificações (push ou in-app)
- Busca de usuários
- Perfil de outros usuários
- Login social (Google, Apple)
- Modo claro / toggle de tema
- Testes automatizados de componentes
- Suporte a tablet ou landscape
