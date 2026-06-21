# Movel — Documento de Especificação da Aplicação

> Disciplina de Desenvolvimento Mobile | React Native  
> Projeto acadêmico — grupo de 2 a 3 pessoas

---

## 1. Visão Geral

Movel é um aplicativo mobile Android para **registro pessoal de leituras**. O usuário documenta os livros que leu, está lendo ou deseja ler; avalia e resenha cada título; organiza sua biblioteca em listas temáticas; e acompanha suas próprias estatísticas de leitura — tudo em uma interface centralizada e visualmente agradável.

A referência direta de produto é o **Letterboxd**, mas com foco exclusivo no registro pessoal: não há feed social, seguidores ou notificações. Na página de cada livro, o usuário pode ver as resenhas escritas por outros usuários da plataforma, o que enriquece a descoberta de opinião sem a complexidade de uma rede social.

---

## 2. Motivação

### 2.1 O problema

Leitores ativos frequentemente se deparam com dificuldades práticas:

**Memória fragmentada.** É comum terminar um livro e, meses depois, não lembrar com precisão o que se leu, o que achou, ou se já leu determinado título de um autor. Bloquinhos, planilhas e notas de celular são as soluções improvisadas mais usadas — todas desconectadas e sem contexto visual.

**Descoberta pouco confiável.** Recomendações de algoritmos de plataformas de venda priorizam o que é lucrativo. A opinião de outros leitores sobre um livro específico tem valor muito maior — mas não existe um canal limpo para consultar essas opiniões fora do contexto de compra.

**Falta de visão do próprio progresso.** Saber quantos livros se leu no ano, quais gêneros se consumiu mais e qual foi a nota média que se deu é informação que nenhum app simples agrega automaticamente.

### 2.2 Justificativa acadêmica

Do ponto de vista da disciplina, o projeto permite exercitar:

- Arquitetura cliente-servidor com API REST consumida por app mobile
- Autenticação stateless com JWT
- Modelagem relacional com relacionamentos N:N (usuários ↔ livros, listas ↔ livros)
- Integração com API externa (Open Library)
- Navegação hierárquica com React Navigation
- Estado global com Zustand e estado local com hooks
- Geração de imagem no cliente para compartilhamento social

---

## 3. Público-Alvo

Leitores com hábito de leitura regular que querem organizar e registrar suas leituras digitalmente. O perfil predominante é de jovens entre 18 e 35 anos, familiarizados com aplicativos de cultura. O app não requer interação social — é útil mesmo para um único usuário.

---

## 4. Proposta de Valor

> **Registre o que você leu. Organize sua biblioteca. Compartilhe sua jornada literária.**

| Pilar | O que entrega |
|---|---|
| **Registre** | Diário pessoal: status de leitura, avaliação em estrelas, resenha, data |
| **Organize** | Listas temáticas reordenáveis, estante filtrada por status |
| **Compartilhe** | Card visual de leitura e resumo anual para redes sociais |

---

## 5. Funcionalidades Principais

O app é composto por 6 módulos.

### 5.1 Conta e Perfil

O usuário cria uma conta com nome, e-mail e senha. Seu perfil exibe foto, bio curta e contadores de leituras (lido, lendo, quero ler). O perfil é estritamente pessoal — não há perfis públicos visitáveis por outros usuários.

### 5.2 Catálogo de Livros

O catálogo é alimentado pela **Open Library**, base de dados aberta com milhões de títulos. Ao buscar um livro, o app consulta a Open Library, persiste o resultado localmente e o exibe com capa, sinopse, autores e metadados. A busca funciona por título ou autor com resposta em tempo real (debounce de 300ms).

### 5.3 Registro de Leitura

O coração do app. Para qualquer livro, o usuário pode:

- Marcar com um de três status: **Quero ler**, **Lendo** ou **Lido**
- Dar uma nota de 1 a 5 estrelas (apenas quando status = "Lido")
- Escrever uma resenha de até 2.000 caracteres, com opção de marcar como spoiler

Avaliação e resenha são feitas na mesma tela, integradas ao status de leitura.

### 5.4 Resenhas de Outros Usuários

Na página de qualquer livro, o usuário pode **ler as resenhas escritas por todos os outros usuários** da plataforma. Essa leitura é passiva — não há curtidas, respostas ou interação com outros usuários. O objetivo é enriquecer a decisão de leitura com opiniões reais.

### 5.5 Listas Pessoais

O usuário pode criar listas temáticas de livros — "Clássicos que quero ler", "Recomendações do clube do livro", etc. A ordem dos livros é ajustável por arrastar e soltar.

### 5.6 Estatísticas e Compartilhamento

**Estatísticas pessoais.** Tela com dados de leitura do usuário: total de livros lidos, páginas estimadas, nota média, distribuição por mês (gráfico de barras) e ranking de gêneros favoritos.

**Card de leitura.** A partir de qualquer leitura avaliada, o usuário gera uma imagem com a capa do livro, título, autor, estrelas e seu nome de usuário — pronta para postar ou salvar na galeria.

**Resumo anual.** Uma tela estilo "Spotify Wrapped" mostra os destaques do ano: total de livros, gênero mais lido, autor mais lido e livro favorito. Exportável como imagem.

Ambos os cards são gerados inteiramente no frontend, sem servidor de renderização.

---

## 6. Arquitetura Técnica

### 6.1 Visão geral

```
┌─────────────────────────┐        HTTP/REST       ┌──────────────────────────┐
│   App Android           │ ─────────────────────► │   API Python             │
│   React Native + Expo   │                         │   FastAPI                │
│   TypeScript            │ ◄───────────────────── │   PostgreSQL             │
└─────────────────────────┘       JSON              └──────────┬───────────────┘
                                                               │ HTTP
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │  Open Library API    │
                                                    └──────────────────────┘
```

