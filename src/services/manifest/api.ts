import type {
  DestinyCollectibleDefinition,
  DestinyDamageTypeDefinition,
  DestinyInventoryItemDefinition,
  DestinyPlugSetDefinition,
  DestinySocketCategoryDefinition,
  DestinySocketTypeDefinition,
} from "bungie-api-ts/destiny2";

/**
 * Manifest metadata returned from Bungie API
 */
export interface ManifestMetadata {
  version: string;
  paths: Record<string, string>;
}

/**
 * A dictionary type that properly reflects that key lookups may return undefined.
 * Unlike Record<K, V>, this type acknowledges that not all keys exist.
 */
export type DefinitionTable<T> = { [hash: string]: T | undefined };

/**
 * All manifest tables needed for weapon extraction.
 * Uses DefinitionTable to properly type that lookups may return undefined.
 */
export interface ManifestTables {
  DestinyInventoryItemDefinition: DefinitionTable<DestinyInventoryItemDefinition>;
  DestinyPlugSetDefinition: DefinitionTable<DestinyPlugSetDefinition>;
  DestinyCollectibleDefinition: DefinitionTable<DestinyCollectibleDefinition>;
  DestinyDamageTypeDefinition: DefinitionTable<DestinyDamageTypeDefinition>;
  DestinySocketTypeDefinition: DefinitionTable<DestinySocketTypeDefinition>;
  DestinySocketCategoryDefinition: DefinitionTable<DestinySocketCategoryDefinition>;
}

/**
 * Fetch manifest metadata (~2KB) to get current version and table paths.
 * This is a cheap call that should be made on every page load to check for updates.
 */
export async function fetchManifestMetadata(): Promise<ManifestMetadata> {
  const response = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/");

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest metadata: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.Response) {
    throw new Error("Invalid manifest response: missing Response field");
  }

  return {
    version: data.Response.version,
    paths: data.Response.jsonWorldComponentContentPaths.en,
  };
}

/**
 * Fetch full manifest tables (~50MB total).
 * Only call this when the version has changed.
 */
export async function fetchManifestTables(paths: Record<string, string>): Promise<ManifestTables> {
  const tableNames = [
    "DestinyInventoryItemDefinition",
    "DestinyPlugSetDefinition",
    "DestinyCollectibleDefinition",
    "DestinyDamageTypeDefinition",
    "DestinySocketTypeDefinition",
    "DestinySocketCategoryDefinition",
  ] as const;

  console.log("[Manifest] Fetching tables:", tableNames.join(", "));

  const results = await Promise.all(
    tableNames.map(async (tableName) => {
      const path = paths[tableName];
      if (!path) {
        throw new Error(`Missing path for table: ${tableName}`);
      }

      const response = await fetch(`https://www.bungie.net${path}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${tableName}: ${response.status} ${response.statusText}`);
      }

      return response.json();
    })
  );

  const tables = Object.fromEntries(
    tableNames.map((name, index) => [name, results[index]])
  ) as ManifestTables;

  const itemCount = Object.keys(tables.DestinyInventoryItemDefinition).length;
  console.log("[Manifest] Tables fetched. Items:", itemCount);

  return tables;
}
