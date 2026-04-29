# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript app.

- `src/`: application source
- `src/components/`: reusable UI components
- `src/pages/`: route-level page components
- `src/data/`: local content/data modules
- `src/assets/`: bundled assets imported by code
- `public/`: static files served directly (e.g., `public/backgrounds`, `public/musics`)
- `scripts/`: Node `.cjs` utilities for content/data tasks
- `dist/`: production build output (generated)

Keep feature code close to usage (page + related components/data), and avoid dumping new logic into `App.tsx`.

## Build, Test, and Development Commands
- `npm run dev`: start local dev server with hot reload.
- `npm run build`: type-check with `tsc -b` and create production bundle in `dist/`.
- `npm run preview`: serve the production build locally for smoke testing.
- `npm run lint`: run ESLint across the repository.

Example workflow:
1. `npm run lint`
2. `npm run build`
3. `npm run preview`

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts`/`.tsx`), ES modules.
- Indentation: 2 spaces; keep lines readable and avoid deeply nested JSX.
- Components/pages: `PascalCase` filenames and exports (e.g., `JournalPage.tsx`).
- Hooks/helpers: `camelCase` (e.g., `useZenMode.ts`, `formatDate.ts`).
- Prefer functional components, explicit prop types, and small composable UI units.
- Use ESLint as the source of truth before opening a PR.

## Testing Guidelines
There is currently no dedicated automated test framework configured in `package.json`.

For now, treat quality gates as:
- `npm run lint` must pass.
- `npm run build` must pass.
- Manual verification in `npm run dev`/`npm run preview` for changed pages, routing, media playback, and performance-sensitive UI.

If adding tests, prefer Vitest + React Testing Library and colocate tests as `*.test.ts(x)`.

## Commit & Pull Request Guidelines
Follow the existing Conventional Commit style seen in history:
- `feat: ...`
- `fix: ...`
- `perf: ...`

PRs should include:
- concise summary of user-visible change
- affected paths/modules
- verification steps run (`lint`, `build`, manual checks)
- screenshots/video for UI changes (especially backgrounds/animations)
