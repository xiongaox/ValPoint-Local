# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-24 17:33 Asia/Shanghai
**Commit:** 2743ccc
**Branch:** main

## OVERVIEW
ValPoint-Local is a private-deployment Valorant lineup manager. Frontend is React + Vite + TypeScript (`src/`), backend is Express + SQLite + file storage (`server/`, `data/`).

## STRUCTURE
```text
./
|-- src/                    # Frontend app and feature logic
|-- server/                 # REST API, DB bootstrap, upload/proxy/stats routes
|-- data/                   # Runtime state: SQLite DB + uploaded images
|-- scripts/                # Release/data maintenance scripts
|-- .github/workflows/      # Docker and release pipelines
|-- public/                 # Static source assets (copied at build)
`-- dist/                   # Build output (generated)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Frontend bootstrap | `src/main.tsx`, `src/App.tsx` | App entry and root composition |
| Lineup UI behavior | `src/features/lineups/` | Controllers + view/model glue |
| API server startup | `server/index.js` | Middleware, static serving, route mount |
| Lineup CRUD/export | `server/routes/lineups.js` | SQLite reads/writes + ZIP export |
| Upload/zip import | `server/routes/upload.js` | Image pipeline, path safety, zip import |
| DB schema/runtime storage | `server/db.js`, `data/` | SQLite + `/data/images` filesystem |
| Build/dev wiring | `package.json`, `vite.config.ts` | Scripts, proxies, chunk strategy |
| CI/release | `.github/workflows/*.yml`, `scripts/release.js` | Docker multi-arch + tag-based release |

## CONVENTIONS
- TypeScript runs in strict mode (`tsconfig.json`), 2-space indentation (`.editorconfig`).
- Vite dev server is fixed at `3210`, API/data proxy target is backend `3209` (`vite.config.ts`).
- Frontend display text and many route comments are Chinese; preserve existing language context per file.
- Backend serves `/data` as static runtime content and persists under `DATA_DIR` (defaults to `../data`).
- `public/` is static source; `dist/` is build artifact from `npm run build`.

## ANTI-PATTERNS (THIS PROJECT)
- Do not treat `dist/` as source of truth; edit `src/` and `public/` only.
- Do not bypass upload/delete path guards; file operations must stay inside `/data/images/...`.
- Do not mix runtime user data edits into source files; persistent data belongs in `data/`.
- Do not assume lint/test gates exist in CI; verify changes manually with build/runtime checks.

## UNIQUE STYLES
- Frontend state orchestration uses hook-controller layering (not page-level monoliths) in `src/features/lineups/controllers/`.
- Release flow is tag-driven and Docker Hub-aware (`scripts/release.js` queries remote tags).
- Docker workflow supports `[skip docker]` in tag message to skip image build.

## COMMANDS
```bash
npm run dev                 # frontend dev server (3210)
npm run server:dev          # backend watch mode (3209)
npm run build               # tsc + vite build
npm run preview             # preview built frontend
npm run docker:build        # build production image
npm run release             # interactive tag/release helper
```

## NOTES
- `README.md` mentions `npm run client`, but no such script exists in `package.json`.
- LSP TypeScript server is not installed in this environment; symbol mapping used AST/grep fallback.
- Nearest `AGENTS.md` should be treated as local override for files inside its subtree.
