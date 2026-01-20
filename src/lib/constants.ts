/**
 * Bucket hashes for weapon slots
 */
export const BucketHashes = {
  KineticWeapons: 1498876634,
  EnergyWeapons: 2465295065,
  PowerWeapons: 953998645,
} as const;

export const WEAPON_BUCKET_HASHES = [
  BucketHashes.KineticWeapons,
  BucketHashes.EnergyWeapons,
  BucketHashes.PowerWeapons,
] as const;

/**
 * Socket category hashes
 */
export const SocketCategoryHashes = {
  IntrinsicTraits: 3956125808,
  WeaponPerks: 4241085061,
  WeaponMods: 2685412949,
} as const;

/**
 * Socket type hashes
 */
export const SocketTypeHashes = {
  /** Kill tracker socket - should be filtered out from perk columns */
  Tracker: 1282012138,
} as const;

/**
 * Plug category hashes for empty/placeholder plugs that should be filtered out
 */
export const EmptyPlugCategoryHashes = {
  EmptySocketPlug: 3618704867,
  EmptyModSocketPlug: 1915962497,
} as const;

export const EMPTY_PLUG_CATEGORY_HASHES: Set<number> = new Set([
  EmptyPlugCategoryHashes.EmptySocketPlug,
  EmptyPlugCategoryHashes.EmptyModSocketPlug,
]);

/**
 * Item category hashes
 */
export const ItemCategoryHashes = {
  Weapon: 1,
  Dummies: 3109687656,
  AutoRifle: 5,
  HandCannon: 6,
  PulseRifle: 7,
  ScoutRifle: 8,
  FusionRifle: 9,
  SniperRifle: 10,
  Shotgun: 11,
  MachineGun: 12,
  RocketLauncher: 13,
  Sidearm: 14,
  Sword: 54,
  GrenadeLaunchers: 153950757,
  LinearFusionRifles: 1504945536,
  SubmachineGun: 3954685534,
  TraceRifles: 2489664120,
  Bows: 3317538576,
  Glaives: 3871742104,
  WeaponModsOriginTraits: 1052191891,
} as const;

/**
 * Tier types for items
 */
export const TierType = {
  Unknown: 0,
  Currency: 1,
  Basic: 2, // Common
  Common: 3, // Uncommon
  Rare: 4,
  Superior: 5, // Legendary
  Exotic: 6,
} as const;

/**
 * Plug tier type for enhanced perks (different from item TierType)
 * Enhanced perks have inventory.tierType === 3
 */
export const ENHANCED_PERK_TIER_TYPE = 3;

/**
 * Damage types
 */
export const DestinyDamageType = {
  None: 0,
  Kinetic: 1,
  Arc: 2,
  Solar: 3,
  Void: 4,
  Raid: 5,
  Stasis: 6,
  Strand: 7,
} as const;

/**
 * Ammunition types
 */
export const DestinyAmmunitionType = {
  None: 0,
  Primary: 1,
  Special: 2,
  Heavy: 3,
  Unknown: 4,
} as const;

/**
 * Bungie.net base URL for asset paths
 */
export const BUNGIE_NET = "https://www.bungie.net";

/**
 * DIM's d2ai-module repository URL for fetching additional item data
 */
export const D2AI_MODULE_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master";
