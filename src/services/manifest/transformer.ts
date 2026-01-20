import type {
  DestinyInventoryItemDefinition,
  DestinyItemSocketEntryDefinition,
} from "bungie-api-ts/destiny2";

import {
  BUNGIE_NET,
  EMPTY_PLUG_CATEGORY_HASHES,
  ENHANCED_PERK_TIER_TYPE,
  ItemCategoryHashes,
  SocketCategoryHashes,
  SocketTypeHashes,
  WEAPON_BUCKET_HASHES,
} from "@/lib/constants";
import type {
  D2AIData,
  Frame,
  Intrinsic,
  Perk,
  WeaponConcise,
  WeaponFull,
  WeaponItem,
} from "@/types/weapons";

import type { ManifestTables } from "./api";
import { getEvent, getSeason } from "./season";

/**
 * Result of weapon transformation
 */
export interface TransformResult {
  full: Array<WeaponFull>;
  concise: Array<WeaponConcise>;
}

/**
 * Transform raw manifest tables into WeaponFull and WeaponConcise arrays
 */
export function transformWeapons(tables: ManifestTables, d2aiData: D2AIData): TransformResult {
  const inventoryItems = Object.values(tables.DestinyInventoryItemDefinition);

  // Build collectible lookup (itemHash -> sourceHash)
  const collectibleByItemHash = new Map<string, number>();
  for (const collectible of Object.values(tables.DestinyCollectibleDefinition)) {
    if (collectible && collectible.itemHash) {
      collectibleByItemHash.set(String(collectible.itemHash), collectible.sourceHash ?? 0);
    }
  }

  // Filter for weapons only - filter out undefined values first, then check isWeapon
  const weapons = inventoryItems.filter(
    (item): item is DestinyInventoryItemDefinition => item !== undefined && isWeapon(item)
  );

  console.log(`[Transformer] Found ${weapons.length} weapons to transform`);

  const full: Array<WeaponFull> = [];
  const concise: Array<WeaponConcise> = [];

  for (const itemDef of weapons) {
    try {
      const weaponItem = extractWeaponItem(itemDef, tables, d2aiData, collectibleByItemHash);
      const frame = getFrame(itemDef, tables);
      const intrinsics = getIntrinsics(itemDef, tables);
      const perks = getPerks(itemDef, tables);

      const weaponFull: WeaponFull = {
        hash: itemDef.hash,
        item: weaponItem,
        frame,
        intrinsics,
        perks,
      };

      full.push(weaponFull);
      concise.push(toWeaponConcise(weaponFull));
    } catch (error) {
      console.warn(`[Transformer] Failed to transform weapon ${itemDef.hash}:`, error);
    }
  }

  console.log(`[Transformer] Transformed ${full.length} weapons successfully`);

  return { full, concise };
}

/**
 * Check if an item definition is a weapon.
 */
function isWeapon(itemDef: DestinyInventoryItemDefinition): boolean {
  const categories = itemDef.itemCategoryHashes ?? [];
  const bucketHash = itemDef.inventory?.bucketTypeHash;

  return (
    categories.includes(ItemCategoryHashes.Weapon) &&
    !categories.includes(ItemCategoryHashes.Dummies) &&
    bucketHash !== undefined &&
    WEAPON_BUCKET_HASHES.includes(bucketHash as (typeof WEAPON_BUCKET_HASHES)[number]) &&
    !!itemDef.displayProperties.name &&
    !itemDef.redacted
  );
}

/**
 * Extract WeaponItem from item definition
 */
