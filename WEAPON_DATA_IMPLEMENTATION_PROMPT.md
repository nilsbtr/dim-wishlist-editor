# Weapon Data Implementation Prompt

Implement a client-side weapon database for an existing TanStack Start project using the Destiny 2 manifest.

## Stack (already configured)

- TanStack Start (React + TanStack Router + TanStack Query)
- TypeScript (strict)

## Additional Dependencies

```bash
pnpm install dexie dexie-react-hooks bungie-api-ts
```

## Architecture

Integrate into existing project structure:

```
src/
├── services/
│   ├── db/
│   │   ├── dexie.ts             # Dexie DB instance + schema
│   │   └── operations.ts        # Weapon CRUD operations
│   └── manifest/
│       ├── api.ts               # Fetch manifest metadata + tables from Bungie
│       ├── loader.ts            # Orchestrates fetch → transform → persist
│       ├── transformer.ts       # Raw defs → WeaponItem/Full/Concise
│       └── helpers.ts           # Fetch + cache d2ai lookup data
├── lib/
│   └── constants.ts             # BucketHashes, SocketCategoryHashes, etc.
├── types/
│   └── weapons.ts               # WeaponItem, WeaponFull, WeaponConcise
├── hooks/
│   ├── useManifestLoader.ts     # Init manifest on app load
│   └── useWeapons.ts            # Query weapons from Dexie
└── routes/
    └── _test.weapons.tsx        # Test route to verify data
```

## Requirements

### Version Check Flow (Critical)

On every page load:

1. **Fetch manifest metadata only** - `GET https://www.bungie.net/Platform/Destiny2/Manifest/` (~2KB response)
2. **Extract version** - use `Response.version` directly (e.g., `"239845.25.12.11.1930-2-bnet.63145"`)
3. **Compare with cached version** in Dexie `metadata` table
4. **If different** → fetch full manifest tables (~50MB), transform, persist to IndexedDB
5. **If same** → skip fetch, use cached weapon data from Dexie

This ensures minimal bandwidth on repeat visits while always staying up-to-date.

### 1. Dexie Schema (`services/db/dexie.ts`)

```typescript
import Dexie from "dexie";

class WeaponDatabase extends Dexie {
  metadata!: Dexie.Table<{ key: string; value: string }>;
  helperData!: Dexie.Table<{ key: string; data: unknown }>;
  weapons!: Dexie.Table<WeaponFull, number>;
  weaponsConcise!: Dexie.Table<WeaponConcise, number>;

  constructor() {
    super("d2weapons");
    this.version(1).stores({
      metadata: "key",
      helperData: "key", // watermark-to-season, watermark-to-event, craftable-hashes
      weapons: "hash, name, tierType, slot",
      weaponsConcise: "hash, name, tierType, slot, itemType",
    });
  }
}

export const db = new WeaponDatabase();
```

### 2. Manifest API (`services/manifest/api.ts`)

**Step 1: Fetch metadata only (cheap ~2KB call)**

```typescript
interface ManifestMetadata {
  version: string;
  paths: Record<string, string>;
}

export async function fetchManifestMetadata(): Promise<ManifestMetadata> {
  const res = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/");
  const data = await res.json();
  return {
    version: data.Response.version, // e.g., "239845.25.12.11.1930-2-bnet.63145"
    paths: data.Response.jsonWorldComponentContentPaths.en,
  };
}
```

**Step 2: Fetch full tables only if version changed (~50MB)**

```typescript
export async function fetchManifestTables(paths: Record<string, string>) {
  const tables = [
    "DestinyInventoryItemDefinition",
    "DestinyPlugSetDefinition",
    "DestinyCollectibleDefinition",
    "DestinyDamageTypeDefinition",
    "DestinySocketTypeDefinition",
    "DestinySocketCategoryDefinition",
  ];

  const results = await Promise.all(
    tables.map((t) => fetch(`https://www.bungie.net${paths[t]}`).then((r) => r.json()))
  );

  return Object.fromEntries(tables.map((t, i) => [t, results[i]]));
}
```

### 3. Helper Data (`services/manifest/helpers.ts`)

- Fetch helper JSON files from remote URL at runtime (e.g., raw GitHub or your CDN)
- Cache in Dexie `helperData` table with version key
- Files needed: `watermark-to-season.json`, `watermark-to-event.json`, `craftable-hashes.json`

```typescript
const HELPER_BASE_URL = "https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master";

