# Prompt para v0 — Mockups do App Movel

---

Crie os mockups de um aplicativo mobile de **registro pessoal de leituras** chamado **Movel**. O app é similar ao Letterboxd, mas sem funcionalidades sociais: não há feed, seguidores ou notificações. O usuário registra seus livros, escreve resenhas, organiza listas e acompanha suas estatísticas. Na página de um livro, ele pode ler resenhas de outros usuários da plataforma (somente leitura, sem interação).

Gere **uma tela por mensagem**, na ordem indicada. Cada tela é um componente React renderizado num frame de celular (390×844px), tema escuro, usando Tailwind CSS com valores arbitrários para as cores do design system. Use Lucide React para ícones.

---

## Design System

```
Cores (use como valores arbitrários Tailwind — ex: bg-[#0F0E17]):
  background:    #0F0E17   — fundo de todas as telas
  surface:       #1A1925   — cards, inputs, modais
  surface-high:  #252336   — elementos elevados, chip selecionado
  text-primary:  #FFFFFE
  text-secondary:#A7A9BE
  text-muted:    #6B6D85
  accent:        #E53170   — CTA primário, estrelas, tab ativa, badge
  accent-muted:  #7B2D4A   — fundo de tags de gênero
  border:        #2E2C42
  success:       #2CB67D   — confirmações, status "Lido"
  error:         #FF6B6B   — erros, botão destrutivo
  warning:       #F9C74F   — status "Lendo"
```

**Tipografia:** Inter. Hierarquia: título de tela 20px bold · nome/subtítulo 17px semibold · corpo 15px regular · metadado 13px · label mínimo 11px.

**Espaçamento:** múltiplos de 4px. Padding lateral: 16px. Gap entre cards: 12px. Padding interno de card: 16px.

**Border-radius:** botões e inputs 8px · cards 12px · avatares e chips 9999px.

---

## Contexto e Dados de Exemplo

**Usuário logado:** Ana Lima · @ana_leitora · bio "Apaixonada por fantasia e ficção científica." · 47 lidos · 3 lendo · 12 quero ler

**Livros:**
| Título | Autor | Nota | Gênero | Páginas |
|---|---|---|---|---|
| O Senhor dos Anéis | J.R.R. Tolkien | 4.9 | Fantasia | 1.178 |
| 1984 | George Orwell | 4.8 | Distopia | 328 |
| Dom Casmurro | Machado de Assis | 4.5 | Literatura Brasileira | 256 |
| Cem Anos de Solidão | García Márquez | 4.7 | Realismo Mágico | 448 |
| Duna | Frank Herbert | 4.6 | Ficção Científica | 688 |
| Sapiens | Yuval Harari | 4.5 | Não-Ficção | 464 |
| O Pequeno Príncipe | Antoine de Saint-Exupéry | 4.8 | Fábula | 96 |

**Outros usuários (apenas para resenhas na página do livro):**
- Bruno Carvalho · @bruno_books
- Carla Souza · @carla_reads

**Capas de livro:** retângulos arredondados (8px) com gradiente de cor sólida representativa + iniciais do título em branco. Não use `<img>` com URLs externas.

**Avatares:** círculos com inicial do nome sobre fundo `#E53170`.

---

## Regras Globais de UI/UX

### Estrutura de tela
- **Status bar** (44px) em toda tela: "9:41" à esquerda, ícones de bateria/sinal à direita em `text-muted`.
- **Bottom tab bar** fixa (60px) em todas as telas pós-login: duas abas — **Explorar** e **Perfil**. Ícones `Compass` e `User`. Tab ativa em `accent`, inativa em `text-muted`. Separador `border` no topo.
- Área de conteúdo scrolla entre status bar e tab bar (`overflow-y: auto`).
- Padding lateral 16px em todo conteúdo.

### Hierarquia visual
- Um único CTA primário por tela — tudo mais é secundário.
- Use peso de fonte para hierarquia, não cor. Cor é reservada para estado e ação.
- Metadados (data, contagem, autor secundário) em `text-muted` 13px.

### Botões e estados interativos
- **Primário:** fundo `accent`, texto branco, border-radius 8px, altura 48px, largura total.
- **Outline:** borda `accent`, texto `accent`, mesmas dimensões.
- **Destrutivo:** texto `error`, sem fundo, sem borda.
- **Desabilitado:** opacidade 50%.
- **Chips de seleção** (status de leitura, abas internas): inativo fundo `surface-high` texto `text-secondary`; ativo fundo `accent` texto branco, border-radius 9999px.
- **Cards tocáveis:** fundo `surface`, border-radius 12px, borda `border` 1px — sem sombra excessiva.
- **Campos de texto:** fundo `surface`, borda `border`, border-radius 8px, placeholder em `text-muted`.
- **Campo com erro:** borda `error`, mensagem de erro abaixo em `error` 13px.