function extractWeaponItem(
  itemDef: DestinyInventoryItemDefinition,
  tables: ManifestTables,
  d2aiData: D2AIData,
  collectibleByItemHash: Map<string, number>
): WeaponItem {
  const bucketHash = itemDef.inventory?.bucketTypeHash ?? 0;
  const watermark = getWatermark(itemDef);

  // Get damage type
  const damageTypeDef = itemDef.defaultDamageTypeHash
    ? tables.DestinyDamageTypeDefinition[String(itemDef.defaultDamageTypeHash)]
    : undefined;

  // Get source from collectible
  const sourceHash = collectibleByItemHash.get(String(itemDef.hash));

  return {
    hash: itemDef.hash,
    name: itemDef.displayProperties.name,
    flavorText: itemDef.flavorText,
    tierType: itemDef.inventory?.tierType ?? 0,
    itemType: itemDef.itemTypeDisplayName,
    damageType: damageTypeDef?.enumValue ?? 0,
    slot: getSlot(bucketHash),
    ammoType: itemDef.equippingBlock?.ammoType ?? 0,
    source: sourceHash ?? null,
    iconSrc: prefixBungieOrNull(itemDef.displayProperties.icon),
    watermarkSrc: prefixBungieOrNull(itemDef.iconWatermark),
    watermarkFeaturedSrc: prefixBungieOrNull(itemDef.iconWatermarkFeatured),
    screenshotSrc: prefixBungieOrNull(itemDef.screenshot),
    foundrySrc: prefixBungieOrNull(itemDef.secondaryIcon),
    isCraftable: d2aiData.craftableHashes.includes(itemDef.hash),
    isAdept: (itemDef as unknown as { isAdept?: boolean }).isAdept ?? false,
    isHolofoil: (itemDef as unknown as { isHolofoil?: boolean }).isHolofoil ?? false,
    isFeatured: (itemDef as unknown as { isFeaturedItem?: boolean }).isFeaturedItem ?? false,
    season: getSeason(itemDef, watermark, sourceHash, d2aiData),
    event: getEvent(itemDef, watermark, sourceHash, d2aiData),
  };
}

/**
 * Get the watermark path from an item, preferring iconWatermark over iconWatermarkShelved.
 * Returns null if no watermark is set (empty string).
 */
function getWatermark(itemDef: DestinyInventoryItemDefinition): string | null {
  if (itemDef.iconWatermark.length > 0) {
    return itemDef.iconWatermark;
  }
  if (itemDef.iconWatermarkShelved.length > 0) {
    return itemDef.iconWatermarkShelved;
  }
  return null;
}

/**
 * Get slot number from bucket hash
 */
function getSlot(bucketHash: number): number {
  switch (bucketHash) {
    case 1498876634: // Kinetic
      return 0;
    case 2465295065: // Energy
      return 1;
    case 953998645: // Power
      return 2;
    default:
      return -1;
  }
}

/**
 * Prefix a path with Bungie.net domain, or return null if the path is empty or undefined.
 */
export function prefixBungieOrNull(path: string | undefined): string | null {
  if (!path || path.length === 0) {
    return null;
  }
  return `${BUNGIE_NET}${path}`;
}

/**
 * Get socket entries for a given socket category hash.
 * Returns an array of socket entries that belong to the specified category.
 */
function getSocketsByCategory(
  itemDef: DestinyInventoryItemDefinition,
  categoryHash: number
): Array<DestinyItemSocketEntryDefinition> {
  const socketData = itemDef.sockets;
  if (!socketData) return [];

  const category = socketData.socketCategories.find((c) => c.socketCategoryHash === categoryHash);

  if (!category) return [];

  const sockets: Array<DestinyItemSocketEntryDefinition> = [];
  for (const index of category.socketIndexes) {
    const socket = socketData.socketEntries.at(index);
    if (socket) {
      sockets.push(socket);
    }
  }

  return sockets;
}

/**
 * Get frame (intrinsic perk) from item definition.
 * The frame is found in the IntrinsicTraits socket category.
 */
function getFrame(itemDef: DestinyInventoryItemDefinition, tables: ManifestTables): Frame | null {
  const sockets = getSocketsByCategory(itemDef, SocketCategoryHashes.IntrinsicTraits);
  const socket = sockets.at(0);
  if (!socket) return null;

  const plugHash = socket.singleInitialItemHash;
  if (plugHash === 0) return null;

  const plugDef = tables.DestinyInventoryItemDefinition[String(plugHash)];
  if (!plugDef) return null;

  return {
    hash: plugDef.hash,
    name: plugDef.displayProperties.name,
    description: plugDef.displayProperties.description,
    iconSrc: prefixBungieOrNull(plugDef.displayProperties.icon),
  };
}

/**
 * Get intrinsics (origin traits) from item definition.
 * Origin traits are found in the WeaponPerks category and identified by the WeaponModsOriginTraits item category.
 */
