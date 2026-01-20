import type { WeaponConcise, WeaponFull } from "@/types/weapons";

import { db } from "./dexie";

/**
 * Get all weapons (concise version for lists)
 */
export async function getAllWeaponsConcise(): Promise<Array<WeaponConcise>> {
  return db.weaponsConcise.toArray();
}

/**
 * Get a single weapon by hash (full version with perks)
 */
export async function getWeaponByHash(hash: number): Promise<WeaponFull | undefined> {
  return db.weapons.get(hash);
}

/**
 * Get multiple weapons by hashes
 */
export async function getWeaponsByHashes(hashes: Array<number>): Promise<Array<WeaponFull>> {
  const weapons = await db.weapons.bulkGet(hashes);
  return weapons.filter((w): w is WeaponFull => w !== undefined);
}

/**
 * Get weapons by tier type (5=Legendary, 6=Exotic)
 */
export async function getWeaponsByTier(tierType: number): Promise<Array<WeaponConcise>> {
  return db.weaponsConcise.where("tierType").equals(tierType).toArray();
}

/**
 * Get weapons by slot (0=Kinetic, 1=Energy, 2=Power)
 */
export async function getWeaponsBySlot(slot: number): Promise<Array<WeaponConcise>> {
  return db.weaponsConcise.where("slot").equals(slot).toArray();
}

/**
 * Get weapons by item type (e.g., "Hand Cannon", "Auto Rifle")
 */
export async function getWeaponsByItemType(itemType: string): Promise<Array<WeaponConcise>> {
  return db.weaponsConcise.where("itemType").equals(itemType).toArray();
}

/**
 * Search weapons by name (case-insensitive partial match)
 */
export async function searchWeaponsByName(query: string): Promise<Array<WeaponConcise>> {
  const lowerQuery = query.toLowerCase();
  return db.weaponsConcise
    .filter((weapon) => weapon.name.toLowerCase().includes(lowerQuery))
    .toArray();
}

/**
 * Get the total count of weapons
 */
export async function getWeaponCount(): Promise<number> {
  return db.weaponsConcise.count();
}

/**
 * Get the cached manifest version
 */
export async function getCachedVersion(): Promise<string | null> {
  const entry = await db.metadata.get("version");
  return entry?.value ?? null;
}

/**
 * Check if the database has been initialized with weapon data
 */
export async function isInitialized(): Promise<boolean> {
  const count = await db.weaponsConcise.count();
  return count > 0;
}

/**
 * Clear all weapon data (useful for forcing a refresh)
 */
export async function clearWeaponData(): Promise<void> {
  await db.transaction("rw", [db.weapons, db.weaponsConcise, db.metadata], async () => {
    await db.weapons.clear();
    await db.weaponsConcise.clear();
    await db.metadata.delete("version");
  });
}

/**
 * Get unique item types (weapon categories)
 */
export async function getUniqueItemTypes(): Promise<Array<string>> {
  const weapons = await db.weaponsConcise.toArray();
  const types = new Set(weapons.map((w) => w.itemType));
  return Array.from(types).sort();
}