### Estrelas (rating)
- Preenchida: ★ em `accent`. Vazia: ★ em `border`.
- Read-only (cards, detalhes): inline com número — `★★★★★ 4.9`.
- Editável (modal): grandes (28px), espaçadas.

### Feedback de estado vazio
- Ícone Lucide centralizado em `text-muted`, título em `text-secondary`, subtítulo em `text-muted`. Sem card, sem borda.

### Densidade de informação
- **BookCard horizontal** (seções de descoberta): capa 80×120px, título 2 linhas, autor 1 linha, nota.
- **BookCard vertical** (resultados de busca): capa 60×90px à esquerda, título + autor + metadado à direita.
- **ReviewCard:** fundo `surface`, padding 16px, border-radius 12px. Avatar + nome bold + @username em `text-muted` + data em `text-muted`. Linha de estrelas abaixo do nome. Texto da resenha. Sem botão de curtir.

### O que NÃO fazer
- Não use cores fora do design system (`gray-500`, `blue-600`, etc.).
- Não use "Lorem ipsum" — use os dados de exemplo.
- Não adicione sombras excessivas — profundidade vem de diferença de cor de fundo.
- Não use borda em todos os elementos — reserve para inputs e separadores.
- Não inclua ícone de sino (notificações), aba de Feed ou botão de seguir em nenhuma tela.
- Não exiba likes ou contadores de curtida em resenhas.

---

## Telas

### Tela 1 — Login

Primeira experiência. Transmite o caráter literário do app.

**Composição:** bloco superior (40% da tela) com identidade do app; bloco inferior com o formulário.

**Bloco superior:** ícone `BookOpen` em `accent` + nome "Movel" em 32px bold branco, centralizados. Tagline "Registre cada leitura." em 15px `text-secondary` abaixo. Fundo com gradiente sutil de `#1A1925` → `#0F0E17`.

**Formulário:** campo E-mail com ícone `Mail` prefixado. Campo Senha com ícone `Lock` prefixado e ícone `Eye` sufixado. Botão "Entrar" primário. Separador "ou" com linhas horizontais em `border`. Link centralizado "Não tem conta? **Criar conta**" com o span em `accent`.

---

### Tela 2 — Cadastro

Continuidade visual do Login.

**Header:** botão `←` de voltar + título "Criar conta" centralizado.

**Formulário:** quatro campos sequenciais: Nome completo (`User`), Nome de usuário com prefixo "@" dentro do campo (`AtSign`), E-mail (`Mail`), Senha (`Lock`). Botão "Criar conta" primário. Rodapé "Já tem conta? **Entrar**".

**Demonstrar validação inline no campo Username:** borda `error`, ícone `AlertCircle` sufixado em `error`, mensagem "Este nome de usuário já está em uso" em 13px `error` abaixo do campo. Os demais campos permanecem no estado normal.

---

### Tela 3 — Explorar (estado inicial)

Porta de entrada para descoberta de livros. Com query vazia, foco nas seções editoriais.

**Header:** título "Explorar" à esquerda.

**Campo de busca:** largura total, placeholder "Buscar livros...", ícone `Search` prefixado, fundo `surface`.

**Seção "Em alta esta semana":** título de seção 15px semibold + ícone `TrendingUp` em `accent`. Scroll horizontal de BookCards (80×120px): mostrar 3 cards completos e o 4º cortado indicando scroll. Cada card: capa colorida, título 2 linhas, autor 1 linha, nota `★ 4.9`.

**Seção "Melhor avaliados":** mesmo formato, ícone `Star`. Livros diferentes da seção anterior.

---

### Tela 4 — Explorar (com resultados de busca)

Mesma estrutura da tela anterior, mas com query ativa.

**Estado:** campo preenchido com "tolkien", ícone `X` sufixado para limpar. As seções editoriais desaparecem, substituídas pela lista de resultados.

**Texto acima:** "3 resultados para 'tolkien'" em `text-muted` 13px.

**Lista vertical** com separadores `border`: cada item tem capa 60×90px à esquerda, à direita: título semibold, autor em `text-secondary`, "1.178 páginas · Fantasia" em `text-muted` 13px, nota `★ 4.9` em `accent`.
- O Senhor dos Anéis / J.R.R. Tolkien / 1.178 pág / 4.9★
- O Hobbit / J.R.R. Tolkien / 310 pág / 4.7★
- O Silmarillion / J.R.R. Tolkien / 365 pág / 4.4★

---

### Tela 5 — Detalhe do Livro

Tela de maior densidade. **O Senhor dos Anéis**.

**Hero (220px):** capa do livro (50% da largura, centralizada) com sombra difusa. Fundo: gradiente do tom da capa → `background`. Abaixo da capa: título "O Senhor dos Anéis" 22px bold, "J.R.R. Tolkien" em `text-secondary`.

