import type { Table } from "dexie";
import Dexie from "dexie";

import type { HelperDataEntry, Metadata, WeaponConcise, WeaponFull } from "@/types/weapons";
import type { Wishlist } from "@/types/wishlist";

/**
 * Dexie database for storing Destiny 2 weapon data and wishlists
 */
class WishlistEditorDatabase extends Dexie {
  metadata!: Table<Metadata, string>;
  helperData!: Table<HelperDataEntry, string>;
  weapons!: Table<WeaponFull, number>;
  weaponsConcise!: Table<WeaponConcise, number>;
  wishlists!: Table<Wishlist, string>;

  constructor() {
    super("wishlist-editor");

    // Version 4: Optimized indexes - only include actually used indexed fields
    // Removed unused indexes: weapons.item.*, weaponsConcise.name, wishlists.name
    this.version(4).stores({
      // Key-value store for manifest version tracking
      metadata: "key",
      // Cache for d2ai data and other helper data
      helperData: "key",
      // Full weapon data - only hash as primary key (no indexed queries)
      weapons: "hash",
      // Concise weapon data - indexed fields used in where() queries
      weaponsConcise: "hash, tierType, slot, itemType",
      // Wishlists - id is primary, updatedAt for sorting
      wishlists: "id, updatedAt",
    });
  }
}

/**
 * Singleton database instance
 */
export const db = new WishlistEditorDatabase();
