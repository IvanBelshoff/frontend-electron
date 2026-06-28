# DataDash Admin (Electron)

Portal de administração de dashboards — Electron + React + TypeScript.

## Pré-requisitos

- Node.js 22+
- Backend [`backend-nest-js`](../backend-nest-js) rodando em `http://localhost:3000`

## Setup

```bash
cd frontend-electron
npm install
cp .env.example .env
```

Configure no backend (`backend-nest-js/.env`):

```env
CORS_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

## Desenvolvimento

```bash
npm run dev
```

Abre o Vite em `http://localhost:5173` e lança o Electron automaticamente.

## Build

```bash
npm run build
```

Gera instaladores em `release/` para Windows, macOS e Linux via electron-builder.

## Autenticação

1. `POST /auth/login` com `{ email, senha }`
2. Access token em memória + `safeStorage` (criptografado pelo SO)
3. Refresh automático via cookie `refresh_token` (`credentials: include`)
4. `POST /auth/logout` limpa sessão

Credenciais padrão (seed do backend): `admin@example.com` / `ChangeMe123`

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API NestJS |
| `VITE_REGRAS_PERMISSOES` | JSON de roles → permissões (copiar do backend) |

## Segurança (Electron)

Em builds de produção:

- DevTools desabilitado
- Atalhos de inspeção bloqueados
- `contextIsolation`, `sandbox` e preload tipado

## Estrutura

```
src/
  components/ui/   # Componentes reutilizáveis (Tailwind)
  features/auth/   # Auth, API e store
  layouts/         # AuthLayout, AppShell
  pages/           # Telas
  router/          # TanStack Router (hash)
electron/          # Main process + preload
```
