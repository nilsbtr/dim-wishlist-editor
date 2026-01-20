/**
 * Destiny 2 utility constants and helper functions
 */

// =============================================================================
// Damage Types
// =============================================================================

export const DAMAGE_TYPES = {
  NONE: 0,
  KINETIC: 1,
  ARC: 2,
  SOLAR: 3,
  VOID: 4,
  STASIS: 6,
  STRAND: 7,
} as const;

export type DamageType = (typeof DAMAGE_TYPES)[keyof typeof DAMAGE_TYPES];

export const DAMAGE_TYPE_NAMES: Record<number, string> = {
  [DAMAGE_TYPES.NONE]: "None",
  [DAMAGE_TYPES.KINETIC]: "Kinetic",
  [DAMAGE_TYPES.ARC]: "Arc",
  [DAMAGE_TYPES.SOLAR]: "Solar",
  [DAMAGE_TYPES.VOID]: "Void",
  [DAMAGE_TYPES.STASIS]: "Stasis",
  [DAMAGE_TYPES.STRAND]: "Strand",
};

export const DAMAGE_TYPE_COLORS: Record<number, string> = {
  [DAMAGE_TYPES.NONE]: "text-foreground",
  [DAMAGE_TYPES.KINETIC]: "text-foreground",
  [DAMAGE_TYPES.ARC]: "text-[oklch(0.7_0.2_240)]",
  [DAMAGE_TYPES.SOLAR]: "text-[oklch(0.75_0.2_50)]",
  [DAMAGE_TYPES.VOID]: "text-[oklch(0.6_0.2_300)]",
  [DAMAGE_TYPES.STASIS]: "text-[oklch(0.7_0.15_220)]",
  [DAMAGE_TYPES.STRAND]: "text-[oklch(0.7_0.2_145)]",
};

export const DAMAGE_TYPE_BG_COLORS: Record<number, string> = {
  [DAMAGE_TYPES.NONE]: "bg-muted",
  [DAMAGE_TYPES.KINETIC]: "bg-muted",
  [DAMAGE_TYPES.ARC]: "bg-[oklch(0.7_0.2_240/0.15)]",
  [DAMAGE_TYPES.SOLAR]: "bg-[oklch(0.75_0.2_50/0.15)]",
  [DAMAGE_TYPES.VOID]: "bg-[oklch(0.6_0.2_300/0.15)]",
  [DAMAGE_TYPES.STASIS]: "bg-[oklch(0.7_0.15_220/0.15)]",
  [DAMAGE_TYPES.STRAND]: "bg-[oklch(0.7_0.2_145/0.15)]",
};

// =============================================================================
// Ammo Types
// =============================================================================

export const AMMO_TYPES = {
  NONE: 0,
  PRIMARY: 1,
  SPECIAL: 2,
  HEAVY: 3,
} as const;

export type AmmoType = (typeof AMMO_TYPES)[keyof typeof AMMO_TYPES];

export const AMMO_TYPE_NAMES: Record<number, string> = {
  [AMMO_TYPES.NONE]: "None",
  [AMMO_TYPES.PRIMARY]: "Primary",
  [AMMO_TYPES.SPECIAL]: "Special",
  [AMMO_TYPES.HEAVY]: "Heavy",
};

export const AMMO_TYPE_COLORS: Record<number, string> = {
  [AMMO_TYPES.NONE]: "text-muted-foreground",
  [AMMO_TYPES.PRIMARY]: "text-foreground",
  [AMMO_TYPES.SPECIAL]: "text-[oklch(0.7_0.2_145)]",
  [AMMO_TYPES.HEAVY]: "text-[oklch(0.6_0.15_310)]",
};

export const AMMO_TYPE_BG_COLORS: Record<number, string> = {
  [AMMO_TYPES.NONE]: "bg-muted",
  [AMMO_TYPES.PRIMARY]: "bg-muted",
  [AMMO_TYPES.SPECIAL]: "bg-[oklch(0.7_0.2_145/0.15)]",
  [AMMO_TYPES.HEAVY]: "bg-[oklch(0.6_0.15_310/0.15)]",
};

// =============================================================================
// Tier Types (Rarity)
// =============================================================================

export const TIER_TYPES = {
  UNKNOWN: 0,
  CURRENCY: 1,
  COMMON: 2,
  UNCOMMON: 3,
  RARE: 4,
  LEGENDARY: 5,
  EXOTIC: 6,
} as const;

export type TierType = (typeof TIER_TYPES)[keyof typeof TIER_TYPES];

export const TIER_TYPE_NAMES: Record<number, string> = {
  [TIER_TYPES.UNKNOWN]: "Unknown",
  [TIER_TYPES.CURRENCY]: "Currency",
  [TIER_TYPES.COMMON]: "Common",
  [TIER_TYPES.UNCOMMON]: "Uncommon",
  [TIER_TYPES.RARE]: "Rare",
  [TIER_TYPES.LEGENDARY]: "Legendary",
  [TIER_TYPES.EXOTIC]: "Exotic",
};

export const TIER_TYPE_COLORS: Record<number, string> = {
  [TIER_TYPES.UNKNOWN]: "text-muted-foreground",
  [TIER_TYPES.CURRENCY]: "text-muted-foreground",
  [TIER_TYPES.COMMON]: "text-[oklch(0.7_0_0)]",
  [TIER_TYPES.UNCOMMON]: "text-[oklch(0.65_0.12_145)]",
  [TIER_TYPES.RARE]: "text-[oklch(0.65_0.15_250)]",
  [TIER_TYPES.LEGENDARY]: "text-[oklch(0.7_0.15_310)]",
  [TIER_TYPES.EXOTIC]: "text-[oklch(0.8_0.15_85)]",
};

