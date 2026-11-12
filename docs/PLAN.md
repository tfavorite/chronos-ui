# Implementation plan

Read with `docs/api/README.md` (API shapes + observed data). Work one phase per session and `/clear` between phases. Check off items as they land.

## Stack

- Vite + React + TypeScript (`npm create vite@latest . -- --template react-ts`)
- TanStack Query v5 for all server state. No other state library; UI state lives in `useState`.
- Mantine for UI: `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`. Use its components (AppShell, Badge, Button, Select, Modal, Alert, Loader, TextInput) and its style props; use a CSS module only when Mantine has no prop for it.
- Don't use Mantine's `Tree`: it expects all the data up front, which fights per-node lazy queries. Build a small recursive `ConfigNode` from Mantine primitives (`UnstyledButton`, `Collapse`, `Group`).
- Vitest + React Testing Library for tests. Mock `fetch` directly; no MSW.
- `vite.config.ts`: `envPrefix: 'CHRONOS_'`
- Delivery: repo + `npm install && npm run dev`. No deploy (the API key ships in the bundle).

## Layout

```
┌───────────────────────────────────────────────────────────────┐
│ Chronos Temporal Control        [ Find end unit: 000__ ]      │
├──────────────────────────────┬────────────────────────────────┤
│ ▾ SN 00001  TM-1000 Time M.. │ TM-1020 · Power Cell           │
│   ▸ TM-1130 Time Control  x1 │ Time Machine › Safety System   │
│   ▾ TM-1210 Safety System x1 │                                │
│     • TM-1020 Power Cell  x4 │ Status  [active]  [Change ▾]   │
│     • TM-1020 Power Cell  x1 │ Unit    pcs                    │
│ ▸ SN 00002                   │ Qty here 4 pcs                 │
│                              │ ⚠ Shared part: 2 uses shown    │
└──────────────────────────────┴────────────────────────────────┘
```

- Left: end units (roots). Each one expands lazily into its configuration tree.
- Right: details for the selected configuration's part, plus actions.
- Selecting a row highlights every loaded row that uses the same part. That shows the part/config distinction visually.

## Phases

### 1. Scaffold
- [ ] Vite react-ts template, TanStack Query, Vitest + RTL + jsdom
- [ ] `envPrefix: 'CHRONOS_'`, typed `import.meta.env` in `src/vite-env.d.ts`
- [ ] Mantine setup per its Vite guide: `postcss-preset-mantine` + `postcss-simple-vars`, `postcss.config.cjs`, import `@mantine/core/styles.css` and `@mantine/notifications/styles.css`
- [ ] `main.tsx`: `MantineProvider` (with `<Notifications />`) wrapping `QueryClientProvider`; React Query Devtools in dev only
- [ ] Test setup: wrap renders in a `renderWithProviders` helper; add the `matchMedia` and `ResizeObserver` stubs Mantine needs in jsdom
- [ ] Update `CLAUDE.md` with dev/build/lint/test/single-test commands

### 2. API layer (`src/api/`)
- [ ] `types.ts`: `Part`, `PartStatus`, `Configuration`, `AllowableStatuses`
- [ ] `client.ts`: `request<T>(path, init)` adds the `x-api-key` header, parses JSON, and throws `ApiError { status, message, allowableStatuses? }`
- [ ] Normalize all three error shapes: `{error: string}`, `{message}`, and the Zod `{error: {message}}`. Network failure is status 0 with a friendly message.
- [ ] Functions: `getRootConfigs`, `getChildConfigs(parentUuid)`, `getPart(uuid)`, `getAllowedStatuses(uuid)`, `updatePart(uuid, body)`
- [ ] Unit tests for `request` error normalization

### 3. Query hooks (`src/api/queries.ts`)
- [ ] Key factory: `['configs', 'roots']`, `['configs', 'children', parentUuid]`, `['part', uuid]`, `['part', uuid, 'allowed']`
- [ ] `useRootConfigs`, `useChildConfigs(uuid, enabled)`, `usePart(uuid)`, `useAllowedStatuses(uuid)`
- [ ] Parts and configs: `staleTime` 5 min. Allowed statuses: `staleTime: 0` (they depend on relationships).
- [ ] Retry: none on 4xx, up to 2 on 5xx/network
- [ ] `useUpdatePart`: on success, `setQueryData(['part', uuid], updated)` and invalidate `['part']` allowed queries (one part's change can affect others' transitions)

### 4. Tree navigation
- [ ] `EndUnitList`: roots sorted by serial, with a filter box to find a serial
- [ ] `ConfigNode`: row shows part no, name, `×qty unit`, status badge. Children are fetched only once the row is expanded (`enabled: expanded`).
- [ ] Each row has its own loading spinner and an inline error with a Retry button. An empty result becomes a leaf (no chevron after load).
- [ ] Rows are keyed by config UUID (the same part can appear twice under one parent)
- [ ] Accessibility: `role="tree"`/`treeitem`, `aria-expanded`, arrow-key navigation, visible focus. Large tap targets (techs, possibly gloves/tablets).
- [ ] Track selection as `{ configUuid, partUuid, path: Part names[] }` in `App`

### 5. Part details + status change
- [ ] `PartPanel`: part no, name, status, unit, quantity in this config, breadcrumb path
- [ ] Status change: fetch allowed statuses when the panel opens and show them as buttons/select, excluding the current status. If none are allowed, say "This part's status is locked" instead of rendering an empty control.
- [ ] Confirm step in plain language: "Change TM-1020 Power Cell from active to deprecated? This updates the part everywhere it is used, including other time machines."
- [ ] On 400 "Invalid status change": show the message and refresh the allowed list from the error's `allowableStatuses`
- [ ] Confirm in a Mantine `Modal`. Success/failure toasts via `notifications.show`. On error, the panel stays usable with the old value shown.
- [ ] Short status descriptions in a tooltip or legend (technicians have little training)

### 6. Relationship visualization
- [ ] Same-part highlight across loaded rows, plus "Used N times in loaded trees" in the panel
- [ ] Tree guide lines (indent connectors) so depth reads at a glance
- [ ] "Expand all" per end unit (trees are ~26 nodes, so this is cheap)
- [ ] Stretch: total quantity of the selected part in this machine (product of quantities along each path, summed)

### 7. Polish + docs
- [ ] App-level error boundary; health-check banner if the API is unreachable or the key is wrong (403)
- [ ] One `statusMeta` map (Badge color + label + plain-language description per status); text is always shown, never color alone
- [ ] Stretch: unit editing (PUT supports `unit`)
- [ ] README: setup, `.env.example`, design decisions (why TanStack Query, lazy tree, shared-part warning, key-in-bundle caveat), what I'd do next

## Budget notes ($20 key, Sonnet 5.5)

- Check spend after phase 1: `curl $HOST/budget -H "Authorization: Bearer <key>"`. Over ~$1.50 means caching isn't working, so switch small edits to Haiku.
- Don't re-read `openapi.json`; `docs/api/README.md` has everything.
- No subagents.