### 6.2 Backend

| Componente | Tecnologia |
|---|---|
| Linguagem | Python 3.11+ |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 |
| Banco de dados | PostgreSQL 15 |
| Migrações | Alembic |
| Autenticação | JWT (python-jose) |
| Gerenciador de deps | uv |
| Linter/Formatter | ruff |

### 6.3 Frontend

| Componente | Tecnologia |
|---|---|
| Framework | React Native 0.74+ com Expo |
| Linguagem | TypeScript (strict mode) |
| Navegação | React Navigation v6 |
| Estado global | Zustand |
| HTTP | Axios |
| Formulários | React Hook Form + Zod |
| UI base | React Native Paper |

### 6.4 Banco de Dados

O banco possui **6 tabelas**:

```
users        — contas de usuário
books        — catálogo de livros (cache da Open Library)
readings     — registro de leitura de um usuário para um livro
reviews      — resenhas vinculadas a leituras (um usuário, uma por livro)
lists        — listas temáticas criadas por usuários
list_books   — livros dentro de listas com posição ordenável
```

Não há tabelas de follows, notifications ou review_likes — o app não tem rede social.

### 6.5 Autenticação

Fluxo stateless via JWT de 30 dias. Sem sessões no servidor, refresh token ou login social.

---

## 7. Fluxos Principais

### 7.1 Primeiro acesso

```
Abrir app → LoginScreen
  ├── Tem conta → preenche e-mail/senha → Explorar
  └── Novo usuário → RegisterScreen → Feed (logado automaticamente)
```

### 7.2 Registrar uma leitura

```
Explorar → busca livro → BookDetailScreen
  └── "Registrar leitura" → ReadingModal
        ├── Seleciona status
        ├── [Se Lido] seleciona nota (1-5 estrelas)
        ├── [Opcional] escreve resenha
        └── Salva → BookDetailScreen atualizado com status e nota
```

### 7.3 Consultar resenhas de um livro

```
Explorar → livro → BookDetailScreen
  └── Rola até a seção "Resenhas"
        └── Lê resenhas de outros usuários (somente leitura)
```

### 7.4 Compartilhar leitura

```
BookDetailScreen (leitura existente com nota)
  └── "Compartilhar" → gera imagem PNG (react-native-view-shot)
        ├── "Salvar na galeria"
        └── "Compartilhar" → seletor nativo do Android
```

### 7.5 Ver resumo do ano

```
Perfil → Estatísticas → "Meu ano em livros"
  ├── [< 3 livros lidos] → aviso explicativo
  └── [≥ 3 livros lidos] → card com destaques → salvar / compartilhar
```

---

## 8. Telas do Aplicativo

O app é composto por **11 telas** organizadas em duas abas principais:

| # | Tela | Aba | Descrição |
|---|---|---|---|
| 1 | Login | — | Entrada com e-mail e senha |
| 2 | Cadastro | — | Criação de conta |
| 3 | Explorar | Explorar | Busca de livros + seções de descoberta |
| 4 | Detalhes do Livro | Explorar | Informações, nota média e resenhas de outros |
| 5 | Modal de Leitura | Detalhes do Livro | Status + avaliação + resenha (modal) |
| 6 | Perfil | Perfil | Estante pessoal: lidos, lendo, quero ler |
| 7 | Editar Perfil | Perfil | Edição de nome, bio e avatar |
| 8 | Listas | Perfil | Listagem das listas do usuário |
| 9 | Detalhes da Lista | Listas | Livros da lista com reordenação drag-and-drop |
| 10 | Estatísticas | Perfil | Gráficos e números de leitura |
| 11 | Resumo Anual | Estatísticas | Card compartilhável do ano |

---

## 9. Decisões de Design e Simplificações

| Decisão | Escolha | Justificativa |
|---|---|---|
| Catálogo de livros | Open Library API (externa, gratuita) | Evita popular um catálogo próprio do zero |
| Banco de dados | Apenas PostgreSQL | Dados são relacionais; sem ganho em adicionar outro banco |
| Rede social | Ausente | Fora do escopo — o app é de registro pessoal |
| Curtidas em resenhas | Ausentes | Sem rede social, curtidas não têm contexto de reciprocidade |
| Notificações | Ausentes | Dependem de interação social |
| Compartilhamento | Geração de imagem no frontend | `react-native-view-shot` resolve no cliente sem servidor |
| Autenticação | JWT simples, sem refresh token | Escopo acadêmico; token longo (30 dias) compensa |
| Avaliação | Estrelas inteiras (1-5) | Componente simples sem perda funcional |

---

## 10. O Que o Projeto Não É

- **Não é uma rede social.** Não há feed, seguidores, curtidas ou notificações.
- **Não é uma livraria ou marketplace.** Sem compra, preço ou links de afiliados.
- **Não é um gerenciador de biblioteca física.** Sem rastreamento de exemplares ou empréstimos.
- **Não é um produto final para publicação.** É um projeto acadêmico com escopo controlado.

---

## 11. Stack Resumida

| Camada | Tecnologia |
|---|---|
| App mobile | React Native 0.74 + Expo (Android) |
| Linguagem frontend | TypeScript (strict) |
| Navegação | React Navigation v6 |
| Estado | Zustand |
| UI | React Native Paper |
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy 2.0 |
| Banco | PostgreSQL 15 |
| Migrações | Alembic |
| Autenticação | JWT (HS256, 30 dias) |
| Catálogo externo | Open Library API |
| Gerenciador de deps (backend) | uv |
| Linter/Formatter (backend) | ruff |
| Linter/Formatter (frontend) | ESLint + Prettier |
