import { AMMO_TYPES, DAMAGE_TYPES, TIER_TYPES } from "@/lib/destiny-utils";

export interface WeaponFilters {
  itemType: string | null;
  tierType: number | null;
  damageTypes: Array<number>;
  ammoTypes: Array<number>;
  slots: Array<number>;
  seasonRange: [number, number];
  showWishlisted: boolean | null;
}

export const DEFAULT_FILTERS: WeaponFilters = {
  itemType: null,
  tierType: null,
  damageTypes: [],
  ammoTypes: [],
  slots: [],
  seasonRange: [1, 99], // Will be overridden with actual maxSeason from DB
  showWishlisted: null,
};

export const AVAILABLE_TIER_TYPES = [
  { value: TIER_TYPES.EXOTIC, label: "Exotic", color: "oklch(0.82 0.16 85)", shortLabel: "Exo" },
  {
    value: TIER_TYPES.LEGENDARY,
    label: "Legendary",
    color: "oklch(0.7 0.18 310)",
    shortLabel: "Leg",
  },
  { value: TIER_TYPES.RARE, label: "Rare", color: "oklch(0.68 0.16 250)", shortLabel: "Rare" },
  {
    value: TIER_TYPES.UNCOMMON,
    label: "Uncommon",
    color: "oklch(0.68 0.14 145)",
    shortLabel: "Unc",
  },
  { value: TIER_TYPES.COMMON, label: "Common", color: "oklch(0.6 0 0)", shortLabel: "Com" },
];

export const AVAILABLE_DAMAGE_TYPES = [
  { value: DAMAGE_TYPES.KINETIC, label: "Kinetic", color: "oklch(0.9 0 0)" },
  { value: DAMAGE_TYPES.ARC, label: "Arc", color: "oklch(0.7 0.2 240)" },
  { value: DAMAGE_TYPES.SOLAR, label: "Solar", color: "oklch(0.75 0.2 50)" },
  { value: DAMAGE_TYPES.VOID, label: "Void", color: "oklch(0.6 0.2 300)" },
  { value: DAMAGE_TYPES.STASIS, label: "Stasis", color: "oklch(0.7 0.15 220)" },
  { value: DAMAGE_TYPES.STRAND, label: "Strand", color: "oklch(0.7 0.2 145)" },
];

export const AVAILABLE_AMMO_TYPES = [
  {
    value: AMMO_TYPES.PRIMARY,
    label: "Primary",
    color: "oklch(0.9 0 0)",
    icon: "/icons/ammo-primary.svg",
  },
  {
    value: AMMO_TYPES.SPECIAL,
    label: "Special",
    color: "oklch(0.7 0.2 145)",
    icon: "/icons/ammo-special.svg",
  },
  {
    value: AMMO_TYPES.HEAVY,
    label: "Heavy",
    color: "oklch(0.6 0.15 310)",
    icon: "/icons/ammo-heavy.svg",
  },
];

export const AVAILABLE_SLOTS = [
  { value: 0, label: "Kinetic" },
  { value: 1, label: "Energy" },
  { value: 2, label: "Power" },
];
