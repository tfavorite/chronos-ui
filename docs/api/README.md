# Configuration Service API

Summary of `openapi.json` (fetched from `<API URL>/doc`; Swagger UI at `<API URL>/swagger`).

- Base URL: `CHRONOS_API_URL` in `.env.local` (ends in `/prod`)
- Auth: every request needs header `x-api-key: <CHRONOS_API_KEY>` (403 `{"message":"Forbidden"}` without it)
- CORS: `access-control-allow-origin: *`
- Errors are JSON `{ "error": string }` (API Gateway auth failures use `{ "message": string }`)

## Types

```ts
type PartStatus =
  | "configuration" | "active" | "draft" | "deprecated"
  | "obsolete" | "experimental" | "retired" | "recalled";

interface Part {
  uuid: string;
  partNo: string;      // e.g. "TM-1010"
  name: string;
  status: PartStatus;
  unit: string;        // free text, e.g. "pcs", "set", "m"
}

interface Configuration {
  uuid: string;
  partUuid: string;
  quantity: number;
  endUnitSerialNo?: string | null; // set on root configs (end units)
}

interface AllowableStatuses {
  partUuid: string;
  currentStatus: PartStatus;
  allowableStatuses: PartStatus[];
}
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ status: "ok", message: "API is running" }` |
| GET | `/api/configs/children?parentUuid=<uuid>` | `Configuration[]`. Omit `parentUuid` to get root configs (end units). 404 `Configuration not found` |
| GET | `/api/parts/{uuid}` | `Part`. 404 `Part not found` |
| PUT | `/api/parts/{uuid}` | Body `{ unit?, status? }` → updated `Part`. 400 `{ error: "Invalid status change", allowableStatuses }`, 404 |
| GET | `/api/parts/{uuid}/allowable-statuses` | `AllowableStatuses`. Depends on the part's relationships, so refetch after any status change |

## Implications for the UI

- A configuration only carries `partUuid`, so each tree node needs a part fetch. Cache parts by UUID and dedupe in-flight requests.
- No "get configuration by UUID" or "list all parts" endpoint. Navigation must start from roots and walk down.
- No endpoint says whether a config has children; you only know after fetching.
- A part PUT returns the new `Part`. Write it into the cache so every node using that part updates.
- Allowable statuses can change when related parts change, so don't cache them for long.

## Observed data (2026-11-11)

- 20 end units (SN `00001`–`00020`), all pointing at the same part `TM-1000 Time Machine`. Editing that part changes every end unit.
- SN 00001 has 26 nodes, depth 3, max fanout 4, 18 leaves, and 23 distinct parts. Parts repeat within one tree, and the same part can appear twice under one parent (e.g. two `TM-1020 Power Cell` rows, x4 and x1).
- Only roots have `endUnitSerialNo`.
- Units seen: `pcs`, `set`, `m`.
- `allowableStatuses` usually includes the current status, so it isn't strictly a list of transitions. Some parts are locked, e.g. `configuration` → `["configuration"]`.
- Malformed UUIDs return 400 with a Zod error object (`{ success: false, error: { name: "ZodError", message } }`), so `error` is not always a string.
- Latency: median ~100ms, occasional ~1.7s cold start. Show loading states.