export const TIER_TYPE_BG_COLORS: Record<number, string> = {
  [TIER_TYPES.UNKNOWN]: "bg-muted",
  [TIER_TYPES.CURRENCY]: "bg-muted",
  [TIER_TYPES.COMMON]: "bg-[oklch(0.7_0_0/0.15)]",
  [TIER_TYPES.UNCOMMON]: "bg-[oklch(0.65_0.12_145/0.15)]",
  [TIER_TYPES.RARE]: "bg-[oklch(0.65_0.15_250/0.15)]",
  [TIER_TYPES.LEGENDARY]: "bg-[oklch(0.7_0.15_310/0.15)]",
  [TIER_TYPES.EXOTIC]: "bg-[oklch(0.8_0.15_85/0.15)]",
};

// Sort order for tiers (higher = rarer)
export const TIER_TYPE_SORT_ORDER: Record<number, number> = {
  [TIER_TYPES.EXOTIC]: 6,
  [TIER_TYPES.LEGENDARY]: 5,
  [TIER_TYPES.RARE]: 4,
  [TIER_TYPES.UNCOMMON]: 3,
  [TIER_TYPES.COMMON]: 2,
  [TIER_TYPES.CURRENCY]: 1,
  [TIER_TYPES.UNKNOWN]: 0,
};

// =============================================================================
// Slot Types
// =============================================================================

export const SLOT_TYPES = {
  KINETIC: 0,
  ENERGY: 1,
  POWER: 2,
} as const;

export type SlotType = (typeof SLOT_TYPES)[keyof typeof SLOT_TYPES];

export const SLOT_TYPE_NAMES: Record<number, string> = {
  [SLOT_TYPES.KINETIC]: "Kinetic",
  [SLOT_TYPES.ENERGY]: "Energy",
  [SLOT_TYPES.POWER]: "Power",
};

// =============================================================================
// Helper Functions
// =============================================================================

export function getDamageTypeName(damageType: number): string {
  return DAMAGE_TYPE_NAMES[damageType] ?? "Unknown";
}

export function getDamageTypeColor(damageType: number): string {
  return DAMAGE_TYPE_COLORS[damageType] ?? "text-foreground";
}

export function getDamageTypeBgColor(damageType: number): string {
  return DAMAGE_TYPE_BG_COLORS[damageType] ?? "bg-muted";
}

export function getAmmoTypeName(ammoType: number): string {
  return AMMO_TYPE_NAMES[ammoType] ?? "Unknown";
}

export function getAmmoTypeColor(ammoType: number): string {
  return AMMO_TYPE_COLORS[ammoType] ?? "text-muted-foreground";
}

export function getAmmoTypeBgColor(ammoType: number): string {
  return AMMO_TYPE_BG_COLORS[ammoType] ?? "bg-muted";
}

export function getTierTypeName(tierType: number): string {
  return TIER_TYPE_NAMES[tierType] ?? "Unknown";
}

export function getTierTypeColor(tierType: number): string {
  return TIER_TYPE_COLORS[tierType] ?? "text-muted-foreground";
}

export function getTierTypeBgColor(tierType: number): string {
  return TIER_TYPE_BG_COLORS[tierType] ?? "bg-muted";
}

export function getSlotTypeName(slot: number): string {
  return SLOT_TYPE_NAMES[slot] ?? "Unknown";
}

/**
 * Format a season number for display
 */
export function formatSeason(season: number | null): string {
  if (season === null) return "—";
  if (season === 0) return "Base";
  return `S${season}`;
}

/**
 * Get CSS classes for a tier type
 */
export function getTierClasses(tierType: number): string {
  switch (tierType) {
    case TIER_TYPES.EXOTIC:
      return "tier-exotic";
    case TIER_TYPES.LEGENDARY:
      return "tier-legendary";
    case TIER_TYPES.RARE:
      return "tier-rare";
    case TIER_TYPES.UNCOMMON:
      return "tier-uncommon";
    default:
      return "tier-common";
  }
}

/**
 * Get CSS classes for a damage type
 */
export function getDamageClasses(damageType: number): string {
  switch (damageType) {
    case DAMAGE_TYPES.ARC:
      return "damage-arc";
    case DAMAGE_TYPES.SOLAR:
      return "damage-solar";
    case DAMAGE_TYPES.VOID:
      return "damage-void";
    case DAMAGE_TYPES.STASIS:
      return "damage-stasis";
    case DAMAGE_TYPES.STRAND:
      return "damage-strand";
    default:
      return "damage-kinetic";
  }
}

/**
 * Compare function for sorting weapons by: Season (desc) → Rarity (desc) → Name (asc)
 * Weapons with null season are sorted to the end
 */
export function compareWeapons(
  a: { season: number | null; tierType: number; name: string },
  b: { season: number | null; tierType: number; name: string }
): number {
  // Season: descending (newer first), nulls at the end
  const seasonA = a.season ?? -1;
  const seasonB = b.season ?? -1;
  if (seasonA !== seasonB) {
    return seasonB - seasonA;
  }

  // Rarity: descending (exotic first)
  const tierOrderA = TIER_TYPE_SORT_ORDER[a.tierType] ?? 0;
  const tierOrderB = TIER_TYPE_SORT_ORDER[b.tierType] ?? 0;
  if (tierOrderA !== tierOrderB) {
    return tierOrderB - tierOrderA;
  }

  // Name: ascending (alphabetical)
  return a.name.localeCompare(b.name);
}
