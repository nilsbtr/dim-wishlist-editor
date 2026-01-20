/**
 * Weapon data types for Destiny 2 manifest data
 */

/**
 * Frame/Intrinsic perk data
 */
export interface Frame {
  hash: number;
  name: string;
  description: string;
  iconSrc: string | null;
}

/**
 * Origin trait data
 */
export interface Intrinsic {
  hash: number;
  name: string;
  description: string;
  iconSrc: string | null;
}

/**
 * Individual perk data
 */
export interface Perk {
  hash: number;
  name: string;
  description: string;
  itemType: string;
  iconSrc: string | null;
  isCurated: boolean;
  curatedExclusive: boolean;
  isDeprecated: boolean;
}

/**
 * WeaponItem: scalar + presentation fields
 */
export interface WeaponItem {
  hash: number;
  name: string;
  flavorText: string;
  tierType: number; // 5=Legendary, 6=Exotic
  itemType: string; // e.g., "Auto Rifle"
  damageType: number; // DestinyDamageType enumValue
  slot: number; // 0 kinetic, 1 energy, 2 power
  ammoType: number; // DestinyAmmunitionType
  source: number | null; // collectible.sourceHash
  iconSrc: string | null;
  watermarkSrc: string | null;
  watermarkFeaturedSrc: string | null;
  screenshotSrc: string | null;
  foundrySrc: string | null; // def.secondaryIcon
  isCraftable: boolean;
  isAdept: boolean;
  isHolofoil: boolean;
  isFeatured: boolean;
  season: number | null;
  event: number | null;
}

/**
 * WeaponFull: full sockets, stats, and plug deltas
 */
export interface WeaponFull {
  hash: number;
  item: WeaponItem;
  frame: Frame | null;
  intrinsics: Array<Intrinsic>;
  perks: Array<Array<Perk>>; // 2D array: each inner array is a perk column
}

/**
 * WeaponConcise: trimmed version for lists/indexes
 */
export interface WeaponConcise {
  hash: number;
  name: string;
  tierType: number;
  itemType: string;
  damageType: number;
  slot: number;
  ammoType: number;
  source: number | null;
  iconSrc: string | null;
  watermarkSrc: string | null;
  watermarkFeaturedSrc: string | null;
  isCraftable: boolean;
  isAdept: boolean;
  isHolofoil: boolean;
  isFeatured: boolean;
  season: number | null;
  event: number | null;
  frame: string; // intrinsic plug name
  perks: Array<Array<string>>; // perk columns as names
}

/**
 * A dictionary type that properly reflects that key lookups may return undefined.
 */
export type LookupTable<T> = { [key: string]: T | undefined };

/**
 * Data loaded from DIM's d2ai-module repository
 */
export interface D2AIData {
  /** Watermark path → season number */
  watermarkToSeason: LookupTable<number>;
  /** Watermark path → event number */
  watermarkToEvent: LookupTable<number>;
  /** SourceHash → season number (from source-to-season-v2.json) */
  sourceToSeason: LookupTable<number>;
  /** ItemHash → season number (from seasons.json) */
  seasons: LookupTable<number>;
  /** ItemHash → event number (from events.json) */
  events: LookupTable<number>;
  /** Array of craftable item hashes */
  craftableHashes: Array<number>;
}

/**
 * Metadata stored in Dexie for version tracking
 */
export interface Metadata {
  key: string;
  value: string;
}

/**
 * Helper data cache entry
 */
export interface HelperDataEntry {
  key: string;
  data: unknown;
}
