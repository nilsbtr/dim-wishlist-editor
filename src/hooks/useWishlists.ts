import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/services/db/dexie";
import type { WeaponWishlistEntry, Wishlist } from "@/types/wishlist";

/**
 * Get all wishlists
 */
export function useWishlists(): Array<Wishlist> | undefined {
  return useLiveQuery(() => db.wishlists.toArray());
}

/**
 * Get a single wishlist by ID
 */
export function useWishlist(id: string): Wishlist | undefined {
  return useLiveQuery(() => db.wishlists.get(id), [id]);
}

/**
 * Get the total count of wishlists
 */
export function useWishlistCount(): number | undefined {
  return useLiveQuery(() => db.wishlists.count());
}

/**
 * Get a weapon entry from a wishlist
 */
export function useWeaponEntry(
  wishlistId: string,
  weaponHash: number
): WeaponWishlistEntry | undefined {
  return useLiveQuery(async () => {
    const wishlist = await db.wishlists.get(wishlistId);
    if (!wishlist) return undefined;
    return wishlist.weapons[weaponHash];
  }, [wishlistId, weaponHash]);
}

/**
 * Get all weapon hashes that have entries in a wishlist
 */
export function useWishlistedWeaponHashes(wishlistId: string): Array<number> | undefined {
  return useLiveQuery(async () => {
    const wishlist = await db.wishlists.get(wishlistId);
    if (!wishlist) return [];
    return Object.keys(wishlist.weapons).map(Number);
  }, [wishlistId]);
}

/**
 * Check if a weapon has any rolls in a wishlist
 */
export function useHasWishlistedRolls(wishlistId: string, weaponHash: number): boolean | undefined {
  return useLiveQuery(async () => {
    const wishlist = await db.wishlists.get(wishlistId);
    if (!wishlist) return false;
    const entry = wishlist.weapons[weaponHash];
    return entry !== undefined && entry.rolls.length > 0;
  }, [wishlistId, weaponHash]);
}

/**
 * Get statistics for a specific wishlist
 */
export function useWishlistStats(
  wishlistId: string
): { weaponCount: number; rollCount: number } | undefined {
  return useLiveQuery(async () => {
    const wishlist = await db.wishlists.get(wishlistId);
    if (!wishlist) return undefined;

    const entries = Object.values(wishlist.weapons);
    const weaponCount = entries.length;
    const rollCount = entries.reduce((count, entry) => count + (entry?.rolls.length ?? 0), 0);

    return { weaponCount, rollCount };
  }, [wishlistId]);
}

/**
 * Get global statistics across all wishlists
 */
export function useGlobalStats():
  | { wishlistCount: number; totalWeapons: number; totalRolls: number }
  | undefined {
  return useLiveQuery(async () => {
    const wishlists = await db.wishlists.toArray();
    let totalWeapons = 0;
    let totalRolls = 0;

    for (const wishlist of wishlists) {
      const entries = Object.values(wishlist.weapons);
      totalWeapons += entries.length;
      totalRolls += entries.reduce((count, entry) => count + (entry?.rolls.length ?? 0), 0);
    }

    return {
      wishlistCount: wishlists.length,
      totalWeapons,
      totalRolls,
    };
  });
}

/**
 * Get recently updated wishlists
 */
export function useRecentWishlists(limit: number = 5): Array<Wishlist> | undefined {
  return useLiveQuery(
    () => db.wishlists.orderBy("updatedAt").reverse().limit(limit).toArray(),
    [limit]
  );
}