function getIntrinsics(
  itemDef: DestinyInventoryItemDefinition,
  tables: ManifestTables
): Array<Intrinsic> {
  const sockets = getSocketsByCategory(itemDef, SocketCategoryHashes.WeaponPerks);
  const intrinsics: Array<Intrinsic> = [];

  for (const socket of sockets) {
    const plugHash = socket.singleInitialItemHash;
    if (plugHash === 0) continue;

    const plugDef = tables.DestinyInventoryItemDefinition[String(plugHash)];
    if (!plugDef) continue;

    const plugCategories = plugDef.itemCategoryHashes ?? [];
    if (plugCategories.includes(ItemCategoryHashes.WeaponModsOriginTraits)) {
      intrinsics.push({
        hash: plugDef.hash,
        name: plugDef.displayProperties.name,
        description: plugDef.displayProperties.description,
        iconSrc: prefixBungieOrNull(plugDef.displayProperties.icon),
      });
    }
  }

  return intrinsics;
}

/**
 * Get curated plug hashes from a socket's reusablePlugItems.
 */
function getCuratedPlugHashes(socket: DestinyItemSocketEntryDefinition): Set<number> {
  const curated = new Set<number>();
  for (const plug of socket.reusablePlugItems) {
    curated.add(plug.plugItemHash);
  }
  return curated;
}

/**
 * Check if a plug definition is an empty/placeholder plug that should be filtered out.
 */
function isEmptyPlug(plugDef: DestinyInventoryItemDefinition): boolean {
  const plugCategoryHash = plugDef.plug?.plugCategoryHash;
  return plugCategoryHash !== undefined && EMPTY_PLUG_CATEGORY_HASHES.has(plugCategoryHash);
}

/**
 * Check if a plug definition is an enhanced perk that should be filtered out.
 * Enhanced perks have inventory.tierType === 3
 */
function isEnhancedPerk(plugDef: DestinyInventoryItemDefinition): boolean {
  return plugDef.inventory?.tierType === ENHANCED_PERK_TIER_TYPE;
}

/**
 * Check if a plug definition is valid for display (not empty, not enhanced, has a name).
 */
function isValidPerk(plugDef: DestinyInventoryItemDefinition): boolean {
  return (
    plugDef.displayProperties.name.length > 0 && !isEmptyPlug(plugDef) && !isEnhancedPerk(plugDef)
  );
}

/**
 * Create a Perk object from a plug definition.
 */
function createPerk(
  plugDef: DestinyInventoryItemDefinition,
  options: { isCurated: boolean; curatedExclusive: boolean; isDeprecated: boolean }
): Perk {
  return {
    hash: plugDef.hash,
    name: plugDef.displayProperties.name,
    description: plugDef.displayProperties.description,
    itemType: plugDef.itemTypeDisplayName,
    iconSrc: prefixBungieOrNull(plugDef.displayProperties.icon),
    ...options,
  };
}

/**
 * Get perks from socket.reusablePlugItems directly (used for origin traits).
 */
function getPerksFromReusablePlugItems(
  socket: DestinyItemSocketEntryDefinition,
  tables: ManifestTables
): Array<Perk> {
  const perks: Array<Perk> = [];
  const seenHashes = new Set<number>();

  for (const plug of socket.reusablePlugItems) {
    const plugDef = tables.DestinyInventoryItemDefinition[String(plug.plugItemHash)];
    if (!plugDef || !isValidPerk(plugDef)) continue;
    if (seenHashes.has(plugDef.hash)) continue;

    seenHashes.add(plugDef.hash);
    perks.push(
      createPerk(plugDef, {
        isCurated: plug.plugItemHash === socket.singleInitialItemHash,
        curatedExclusive: false,
        isDeprecated: false,
      })
    );
  }

  return perks;
}

/**
 * Get a single fixed perk from socket.singleInitialItemHash.
 */
function getFixedPerk(
  socket: DestinyItemSocketEntryDefinition,
  tables: ManifestTables
): Perk | null {
  if (socket.singleInitialItemHash === 0) return null;

  const plugDef = tables.DestinyInventoryItemDefinition[String(socket.singleInitialItemHash)];
  if (!plugDef || !isValidPerk(plugDef)) return null;

  return createPerk(plugDef, {
    isCurated: true,
    curatedExclusive: true,
    isDeprecated: false,
  });
}

