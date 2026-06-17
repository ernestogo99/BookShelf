# Backend

## Arquitetura

```
backend/
│
├── migrations/
│
├── src/
│   │
│   ├── models/
│   │   └── user.py
│   │
│   ├── routers/
│   │   └── user_router.py
│   │
│   ├── schemas/
│   │   └── user_schema.py
│   │
│   ├── services/
│   │   └── user_service.py
│   │
│   ├── config.py
│   │
│   ├── database.py
│   │
│   └── main.py
│
├── tests/
│
├── .env.example
│
├── .gitignore
│
├── .python-version
│
├── pyproject.toml
│
└── README.md
```

## Como rodar

```
uv run uvicorn src.main:app --reload
```
