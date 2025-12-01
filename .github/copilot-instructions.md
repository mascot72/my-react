# Copilot Instructions for this Repo

Purpose: Give AI agents the minimum, project-specific context to ship correct code fast.

## Big Picture
- Stack: React 18 + TypeScript + Vite. UI follows a hybrid FSD + Atomic structure under `src/components` and `src/features` (see `src/shared/docs/FSD-ATOMIC.md`).
- Routing: React Router v7 is present. The active app uses standard `<Routes>` in `src/routes/Routes.tsx`. An experimental file-based config using `@react-router/dev` exists in `src/routes/index.ts` and `react-router.config.ts` but is disabled in `vite.config.ts`.
- State: Redux Toolkit + RTK Query. Canonical store is `src/app/store.ts` (exports `store`, `RootState`, `AppDispatch`).
- Backend: Local Express API in `server/index.ts` on port 5000 (todos + mock login). Vite dev server proxies `/api` → `http://localhost:5000`.
- Build/serve: Vite builds the SPA; `server.js` serves the built `dist` folder on port 3000.

## Day-1 Commands
- Dev (frontend): `pnpm dev`
- Dev (API): `pnpm dev:server` (watches `server/**/*.ts`)
- Build SPA: `pnpm build`
- Preview SPA: `pnpm preview`
- Serve built SPA: `node server.js`
- React Router dev (experimental): `pnpm dev2` (requires enabling `reactRouter()` in `vite.config.ts`)

## Routing Conventions
- Primary router lives in `src/routes/Routes.tsx` and mounts under shared layout components:
  - Shell: `components/organisms/Layout`
  - Secondary template area: `components/templates/MainTemplate`
- Example (add a page):
  1) Create `src/pages/MyFeature.tsx`.
  2) Add `<Route path='/my-feature' element={<MyFeature/>} />` in `Routes.tsx` under the appropriate layout.
- Protected routes: wrap elements with `src/app/ProtectionRoute` (checks auth token via `useAuth`).

## Auth Pattern
- Context provider: `src/app/AuthProvider.tsx` exposes `{ token, login, logout }` and posts to `/api/login`.
- Guard: `ProtectionRoute` redirects to `/login` when `token` is falsy.
- When gating a new page, use:
  ```tsx
  <Route path='/secure' element={<ProtectedRoute><SecurePage/></ProtectedRoute>} />
  ```

## State & Data (RTK Query)
- API slice: `src/features/user/apiSlice.ts` uses an axios base query; current base is `http://localhost:5000/api`.
- Common endpoints: `fetchTodos`, `addTodo`, `updateTodo`, `deleteTodo`, `fetchUser`.
- Usage example:
  ```tsx
  const { data: todos, isLoading } = useFetchTodosQuery();
  const [addTodo] = useAddTodoMutation();
  ```
- Classic Redux slices live in `src/features/*/slice.ts` (e.g., `auth/slice.ts`, `user/slice.ts`). Prefer `src/app/store.ts` for typing (`AppDispatch`).

## Paths & Imports
- Aliases (Vite + TS): `@` → `src`, `@components` → `src/components` (see `vite.config.ts`, `tsconfig.path.json`).
- Prefer absolute imports: `import Button from '@components/atoms/Button'`.

## API & Dev Server
- Express API: `server/index.ts` mounts at `/api` with mock login and CRUD for todos.
- Vite proxy: requests to `/api/**` from the browser go to `http://localhost:5000` in dev.
- For RTK Query, current base URL bypasses the proxy intentionally; keep consistent unless you switch to relative `/api`.

## UI Structure Hints
- Atomic: atoms/molecules/organisms/templates live under `src/components/**`.
- Domain visualizations (wafer/field maps, heatmaps) live under `components/atoms/fieldmap` and `components/molecules/*`.
- Styling mixes CSS modules (e.g., `*.module.css`), plain CSS, and `styled-components`; follow the local pattern within each folder.

## Deployment
- Build with `pnpm build` → outputs `dist/`.
- Serve with `node server.js` (static express server on port 3000).

References: `vite.config.ts`, `src/routes/Routes.tsx`, `src/app/store.ts`, `src/features/user/apiSlice.ts`, `server/index.ts`, `SETTING.md`. Ensure changes align with these patterns.