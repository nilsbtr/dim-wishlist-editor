import type { WeaponWishlistEntry, Wishlist, WishlistRoll } from "@/types/wishlist";

import { db } from "./dexie";

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// Wishlist CRUD Operations
// =============================================================================

/**
 * Get all wishlists
 */
export async function getAllWishlists(): Promise<Array<Wishlist>> {
  return db.wishlists.toArray();
}

/**
 * Get a wishlist by ID
 */
export async function getWishlist(id: string): Promise<Wishlist | undefined> {
  return db.wishlists.get(id);
}

/**
 * Create a new wishlist
 */
export async function createWishlist(name: string, description: string = ""): Promise<Wishlist> {
  const now = Date.now();
  const wishlist: Wishlist = {
    id: generateId(),
    name,
    description,
    weapons: {},
    createdAt: now,
    updatedAt: now,
  };

  await db.wishlists.add(wishlist);
  return wishlist;
}

/**
 * Update wishlist metadata (name, description)
 */
export async function updateWishlist(
  id: string,
  updates: { name?: string; description?: string }
): Promise<Wishlist | undefined> {
  const wishlist = await db.wishlists.get(id);
  if (!wishlist) return undefined;

  const updated: Wishlist = {
    ...wishlist,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.wishlists.put(updated);
  return updated;
}

/**
 * Delete a wishlist
 */
export async function deleteWishlist(id: string): Promise<boolean> {
  const count = await db.wishlists.where("id").equals(id).delete();
  return count > 0;
}

/**
 * Duplicate a wishlist
 */
export async function duplicateWishlist(id: string): Promise<Wishlist | undefined> {
  const original = await db.wishlists.get(id);
  if (!original) return undefined;

  const now = Date.now();
  const duplicate: Wishlist = {
    ...original,
    id: generateId(),
    name: `${original.name} (copy)`,
    createdAt: now,
    updatedAt: now,
  };

  await db.wishlists.add(duplicate);
  return duplicate;
}

// =============================================================================
// Weapon Entry Operations
// =============================================================================

/**
 * Get a weapon entry from a wishlist
 */
export async function getWeaponEntry(
  wishlistId: string,
  weaponHash: number
): Promise<WeaponWishlistEntry | undefined> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return undefined;
  return wishlist.weapons[weaponHash];
}

/**
 * Get all weapon hashes in a wishlist
 */
export async function getWishlistedWeaponHashes(wishlistId: string): Promise<Array<number>> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return [];
  return Object.keys(wishlist.weapons).map(Number);
}

/**
 * Check if a weapon has any rolls in a wishlist
 */
export async function hasWishlistedRolls(wishlistId: string, weaponHash: number): Promise<boolean> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return false;
  const entry = wishlist.weapons[weaponHash];
  return entry !== undefined && entry.rolls.length > 0;
}

// =============================================================================
// Roll Operations
// =============================================================================

/**
 * Add a roll to a weapon in a wishlist
 */
export async function addRoll(
  wishlistId: string,
  weaponHash: number,
  roll: Omit<WishlistRoll, "id" | "createdAt" | "updatedAt">
): Promise<WishlistRoll | undefined> {
  const now = Date.now();
  const newRoll: WishlistRoll = {
    ...roll,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return undefined;

  const entry = wishlist.weapons[weaponHash] ?? { weaponHash, rolls: [] };
  entry.rolls.push(newRoll);
  wishlist.weapons[weaponHash] = entry;
  wishlist.updatedAt = now;

  await db.wishlists.put(wishlist);
  return newRoll;
}

/**
 * Update an existing roll
 */
export async function updateRoll(
  wishlistId: string,
  weaponHash: number,
  rollId: string,
  updates: Partial<Omit<WishlistRoll, "id" | "createdAt" | "updatedAt">>
): Promise<WishlistRoll | undefined> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return undefined;

  const entry = wishlist.weapons[weaponHash];
  if (!entry) return undefined;

  const rollIndex = entry.rolls.findIndex((r) => r.id === rollId);
  if (rollIndex === -1) return undefined;

  const now = Date.now();
  const updatedRoll: WishlistRoll = {
    ...entry.rolls[rollIndex],
    ...updates,
    updatedAt: now,
  };

  entry.rolls[rollIndex] = updatedRoll;
  wishlist.updatedAt = now;

  await db.wishlists.put(wishlist);
  return updatedRoll;
}

