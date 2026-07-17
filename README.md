# DataDash Admin (Electron)

Portal de administração de dashboards — Electron + React + TypeScript.

## Pré-requisitos

- Node.js 22+
- Backend [`backend-nest-js`](../backend-nest-js) rodando na mesma máquina

## Setup

```bash
cd frontend-electron
npm install
cp .env.example .env
```

Configure o IP da máquina no `.env` (mesmo valor em ambos os projetos):

```env
VITE_HOST_IP=10.27.6.161
VITE_DEV_PORT=5173
VITE_API_URL=http://10.27.6.161:3000
```

No backend (`backend-nest-js/.env`):

```env
HOST_IP=10.27.6.161
CORS_ORIGIN=http://10.27.6.161:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

## Desenvolvimento

```bash
npm run dev
```

O Vite sobe em `http://<VITE_HOST_IP>:5173` e o Electron abre essa mesma URL.

**Importante:** acesse o app pelo IP configurado (`http://10.27.6.161:5173`), **não** por `localhost:5173`. O refresh token HttpOnly exige que frontend e API compartilhem o mesmo site (mesmo IP). `localhost` e `10.x.x.x` são sites distintos para o navegador.

## Build

Feche o app **DataDash Admin** e pare `npm run dev` antes de buildar (evita bloqueio de `app.asar` no Windows).

```bash
npm run build
```

Gera instaladores em `release-build/` para Windows, macOS e Linux via electron-builder.
No Windows, o instalador `.exe` fica em `release-build/DataDash Admin Setup *.exe`.

> **Fase 2:** o build empacotado usa `file://`, onde cookies HttpOnly não funcionam. Será necessário servidor HTTP local ou URL remota no Electron empacotado.

## Autenticação

1. `POST /auth/login` com `{ email, senha }`
2. Access token em memória + `safeStorage` (criptografado pelo SO)
3. Refresh automático via cookie HttpOnly `refresh_token` (`credentials: include`)
4. `POST /auth/logout` limpa sessão

Credenciais padrão (seed do backend): `admin@example.com` / `ChangeMe123`

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_HOST_IP` | IP da máquina na rede local (origem do frontend) |
| `VITE_DEV_PORT` | Porta do Vite em dev (default 5173) |
| `VITE_API_URL` | URL base da API NestJS (mesmo IP de `VITE_HOST_IP`) |
| `VITE_REGRAS_PERMISSOES` | JSON de roles → permissões (copiar do backend) |

## Preferências locais (localStorage)

| Chave | Descrição |
|-------|-----------|
| `datadash.apiUrl` | URL base da API (override do `.env`) |
| `datadash.theme` | `system`, `dark` ou `light` |
| `datadash.accentColor` | Cor primária em hex |

Na tela **Configurações**, a URL do backend exige **Validar** (`GET /`) antes de **Salvar**. A URL deve usar o mesmo hostname/IP da página.

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
