/**
 * Wishlist data types for storing user-created weapon rolls
 */

/**
 * A single wishlisted roll for a weapon.
 * Contains the perks to match and metadata about the roll.
 */
export interface WishlistRoll {
  /** Unique identifier for this roll */
  id: string;
  /** Usage context - e.g., "pve", "pvp", or custom string */
  usage: string;
  /** User notes describing why this roll is good */
  notes: string;
  /** 2D array of perk hashes - each inner array represents acceptable perks for that column */
  perkHashes: Array<Array<number>>;
  /** Timestamp when this roll was created */
  createdAt: number;
  /** Timestamp when this roll was last modified */
  updatedAt: number;
}

/**
 * Wishlist entry for a single weapon within a wishlist.
 * Contains all wishlisted rolls for that weapon.
 * The order of rolls matters - higher index = higher priority in DIM.
 */
export interface WeaponWishlistEntry {
  /** The weapon's hash */
  weaponHash: number;
  /** Array of wishlisted rolls, ordered by priority (last = highest priority) */
  rolls: Array<WishlistRoll>;
}

/**
 * A complete wishlist containing multiple weapon entries.
 * Users can create multiple wishlists (e.g., "PvE Main", "Raid Weapons", etc.)
 */
export interface Wishlist {
  /** Unique identifier for this wishlist */
  id: string;
  /** User-defined name for this wishlist */
  name: string;
  /** Optional description */
  description: string;
  /** Map of weapon hash to wishlist entry */
  weapons: Partial<Record<number, WeaponWishlistEntry>>;
  /** Timestamp when this wishlist was created */
  createdAt: number;
  /** Timestamp when this wishlist was last modified */
  updatedAt: number;
}

/**
 * Simplified roll for export (no internal IDs or timestamps)
 */
export interface WishlistRollExport {
  usage: string;
  notes: string;
  perkHashes: Array<Array<number>>;
}

/**
 * Simplified wishlist export format (v2)
 * Removes redundant data for smaller file size
 */
export interface WishlistExportV2 {
  version: 2;
  name: string;
  description: string;
  /** Map of weapon hash to array of rolls */
  weapons: Record<string, Array<WishlistRollExport>>;
}

/**
 * Legacy export format (v1) - for backwards compatibility
 */
export interface WishlistExportV1 {
  version: 1;
  metadata: {
    title: string;
    description: string;
    author: string;
    lastUpdated: number;
  };
  wishlist: Wishlist;
}

/**
 * Union type for all export formats
 */
export type WishlistExport = WishlistExportV1 | WishlistExportV2;

/**
 * Predefined usage types
 */
export const USAGE_TYPES = {
  PVE: "pve",
  PVP: "pvp",
} as const;

export type UsageType = (typeof USAGE_TYPES)[keyof typeof USAGE_TYPES] | string;
