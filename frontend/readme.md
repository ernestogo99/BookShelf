## Frontend

## Estrutura do projeto

```
/my-react-app
│── /assets
│
│── /src
│
│   ├── /pages          # Páginas principais da aplicação
│   ├── /routes         # Configuração das rotas da aplicação
│   ├── /shared         # Recursos compartilhados
│   │   ├── /components # Componentes reutilizáveis (botões, tabelas, inputs, etc.)
│   │   ├── /contexts   # Contextos do React (Context API)
│   │   ├── /interfaces # Tipagens e interfaces TypeScript
│   │   ├── /layout     # Layouts padrão (ex: com menu lateral, cabeçalho etc.)
│   │   ├── /services   # Serviços de API, requisições HTTP etc.
│   │
│
│   ├── App.tsx         # Componente principal da aplicação
│
│
│
│── package.json
│── tsconfig.json       # Configuração do TypeScript
│── .gitignore

```

## Como rodar

1. use o comando abaixo para instalar as dependências

```
npm install
```

2. use o comando abaixo para rodar a aplicação

```
npm run start
```
