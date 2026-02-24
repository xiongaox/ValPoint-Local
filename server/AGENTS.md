# SERVER KNOWLEDGE BASE

**Scope:** `server/` subtree.

## OVERVIEW
Express backend serving REST endpoints, SQLite persistence, static runtime assets, upload processing, and external metadata proxying for the local deployment.

## STRUCTURE
```text
server/
|-- index.js            # App bootstrap, middleware, route mount, SPA fallback
|-- db.js               # SQLite init + schema/bootstrap
|-- routes/             # Domain route modules
`-- package.json        # Runtime dependencies and dev script
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Server startup and mounts | `server/index.js` | `/api/*`, `/data`, static `dist` serving |
| DB schema and location | `server/db.js` | `DATA_DIR` fallback and SQLite init |
| Lineup CRUD/export | `server/routes/lineups.js` | SQL operations, JSON fields, ZIP export |
| Upload/delete/import | `server/routes/upload.js` | multer/sharp pipeline, path safety checks |
| External author lookup | `server/routes/proxy.js` | Bilibili proxy behavior |
| Stats API | `server/routes/stats.js` | Aggregate stats endpoint |

## CONVENTIONS
- Keep route files responsibility-focused (`lineups`, `upload`, `proxy`, `stats`).
- Preserve JSON field encoding/decoding conventions for `agent_pos` and `skill_pos` in lineup records.
- Respect `DATA_DIR` environment override; default remains local `../data`.
- Keep compatibility with frontend expecting `/data/images/...` URL format.

## ANTI-PATTERNS (SERVER)
- Do not relax filesystem safety checks for upload/delete operations.
- Do not serve runtime data from source folders; keep persistent artifacts under `data/`/`DATA_DIR`.
- Do not couple route logic to frontend build details beyond existing static mount and API contracts.

## COMMANDS
```bash
npm run server        # start backend
npm run server:dev    # watch mode backend
```

## NOTES
- Backend runs on `3209`; frontend proxy in `vite.config.ts` depends on this.
- `server/package.json` is intentionally separate from root package dependency graph.
