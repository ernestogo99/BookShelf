#!/usr/bin/env bash
# Sobe o servidor, importa o catálogo de livros e gera dados falsos.
# Os scripts rodam localmente contra o banco exposto na porta 5432.
#
# Uso:
#   ./setup.sh                        # usa books_sample.json + 15 usuários
#   ./setup.sh livros.json            # usa arquivo customizado + 15 usuários
#   ./setup.sh livros.json --users 30 # arquivo customizado + 30 usuários
#   ./setup.sh --clean                # derruba tudo, reconstrói e repovoa

set -euo pipefail

BOOKS_FILE="books_sample.json"
FAKE_USERS=15
CLEAN=false

# ── Parsing de argumentos ─────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --users)  FAKE_USERS="$2"; shift 2 ;;
    --clean)  CLEAN=true; shift ;;
    *.json)   BOOKS_FILE="$1"; shift ;;
    *)        echo "Argumento desconhecido: $1"; exit 1 ;;
  esac
done

if [ ! -f "$BOOKS_FILE" ]; then
  echo "Erro: arquivo de livros '$BOOKS_FILE' não encontrado."
  echo "Coloque um JSON do Skoob na raiz do projeto ou passe o caminho como argumento."
  exit 1
fi

# ── .env ──────────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "Criando .env a partir de .env.example..."
  cp .env.example .env
  echo "  Edite .env e defina SECRET_KEY antes de continuar."
  echo "  Depois rode ./setup.sh novamente."
  exit 0
fi

# ── Dependências locais ───────────────────────────────────────────────────────
uv sync --all-extras --quiet

# ── Docker Compose ────────────────────────────────────────────────────────────
if [ "$CLEAN" = true ]; then
  echo "Derrubando containers e volumes..."
  docker compose down -v
fi

echo "Subindo containers..."
docker compose up -d --build

# ── Aguarda API ───────────────────────────────────────────────────────────────
echo "Aguardando API iniciar..."
RETRIES=30
until curl -sf http://localhost:8000/ > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "Timeout: API não respondeu. Verifique: docker compose logs api"
    exit 1
  fi
  sleep 2
done
echo "API pronta."

# ── Importação de livros ──────────────────────────────────────────────────────
echo ""
echo "Importando livros de '$BOOKS_FILE'..."
uv run python import_books.py "$BOOKS_FILE"

# ── Dados falsos ──────────────────────────────────────────────────────────────
echo ""
CLEAN_FLAG=""
[ "$CLEAN" = true ] && CLEAN_FLAG="--clean"
echo "Gerando $FAKE_USERS usuários falsos..."
uv run python fake_data.py --users "$FAKE_USERS" $CLEAN_FLAG

# ── Resumo ────────────────────────────────────────────────────────────────────
echo ""
echo "Tudo pronto!"
echo "  API:           http://localhost:8000"
echo "  Documentação:  http://localhost:8000/docs"
echo "  Senha dos usuários falsos: senha123"
