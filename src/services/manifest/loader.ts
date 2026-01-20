import { db } from "@/services/db/dexie";

import type { ManifestTables } from "./api";
import { fetchManifestMetadata, fetchManifestTables } from "./api";
import { loadD2AIData } from "./d2ai";
import { prefixBungieOrNull, transformWeapons } from "./transformer";

/**
 * Mapping of damage type enum value to Bungie icon URL
 */
export type DamageTypeIcons = Record<number, string>;

/**
 * Extract damage type icons from manifest tables
 */
function extractDamageTypeIcons(tables: ManifestTables): DamageTypeIcons {
  const icons: DamageTypeIcons = {};

  for (const damageTypeDef of Object.values(tables.DestinyDamageTypeDefinition)) {
    if (!damageTypeDef) continue;
    const iconPath = prefixBungieOrNull(damageTypeDef.displayProperties.icon);
    if (iconPath) {
      icons[damageTypeDef.enumValue] = iconPath;
    }
  }

  return icons;
}

/**
 * Result of manifest loading operation
 */
export interface ManifestLoadResult {
  version: string;
  weaponCount: number;
  cached: boolean;
}

/**
 * Load and cache manifest data.
 *
 * This function:
 * 1. Fetches manifest metadata (~2KB) to get current version
 * 2. Compares with cached version in IndexedDB
 * 3. If different, fetches full manifest tables (~50MB), transforms, and persists
 * 4. If same, skips fetch and uses cached weapon data
 *
 * Returns a result object so React Query can properly cache the response.
 * This ensures minimal bandwidth on repeat visits while always staying up-to-date.
 */
export async function loadManifest(): Promise<ManifestLoadResult> {
  // 1. Fetch manifest metadata (~2KB) to get current version
  console.log("[Manifest] Checking for updates...");
  const { version: remoteVersion, paths } = await fetchManifestMetadata();

  // 2. Check cached version in IndexedDB
  const cachedVersionEntry = await db.metadata.get("version");
  const cachedVersion = cachedVersionEntry?.value;

  // 3. Compare versions - if same, use cached data (no further network calls)
  if (cachedVersion === remoteVersion) {
    console.log("[Manifest] Cache valid, skipping download. Version:", remoteVersion);
    const weaponCount = await db.weaponsConcise.count();
    return {
      version: remoteVersion,
      weaponCount,
      cached: true,
    };
  }

  console.log(
    "[Manifest] New version detected, downloading...",
    `(${cachedVersion || "none"} → ${remoteVersion})`
  );

  // 4. Version differs - fetch full manifest tables (~50MB) + d2ai data
  const [tables, d2aiData] = await Promise.all([fetchManifestTables(paths), loadD2AIData()]);

  // 5. Transform raw data to weapon models
  console.log("[Manifest] Transforming weapon data...");
  const weapons = transformWeapons(tables, d2aiData);

  // 5b. Extract damage type icons from manifest
  const damageTypeIcons = extractDamageTypeIcons(tables);

  // 6. Persist to IndexedDB atomically
  console.log("[Manifest] Persisting to IndexedDB...");
  await db.transaction(
    "rw",
    [db.weapons, db.weaponsConcise, db.metadata, db.helperData],
    async () => {
      // Clear existing data
      await db.weapons.clear();
      await db.weaponsConcise.clear();

      // Bulk insert new data
      await db.weapons.bulkPut(weapons.full);
      await db.weaponsConcise.bulkPut(weapons.concise);

      // Store version - this is the cache key checked on next page load
      await db.metadata.put({ key: "version", value: remoteVersion });

      // Store damage type icons
      await db.helperData.put({ key: "damageTypeIcons", data: damageTypeIcons });
    }
  );

  console.log("[Manifest] Updated. Weapons cached:", weapons.full.length);

  return {
    version: remoteVersion,
    weaponCount: weapons.full.length,
    cached: false,
  };
}

/**
 * Force a full manifest refresh, ignoring cached version
 */
export async function forceManifestRefresh(): Promise<ManifestLoadResult> {
  // Clear the version to force a refresh
  await db.metadata.delete("version");

  // Re-run the normal load flow
  return loadManifest();
}

/**
 * Get the currently cached manifest version
 */
export async function getCachedManifestVersion(): Promise<string | null> {
  const entry = await db.metadata.get("version");
  return entry?.value ?? null;
}

/**
 * Check if manifest data is available in the cache
 */
export async function isManifestCached(): Promise<boolean> {
  const count = await db.weaponsConcise.count();
  return count > 0;
}
