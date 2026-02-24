# FRONTEND KNOWLEDGE BASE

**Scope:** `src/` and descendants unless a nearer `AGENTS.md` exists.

## OVERVIEW
React + TypeScript frontend served by Vite. This layer owns map/agent browsing, lineup editing/viewing, and client-side orchestration around the local API.

## STRUCTURE
```text
src/
|-- features/lineups/      # Primary domain flow (controllers + composed views)
|-- components/            # Shared presentation components
|-- hooks/                 # Reusable state/effect hooks
|-- services/              # API/data-facing service wrappers
|-- data/                  # Local static datasets and overrides
|-- utils/                 # Pure helpers (formatting/icon mapping/class merge)
|-- types/                 # Shared frontend contracts
`-- lib/                   # Import/download/image helper modules
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App bootstrap | `src/main.tsx`, `src/App.tsx` | Root render chain |
| Domain orchestration | `src/features/lineups/useAppController.ts` | Coordinates hooks/controllers |
| View composition | `src/features/lineups/MainView.tsx`, `src/features/lineups/AppModals.tsx` | Main layout + modal wiring |
| Shared state hooks | `src/hooks/` | Modal, filtering, device, download, user/profile state |
| API calls | `src/services/lineups.ts`, `src/services/mapPoolService.ts` | `/api` contract layer |
| Static game data | `src/data/localAgents.ts`, `src/data/localMaps.ts`, `src/data/ability_overrides.json` | Local fallbacks/overrides |

## CONVENTIONS
- Keep user-facing strings consistent with existing Chinese UI copy in nearby files.
- Prefer hook/controller composition over adding more state to page components.
- Preserve URL-state sync flow in `useAppController` when adding map/agent/lineup navigation fields.
- Use existing utility modules (`utils/`, `lib/`) before introducing new helper locations.

## ANTI-PATTERNS (FRONTEND)
- Do not edit generated assets in `dist/`; frontend source of truth is `src/` and `public/`.
- Do not bypass service wrappers with scattered `fetch` calls when an existing service file already owns the endpoint.
- Do not collapse controller layering into a single mega-component; extend current controller hooks.

## COMMANDS
```bash
npm run dev       # Vite dev server (3210)
npm run build     # TypeScript check + production bundle
npm run preview   # Serve built frontend
```

## NOTES
- TS strict mode is enabled globally; keep explicit null handling at boundaries.
- Nearest-child override exists for lineup domain: `src/features/lineups/AGENTS.md`.