/**
 * Get perks from a plug set (randomized or reusable).
 */
function getPerksFromPlugSet(
  socket: DestinyItemSocketEntryDefinition,
  plugSet: { reusablePlugItems: Array<{ plugItemHash: number; currentlyCanRoll: boolean }> },
  tables: ManifestTables
): Array<Perk> {
  const perks: Array<Perk> = [];
  const curatedHashes = getCuratedPlugHashes(socket);
  const randomPoolHashes = new Set(plugSet.reusablePlugItems.map((p) => p.plugItemHash));

  // Add perks from the random pool
  for (const plug of plugSet.reusablePlugItems) {
    const plugDef = tables.DestinyInventoryItemDefinition[String(plug.plugItemHash)];
    if (!plugDef || !isValidPerk(plugDef)) continue;

    perks.push(
      createPerk(plugDef, {
        isCurated: curatedHashes.has(plug.plugItemHash),
        curatedExclusive: false,
        isDeprecated: !plug.currentlyCanRoll,
      })
    );
  }

  // Add curated-exclusive perks (in curated list but not in random pool)
  for (const curatedHash of curatedHashes) {
    if (randomPoolHashes.has(curatedHash)) continue;

    const plugDef = tables.DestinyInventoryItemDefinition[String(curatedHash)];
    if (!plugDef || !isValidPerk(plugDef)) continue;

    perks.push(
      createPerk(plugDef, {
        isCurated: true,
        curatedExclusive: true,
        isDeprecated: false,
      })
    );
  }

  return perks;
}

/**
 * Get perks (2D array of perk columns) from item definition.
 * Each column represents a socket with selectable perks from the WeaponPerks category.
 */
function getPerks(
  itemDef: DestinyInventoryItemDefinition,
  tables: ManifestTables
): Array<Array<Perk>> {
  const sockets = getSocketsByCategory(itemDef, SocketCategoryHashes.WeaponPerks);
  const perkColumns: Array<Array<Perk>> = [];

  for (const socket of sockets) {
    // Skip tracker sockets (kill tracker, etc.)
    if (socket.socketTypeHash === SocketTypeHashes.Tracker) {
      continue;
    }

    const plugSetHash = socket.randomizedPlugSetHash ?? socket.reusablePlugSetHash;

    // Case 1: No plug set - check reusablePlugItems directly or fall back to fixed perk
    if (plugSetHash === undefined) {
      if (socket.reusablePlugItems.length > 0) {
        const perks = getPerksFromReusablePlugItems(socket, tables);
        if (perks.length > 0) perkColumns.push(perks);
      } else {
        const fixedPerk = getFixedPerk(socket, tables);
        if (fixedPerk) perkColumns.push([fixedPerk]);
      }
      continue;
    }

    // Case 2: Has plug set - get perks from plug set definition
    const plugSet = tables.DestinyPlugSetDefinition[String(plugSetHash)];
    if (!plugSet) continue;

    const perks = getPerksFromPlugSet(socket, plugSet, tables);
    if (perks.length > 0) perkColumns.push(perks);
  }

  return perkColumns;
}

/**
 * Convert WeaponFull to WeaponConcise for list views
 */
function toWeaponConcise(weaponFull: WeaponFull): WeaponConcise {
  return {
    hash: weaponFull.hash,
    name: weaponFull.item.name,
    tierType: weaponFull.item.tierType,
    itemType: weaponFull.item.itemType,
    damageType: weaponFull.item.damageType,
    slot: weaponFull.item.slot,
    ammoType: weaponFull.item.ammoType,
    source: weaponFull.item.source,
    iconSrc: weaponFull.item.iconSrc,
    watermarkSrc: weaponFull.item.watermarkSrc,
    watermarkFeaturedSrc: weaponFull.item.watermarkFeaturedSrc,
    isCraftable: weaponFull.item.isCraftable,
    isAdept: weaponFull.item.isAdept,
    isHolofoil: weaponFull.item.isHolofoil,
    isFeatured: weaponFull.item.isFeatured,
    season: weaponFull.item.season,
    event: weaponFull.item.event,
    frame: weaponFull.frame?.name ?? "",
    perks: weaponFull.perks.map((column) => column.map((perk) => perk.name)),
  };
}