export async function loadHelperData(): Promise<HelperData> {
  const cached = await db.helperData.get("helpers");
  if (cached) return cached.data as HelperData;

  const [watermarkToSeason, watermarkToEvent, craftableHashes] = await Promise.all([
    fetch(`${HELPER_BASE_URL}/watermark-to-season.json`).then((r) => r.json()),
    fetch(`${HELPER_BASE_URL}/watermark-to-event.json`).then((r) => r.json()),
    fetch(`${HELPER_BASE_URL}/craftable-hashes.json`).then((r) => r.json()),
  ]);

  const data = { watermarkToSeason, watermarkToEvent, craftableHashes };
  await db.helperData.put({ key: "helpers", data });
  return data;
}
```

### 4. Transformation (`services/manifest/transformer.ts`)

- Filter weapons: bucket ∈ [1498876634, 2465295065, 953998645], has category 1, not dummy (3109687656)
- Build WeaponItem, WeaponFull, WeaponConcise per data models
- Lookup season/event from cached helper data

### 5. Loader (`services/manifest/loader.ts`)

**Critical: Check `https://www.bungie.net/Platform/Destiny2/Manifest/` on every page load. Only pull full manifest if version differs.**

```typescript
export async function loadManifest(): Promise<void> {
  // 1. Fetch manifest metadata (~2KB) to get current version
  const { version: remoteVersion, paths } = await fetchManifestMetadata();

  // 2. Check cached version in IndexedDB
  const cachedVersion = await db.metadata.get("version");

  // 3. Compare versions - if same, use cached data (no further network calls)
  if (cachedVersion?.value === remoteVersion) {
    console.log("[Manifest] Cache valid, skipping download. Version:", remoteVersion);
    return;
  }

  console.log("[Manifest] New version detected, downloading...", remoteVersion);

  // 4. Version differs - fetch full manifest tables (~50MB) + helper data
  const [tables, helperData] = await Promise.all([
    fetchManifestTables(paths), // Only called if version changed
    loadHelperData(),
  ]);

  // 5. Transform raw data to weapon models
  const weapons = transformWeapons(tables, helperData);

  // 6. Persist to IndexedDB atomically
  await db.transaction("rw", [db.weapons, db.weaponsConcise, db.metadata], async () => {
    await db.weapons.clear();
    await db.weaponsConcise.clear();
    await db.weapons.bulkPut(weapons.full);
    await db.weaponsConcise.bulkPut(weapons.concise);
    // Store version - this is the cache key checked on next page load
    await db.metadata.put({ key: "version", value: remoteVersion });
  });

  console.log("[Manifest] Updated. Weapons cached:", weapons.full.length);
}
```

### 6. Manifest Loader Hook (`hooks/useManifestLoader.ts`)

**Called on app/page load - checks version and updates if needed.**

```typescript
import { useQuery } from "@tanstack/react-query";
import { loadManifest } from "~/services/manifest/loader";

export function useManifestLoader() {
  return useQuery({
    queryKey: ["manifest-init"],
    queryFn: loadManifest,
    staleTime: Infinity, // Don't re-run within same session
    gcTime: 0, // Always run on mount (version check is cheap)
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always check version on page load
  });
}
```

**Usage:** Call `useManifestLoader()` in root layout or app entry to ensure manifest is loaded/validated before rendering weapon data.

### 7. Weapon Hooks (`hooks/useWeapons.ts`)

```typescript
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "~/services/db/dexie";

export function useWeapons() {
  return useLiveQuery(() => db.weaponsConcise.toArray());
}

export function useWeapon(hash: number) {
  return useLiveQuery(() => db.weapons.get(hash), [hash]);
}
```

### 8. Test Route (`routes/_test.weapons.tsx`)

- Call `useManifestLoader()` at route level
- Show loading/error states
- Display weapon count + simple table (name, itemType, tierType, slot)
- Click row → `console.log(await db.weapons.get(hash))`

## Data Models

See `WEAPON_DATA_EXTRACTION_GUIDE.md` for complete WeaponItem, WeaponFull, WeaponConcise definitions.

## Key Notes

- **Client-side only** - no server bandwidth for manifest after initial load
- **Version check first** - always fetch `https://www.bungie.net/Platform/Destiny2/Manifest/` (~2KB) to check current version
- **Conditional download** - only fetch full manifest tables (~50MB) if version differs from cached
- **IndexedDB persistence** - weapons + version cached in Dexie; survives page refresh/browser close
- **Version key** - use `Response.version` directly (e.g., `"239845.25.12.11.1930-2-bnet.63145"`)
- **Runtime helper data** - fetched from DIM GitHub raw, cached in Dexie `helperData` table
- **Lazy transformation** - dynamic import transformer to reduce initial bundle
- **bungie-api-ts** - use types only, no runtime API client needed
- **Handle edge cases**: redacted items, missing collectibles, `currentlyCanRoll: false` for deprecated perks

## Helper Data (fetched at runtime from d2ai-module repo)

Fetched from `https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/`:

- `watermark-to-season.json`
- `watermark-to-event.json`
- `craftable-hashes.json`