**Chips de gênero:** "Fantasia" e "Aventura" — fundo `accent-muted`, texto `accent`, border-radius 9999px, 13px.

**Linha de rating:** `★★★★★ 4.9` · "3 avaliações".

**CTA:** botão "Registrar leitura" primário largura total.

**Sinopse:** título "Sinopse", 3 linhas colapsadas + "ver mais" em `accent`.

**Seção "Resenhas (3)":** separador + dois ReviewCards somente leitura:
- Card 1: Avatar Ana Lima + "Ana Lima" bold + "@ana_leitora" `text-muted` + "há 3 dias". Linha `★★★★★`. Texto: "Uma obra-prima absoluta. Tolkien construiu um mundo tão rico e detalhado que parece real."
- Card 2: Avatar Bruno + "Bruno Carvalho" + "@bruno_books" + "há 1 semana". `★★★★★`. Texto: "A jornada de Frodo é emocionante do começo ao fim."

Botão "Ver todas as resenhas" outline largura total. **Sem ícones de curtir nos ReviewCards.**

---

### Tela 6 — Detalhe do Livro (já registrado)

Mesma tela do livro, mas com a leitura já registrada pelo usuário.

**Diferença no CTA:** no lugar do botão "Registrar leitura", mostrar um banner de status:
- Badge "Lido" em `success` com ícone `CheckCircle` pequeno à esquerda.
- `★★★★★` (5 estrelas preenchidas) à direita do badge.
- Botão "Editar leitura" outline abaixo, menor (altura 40px).

Resto da tela igual à Tela 5.

---

### Tela 7 — Modal de Registro de Leitura

Bottom sheet sobrepondo a tela de detalhe. A tela por baixo visível com overlay escuro (rgba 0,0,0,0.6).

**Handle:** barra 40×4px `border` centralizada no topo. Sheet: fundo `surface`, border-radius 20px no topo, padding 20px.

**Cabeçalho do sheet:** "O Senhor dos Anéis" 15px semibold + "J.R.R. Tolkien" `text-muted` 13px.

**Seletor de status (3 chips em linha, largura igual):**
- "Quero ler" — inativo: fundo `surface-high`, texto `text-secondary`
- "Lendo" — inativo: mesmo
- "Lido" — **ativo**: fundo `accent`, texto branco

**Rating** (visível com "Lido"): label "Sua avaliação" + 5 estrelas grandes (28px) todas preenchidas `accent`.

**Resenha** (visível com "Lido"): label "Resenha (opcional)", textarea 4 linhas fundo `surface-high`, placeholder "Conte o que achou...". Contador "124 / 2000" à direita em `text-muted`.

**Checkbox:** `[ ] Contém spoilers` — borda `border`, fundo `surface-high`.

**Ações:** botão "Salvar" primário largura total. Abaixo, "Remover registro" em `error` sem fundo, centralizado. Abaixo disso, botão "Compartilhar leitura" em `text-secondary` com ícone `Share2` prefixado — aparece apenas quando status = "Lido" e rating preenchido.

---

### Tela 7b — Card de Compartilhamento de Leitura

Estado do Modal após tocar em "Compartilhar leitura": o bottom sheet revela um card visual gerado no app, pronto para salvar ou compartilhar.

**Layout do sheet** (mesmo container da Tela 7, mas com conteúdo diferente): handle no topo + título "Compartilhar leitura" 17px semibold centralizado.

**Card gerado** (fundo `surface`, border-radius 16px, padding 20px, sombra difusa, centralizado no sheet):
- Capa do livro centralizada (100×150px, border-radius 8px, sombra).
- "O Senhor dos Anéis" 17px bold centralizado.
- "J.R.R. Tolkien" `text-secondary` 14px centralizado.
- 5 estrelas grandes (24px) em `accent` centralizadas.
- Separador `border` fino.
- "@ana_leitora" em `text-muted` 13px à esquerda + "Movel" em `accent` 13px bold à direita, na mesma linha.

**Dois botões abaixo do card:**
- "Salvar na galeria" primário largura total com ícone `Download`.
- "Compartilhar" outline largura total com ícone `Share2`.

---

### Tela 8 — Perfil

Vitrine pessoal. Sem elementos sociais.

**Sem header de tela** — a identidade do usuário é o header. Avatar 80px centralizado. "Ana Lima" 20px bold + "@ana_leitora" `text-muted` 15px + bio `text-secondary` 14px, tudo centralizado.

**Stats em 3 colunas:** número 20px bold + label `text-muted` 13px:
- **47** lidos
- **3** lendo
- **12** quero ler

Cada contador é tocável (sublinhado sutil ou toque visual).

**Botão "Editar perfil"** outline `accent`, largura total.

**Abas internas:** "Leituras" (ativa, underline `accent`) | "Listas". Sem aba de "Seguindo" ou "Seguidores".

