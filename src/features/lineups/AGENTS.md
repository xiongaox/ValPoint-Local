# LINEUPS FEATURE KNOWLEDGE BASE

**Scope:** `src/features/lineups/` subtree.

## OVERVIEW
This is the core product module. It uses a controller-driven architecture to coordinate UI tabs, editor lifecycle, selection state, modal flows, deletion, filtering, and batch operations.

## STRUCTURE
```text
src/features/lineups/
|-- useAppController.ts        # Top-level orchestrator for lineup feature
|-- MainView.tsx               # Main feature view shell
|-- AppModals.tsx              # Modal composition layer
|-- lineupHelpers.ts           # Shared feature-level transforms/guards
|-- controllers/               # Focused controller hooks and prop builders
`-- components/                # Feature-specific UI pieces
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Global feature flow | `useAppController.ts` | URL sync, cross-hook coordination, download batch loop |
| Edit/save logic | `controllers/useEditorController.ts` | Validation, payload shaping, create/update branching |
| Delete/clear logic | `controllers/useDeletionController.ts` | Single/bulk delete and post-action refresh |
| View tab transitions | `controllers/useViewController.ts` | Tab semantics + selection reset behavior |
| Derived UI prop construction | `controllers/useMainViewProps.ts`, `controllers/useModalProps.ts`, `controllers/useUiProps.ts` | Prop assembly split by UI region |

## CONVENTIONS
- Keep controller hooks single-responsibility; add a new controller instead of overloading an existing one when concern boundaries diverge.
- Maintain existing reset invariants after save/delete/close (selected lineup, viewing lineup, placing mode, editor state).
- Preserve lineup payload mapping through `lineupHelpers.ts` (`toDbPayload`, title guards, empty-lineup factory).
- Reuse existing map/agent translation helpers rather than duplicating mapping tables.

## ANTI-PATTERNS (LINEUPS)
- Do not add network calls directly inside presentational components; keep side effects in controllers/hooks.
- Do not break URL deep-link restoration flow (`map`, `agent`, `lineup`) in `useAppController.ts`.
- Do not mutate lineup form state shape ad hoc; update `NewLineupForm` and helper constructors together.

## NOTES
- This module has the highest frontend orchestration density; prefer incremental changes with quick manual verification on both create and view tabs.
