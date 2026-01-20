import { Gem, Sparkles, Star, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Displays a damage type icon from Bungie's CDN.
 * The iconSrc comes from DestinyDamageTypeDefinition.displayProperties.icon
 */
export function DamageTypeIcon({
  iconSrc,
  className,
}: {
  /** Icon URL from DestinyDamageTypeDefinition.displayProperties.icon (Bungie CDN) */
  iconSrc: string;
  className?: string;
}) {
  return (
    <img
      src={iconSrc}
      alt=""
      className={cn("h-[1em] w-[1em] object-contain", className)}
      loading="lazy"
    />
  );
}

const AMMO_TYPE_ICONS: Record<number, string> = {
  0: "/icons/ammo-primary.svg",
  1: "/icons/ammo-primary.svg",
  2: "/icons/ammo-special.svg",
  3: "/icons/ammo-heavy.svg",
};

export function AmmoTypeIcon({ ammoType, className }: { ammoType: number; className?: string }) {
  const iconSrc = AMMO_TYPE_ICONS[ammoType] ?? AMMO_TYPE_ICONS[1];

  return (
    <img
      src={iconSrc}
      alt=""
      className={cn("h-[1em] w-[1em] object-contain", className)}
      loading="lazy"
    />
  );
}

export function CraftableIcon({ className }: { className?: string }) {
  return <Wrench className={cn("h-[1em] w-[1em] text-[oklch(0.7_0.2_50)]", className)} />;
}

export function AdeptIcon({ className }: { className?: string }) {
  return <Gem className={cn("h-[1em] w-[1em] text-[oklch(0.8_0.15_85)]", className)} />;
}

export function WishlistedIcon({ className }: { className?: string }) {
  return <Star className={cn("text-warning h-[1em] w-[1em] fill-current", className)} />;
}

export function HolofoilIcon({ className }: { className?: string }) {
  return <Sparkles className={cn("h-[1em] w-[1em] text-[oklch(0.75_0.2_200)]", className)} />;
}