**Conteúdo da aba Leituras:** 3 BookCards verticais com badge de status à direita:
- *O Senhor dos Anéis* — badge "Lido" `success`
- *Duna* — badge "Lido" `success`
- *Sapiens* — badge "Lendo" `warning`

---

### Tela 9 — Editar Perfil

**Header:** botão `←` + título "Editar perfil" + botão "Salvar" em `accent` à direita.

**Avatar:** 96px centralizado + badge `Camera` no canto inferior direito (círculo `accent`, ícone branco 16px).

**Campos** (label acima em `text-secondary` 13px):
- Nome completo: "Ana Lima"
- Bio: textarea 3 linhas, "Apaixonada por fantasia e ficção científica." + contador "44 / 150"
- URL do avatar: campo com ícone `Link` prefixado + label auxiliar "URL de uma foto de perfil" em `text-muted` 13px

---

### Tela 10 — Listas

**Header:** título "Minhas Listas" + botão `+` à direita (círculo `accent` com ícone `Plus`).

**Cards de lista** (fundo `surface`, border-radius 12px, padding 16px):
- Linha superior: título semibold + badge de contagem ("2 livros") fundo `surface-high`.
- Grade de thumbnails: 3–4 capas 40×60px em sobreposição leve (-8px margin).
- Descrição em `text-muted` 13px, 1 linha.
- Ícone `Trash2` em `text-muted` alinhado ao topo direito.

Listas:
1. "Melhores Fantasias" — 2 livros — "Os livros de fantasia que mais me marcaram."
2. "Para Ler em 2025" — 3 livros — "Minha lista de metas de leitura."

---

### Tela 11 — Detalhe da Lista

**Header:** botão `←` + "Melhores Fantasias" + ícone `Edit` à direita.

**Metadado:** "2 livros" · descrição "Os livros de fantasia que mais me marcaram." em `text-secondary`.

**Botão "Adicionar livro":** outline `accent`, largura total, ícone `Plus`.

**Lista reordenável** (gap 12px entre itens):
Cada item — fundo `surface`, border-radius 12px, padding 12px:
- `GripVertical` à esquerda em `text-muted` 20px (handle de drag).
- Capa 50×75px.
- Coluna: título semibold + autor `text-secondary` 13px.
- `Trash2` à direita em `text-muted`.

Mostrar o **item 1 com elevação sutil** (fundo `surface-high`) sugerindo que está sendo arrastado.

Itens: O Senhor dos Anéis / Duna.

---

### Tela 12 — Estatísticas

**Header:** título "Estatísticas".

**Cards de destaque (3 colunas**, fundo `surface`, border-radius 12px, padding 12px):
- **47** / livros lidos
- **12.840** / páginas
- **★ 4.6** / média

**Gráfico "Livros por mês (2026)":** barras verticais em `accent` com height proporcional ao maior valor (Mai = 7 = 100%). Valores no topo em `text-secondary` 11px. Labels abaixo em `text-muted` 11px. Construir com divs — sem bibliotecas externas.
- Jan 3 · Fev 5 · Mar 4 · Abr 6 · Mai 7 · Jun 3

**Gêneros favoritos:** cada linha — nome à esquerda + contagem à direita `text-muted`; barra de progresso abaixo (fundo `surface-high`, preenchimento `accent`).
- Fantasia 18 (100%) · Literatura Brasileira 12 (67%) · Ficção Científica 9 (50%) · Não-Ficção 5 (28%)

**Botão "Meu ano em livros"** primário no rodapé.

---

### Tela 13 — Resumo Anual

O card compartilhável. Deve parecer um pôster digno de screenshot.

**Layout da tela:** fundo `background`. Título "Meu 2026" na tela + "Toque para compartilhar" `text-muted`. O card ocupa a maior parte. Dois botões abaixo.

**Card** (fundo `surface`, border-radius 20px, sombra intensa, padding 24px):
- Logo "Movel" + `BookOpen` em `accent` 14px no topo.
- Capa do livro favorito centralizada e grande (120×180px), sombra, border-radius 8px.
- Label "livro favorito" `text-muted` 11px uppercase.
- "O Senhor dos Anéis" 17px bold + "J.R.R. Tolkien" `text-secondary` 14px.
- Separador `border`.
- Grid 2×2 (fundo `surface-high`, border-radius 12px, padding 12px cada):
  - **47** lidos | **12.840** páginas
  - **Fantasia** gênero fav. | **J.R.R. Tolkien** autor fav.
  - (valor 20px bold, label 11px `text-muted`)
- Rodapé: `★★★★½ 4.6` em `accent` · "@ana_leitora" `text-muted`.

**Botões:**
- "Salvar na galeria" primário largura total com ícone `Download`.
- "Compartilhar" outline largura total com ícone `Share2`.
