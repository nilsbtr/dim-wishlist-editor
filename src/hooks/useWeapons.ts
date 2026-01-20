import { useLiveQuery } from "dexie-react-hooks";

import { compareWeapons } from "@/lib/destiny-utils";
import { db } from "@/services/db/dexie";
import type { DamageTypeIcons } from "@/services/manifest/loader";
import type { WeaponConcise, WeaponFull } from "@/types/weapons";

/**
 * Get all weapons (concise version for lists)
 * Returns undefined while loading, then the array of weapons
 * Sorted by: Season (desc) → Rarity (desc) → Name (asc)
 */
export function useWeapons(): Array<WeaponConcise> | undefined {
  return useLiveQuery(async () => {
    const weapons = await db.weaponsConcise.toArray();
    return weapons.sort(compareWeapons);
  });
}

/**
 * Get a single weapon by hash (full version with perks)
 * Returns undefined while loading or if not found
 */
export function useWeapon(hash: number): WeaponFull | undefined {
  return useLiveQuery(() => db.weapons.get(hash), [hash]);
}

/**
 * Get multiple weapons by hashes
 */
export function useWeaponsByHashes(hashes: Array<number>): Array<WeaponFull> | undefined {
  return useLiveQuery(async () => {
    const weapons = await db.weapons.bulkGet(hashes);
    return weapons.filter((w): w is WeaponFull => w !== undefined);
  }, [hashes]);
}

/**
 * Get weapons by tier type (5=Legendary, 6=Exotic)
 */
export function useWeaponsByTier(tierType: number): Array<WeaponConcise> | undefined {
  return useLiveQuery(
    () => db.weaponsConcise.where("tierType").equals(tierType).toArray(),
    [tierType]
  );
}

/**
 * Get weapons by slot (0=Kinetic, 1=Energy, 2=Power)
 */
export function useWeaponsBySlot(slot: number): Array<WeaponConcise> | undefined {
  return useLiveQuery(() => db.weaponsConcise.where("slot").equals(slot).toArray(), [slot]);
}

/**
 * Get weapons by item type (e.g., "Hand Cannon", "Auto Rifle")
 */
export function useWeaponsByItemType(itemType: string): Array<WeaponConcise> | undefined {
  return useLiveQuery(
    () => db.weaponsConcise.where("itemType").equals(itemType).toArray(),
    [itemType]
  );
}

/**
 * Search weapons by name (case-insensitive partial match)
 */
export function useWeaponSearch(query: string): Array<WeaponConcise> | undefined {
  return useLiveQuery(() => {
    if (!query.trim()) {
      return db.weaponsConcise.toArray();
    }
    const lowerQuery = query.toLowerCase();
    return db.weaponsConcise
      .filter((weapon: WeaponConcise) => weapon.name.toLowerCase().includes(lowerQuery))
      .toArray();
  }, [query]);
}

/**
 * Get the total count of weapons in the database
 */
export function useWeaponCount(): number | undefined {
  return useLiveQuery(() => db.weaponsConcise.count());
}

/**
 * Get all unique item types (weapon categories)
 */
export function useUniqueItemTypes(): Array<string> | undefined {
  return useLiveQuery(async () => {
    const weapons = await db.weaponsConcise.toArray();
    const types = new Set(weapons.map((w: WeaponConcise) => w.itemType));
    return Array.from(types).sort();
  });
}

/**
 * Get the cached manifest version
 */
export function useCachedVersion(): string | undefined {
  return useLiveQuery(async () => {
    const entry = await db.metadata.get("version");
    return entry?.value;
  });
}

/**
 * Get damage type icons from cached manifest data
 * Returns a map of damage type enum value to Bungie icon URL
 */
export function useDamageTypeIcons(): DamageTypeIcons | undefined {
  return useLiveQuery(async () => {
    const entry = await db.helperData.get("damageTypeIcons");
    return entry?.data as DamageTypeIcons | undefined;
  });
}

/**
 * Get the maximum season number from all weapons
 * Returns undefined while loading, then the max season number
 */
export function useMaxSeason(): number | undefined {
  return useLiveQuery(async () => {
    const weapons = await db.weaponsConcise.toArray();
    let max = 0;
    for (const weapon of weapons) {
      if (weapon.season !== null && weapon.season > max) {
        max = weapon.season;
      }
    }
    return max;
  });
}