/**
 * Delete a roll from a weapon
 */
export async function deleteRoll(
  wishlistId: string,
  weaponHash: number,
  rollId: string
): Promise<boolean> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return false;

  const entry = wishlist.weapons[weaponHash];
  if (!entry) return false;

  const rollIndex = entry.rolls.findIndex((r) => r.id === rollId);
  if (rollIndex === -1) return false;

  entry.rolls.splice(rollIndex, 1);

  // Remove weapon entry if no rolls left
  if (entry.rolls.length === 0) {
    delete wishlist.weapons[weaponHash];
  }

  wishlist.updatedAt = Date.now();
  await db.wishlists.put(wishlist);
  return true;
}

/**
 * Reorder rolls within a weapon entry
 */
export async function reorderRolls(
  wishlistId: string,
  weaponHash: number,
  rollIds: Array<string>
): Promise<boolean> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return false;

  const entry = wishlist.weapons[weaponHash];
  if (!entry) return false;

  const rollMap = new Map<string, WishlistRoll>();
  for (const roll of entry.rolls) {
    rollMap.set(roll.id, roll);
  }

  const reorderedRolls: Array<WishlistRoll> = [];
  for (const id of rollIds) {
    const roll = rollMap.get(id);
    if (roll) {
      reorderedRolls.push(roll);
      rollMap.delete(id);
    }
  }

  // Append any rolls not in the provided list
  for (const roll of rollMap.values()) {
    reorderedRolls.push(roll);
  }

  entry.rolls = reorderedRolls;
  wishlist.updatedAt = Date.now();

  await db.wishlists.put(wishlist);
  return true;
}

/**
 * Duplicate a roll
 */
export async function duplicateRoll(
  wishlistId: string,
  weaponHash: number,
  rollId: string
): Promise<WishlistRoll | undefined> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return undefined;

  const entry = wishlist.weapons[weaponHash];
  if (!entry) return undefined;

  const originalRoll = entry.rolls.find((r) => r.id === rollId);
  if (!originalRoll) return undefined;

  const now = Date.now();
  const duplicatedRoll: WishlistRoll = {
    ...originalRoll,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  const originalIndex = entry.rolls.indexOf(originalRoll);
  entry.rolls.splice(originalIndex + 1, 0, duplicatedRoll);
  wishlist.updatedAt = now;

  await db.wishlists.put(wishlist);
  return duplicatedRoll;
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get statistics for a wishlist
 */
export async function getWishlistStats(wishlistId: string): Promise<
  | {
      weaponCount: number;
      rollCount: number;
    }
  | undefined
> {
  const wishlist = await db.wishlists.get(wishlistId);
  if (!wishlist) return undefined;

  const entries = Object.values(wishlist.weapons);
  const weaponCount = entries.length;
  const rollCount = entries.reduce((count, entry) => count + (entry?.rolls.length ?? 0), 0);

  return { weaponCount, rollCount };
}

/**
 * Get global statistics across all wishlists
 */
export async function getGlobalStats(): Promise<{
  wishlistCount: number;
  totalWeapons: number;
  totalRolls: number;
}> {
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
}

// =============================================================================
// Import/Export
// =============================================================================

/**
 * Export a wishlist
 */
export async function exportWishlist(id: string): Promise<Wishlist | undefined> {
  return db.wishlists.get(id);
}

/**
 * Import a wishlist
 */
export async function importWishlist(wishlist: Wishlist, newName?: string): Promise<Wishlist> {
  const now = Date.now();
  const imported: Wishlist = {
    ...wishlist,
    id: generateId(),
    name: newName ?? `${wishlist.name} (imported)`,
    createdAt: now,
    updatedAt: now,
  };

  await db.wishlists.add(imported);
  return imported;
}

/**
 * Clear all wishlists
 */
export async function clearAllWishlists(): Promise<void> {
  await db.wishlists.clear();
}
