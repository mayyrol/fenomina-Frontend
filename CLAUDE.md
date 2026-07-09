# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (Vite)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build locally
npx eslint src/      # Lint the source
```

No test runner is configured in this project.

## Environment Setup

Copy `.env.example` and configure two backend URLs:

```
VITE_API_URL=http://localhost:8081        # Auth service
VITE_MASTER_API_URL=http://localhost:8082 # Master data service
```

`.env.production` is gitignored; `.env.example` is tracked.

## Architecture

**Stack:** React 19 + Vite, JavaScript (no TypeScript), Zustand for state, React Router v7, Axios, lucide-react icons.

### Two Axios Instances

All API calls go through one of two Axios instances in [src/api/](src/api/):

- `axiosInstance.js` → `VITE_API_URL` (port 8081) — auth and user-scoped operations
- `masterAxiosInstance.js` → `VITE_MASTER_API_URL` (port 8082) — companies, employees, parameters

Both instances share the same pattern: Bearer token injected via request interceptor, 401 responses trigger automatic token refresh (via `VITE_API_URL/auth/refresh` — even for master instance), failed requests are queued during refresh, and on refresh failure the user is logged out and redirected to `/login`.

### Auth & Session

Auth state lives in [src/store/authStore.js](src/store/authStore.js) — a Zustand store persisted to localStorage (`accessToken`, `refreshToken`, `usuario`). The `usuario` object contains `rolUsuario`, `nombresUsuario`, `apellidosUsuario`, and `cargoUsuario`. Token auto-refresh runs on a timer started at login (fires 1 minute before expiry). The timer is managed in [src/utils/tokenRefresh.js](src/utils/tokenRefresh.js).

### Routing & Role-Based Access

[src/router/AppRouter.jsx](src/router/AppRouter.jsx) defines all routes. Protected routes are wrapped with [src/router/ProtectedRoute.jsx](src/router/ProtectedRoute.jsx), which checks token validity and enforces role requirements.

Role hierarchy: `SUPER_ADMIN > RRHH > AUDITOR > CLIENTE_EMPRESA`.

Admin-only routes: `/usuarios/*`, `/parametros`, and `/logs` (SUPER_ADMIN only). Company-scoped routes use the pattern `/empresas/:id/<module>/*`.

### Feature Modules

Business features live in [src/features/auth/pages/](src/features/auth/pages/) organized by domain:

- `LoginPage.jsx` — login form
- `LogsPage.jsx` — system audit logs (SUPER_ADMIN only)
- `usuarios/` — user management (CRUD)
- `parametros/` — general parameters (SUPER_ADMIN only)
- `empresas/` — company management, with nested sub-routes for:
  - `empleados/` — employee management (CRUD + status changes)
  - `nominas/` — payroll: list, novedades, liquidar, resultado, desprendibles, generar-reporte
  - `primas/` — bonuses: list, ver, liquidar, resultado, desprendibles, generar-reporte
  - `cesantias/` — severance: list, ver, liquidar, resultado, desprendibles, generar-reporte
  - `reportes/` — reports hub with sub-routes: provisiones, empleados/{nominas,primas,cesantias,conceptos,retencion}

The `EmpresaModulosPage` at `/empresas/:id` acts as a module selector hub for a company.

### Data Fetching Pattern

Each feature has custom hooks in `src/features/auth/hooks/`:
- `useEmpresas.js` — paginated company list with search
- `useEmpresasLista.js` — flat list of all companies (no pagination, used for selects)
- `useEmpleados.js` — paginated employee list filtered by `empresaId`, status tab (`activos`/`inactivos`/`retirados`), and document search
- `useUsuarios.js` — user list
- `useAccionesUsuario.js` — executes PATCH actions on users (activar/inactivar/etc.)

Hooks own: data, loading, error state, search/filter state, and local pagination over the full fetched dataset. Hooks call service functions from [src/services/](src/services/) which are thin wrappers around the axios instances:
- `empresasService.js` — empresa CRUD; creation/update uses multipart/form-data for logo uploads
- `empleadosService.js` — employee CRUD + status change + conceptos por empleado
- `parametrosService.js` — parameter CRUD
- `conceptoNominaService.js` — payroll concept catalog
- `contratoConceptoService.js` — employee contract concepts (CRUD per employee)

### Layout

Two layouts in [src/layouts/](src/layouts/):
- `AuthLayout.jsx` — wraps unauthenticated pages (login)
- `MainLayout.jsx` — collapsible sidebar (64 px collapsed / 220 px expanded) with role-filtered navigation items and an `<Outlet>` for page content

### Shared Components

[src/components/](src/components/) contains three reusable UI components:
- `ConfirmarCambiosModal.jsx` — confirmation dialog for destructive/save actions
- `MensajeModal.jsx` — generic feedback modal (success/error messages)
- `EstadoDropdown.jsx` — status selector dropdown

### Styling

Global CSS variables defined in [src/index.css](src/index.css). No CSS-in-JS — components use inline styles and global classes. Primary brand color: `#0B662A` (green), secondary active/hover: `#0E4E1E`. Font: Nunito (Google Fonts).

### Export Capabilities

PDF exports use `jsPDF` + `jspdf-autotable` + `html2canvas`; Excel exports use `xlsx`. These are used in payroll/bonus/severance report pages.
