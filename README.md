# Chronos Temporal Control Interface

Frontend for the Chronos configuration service: browse time machine configurations, inspect their parts, and change part status.

## Setup

```
cp .env.example .env.local   # fill in CHRONOS_API_URL and CHRONOS_API_KEY
npm install
npm run dev
```

`npm test`, `npm run lint`, `npm run build` also available.

## Design decisions

- **Drill-down navigation.** Configurations form a tree and every root configuration uses the same part, so a sidebar tree shows many identical rows. Instead you open a configuration, see its part and its children, and go deeper. A breadcrumb of configurations goes back up.
- **Position in the URL hash** (`#/<uuid>/<uuid>`): back, reload and shared links work. The API cannot fetch a configuration by UUID, so each UUID is resolved from its parent's child list (cached).
- **TanStack Query** for server state: parts are cached by UUID (shared by every configuration using them), children are fetched only when a configuration is opened, and a part update is written straight into the cache so every view updates.
- **Part vs configuration.** The status and unit modals warn that changes apply everywhere the part is used. "Where else is this part used?" crawls one machine (the API has no search by part) and reports usage count and total quantity.
- **Status changes** only offer transitions the API allows, behind a plain-language confirmation. If the server rejects a change, the allowed list is refreshed from its response.
- **Errors**: normalized in `src/api/client.ts`, shown inline with Retry, plus an error boundary and an API health banner.
- **Domain logic** (`src/domain`, `src/navigation/path.ts`) is pure and unit tested.

## Optional features (URL flag)

Features that cost extra API calls are off by default. Enable with `?features=usage`:

- `usage`: "Where else is this part used?" crawls the machine (about one request per parent) and links to each use.

Add `?debug=true` (dev server only) to show the React Query devtools.

The API health banner (one `/api/health` request per minute) is always on.

## Caveats

- The API key is read at build time and ships in the browser bundle. Fine for this challenge, not for production; use a backend proxy.

## What I'd do next

- More component tests (navigation UI, usage crawl).
- Pagination/virtualization if lists grow.
