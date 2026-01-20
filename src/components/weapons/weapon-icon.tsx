import { TIER_TYPES } from "@/lib/destiny-utils";
import { cn } from "@/lib/utils";

interface WeaponIconProps {
  iconSrc: string | null;
  watermarkSrc?: string | null;
  watermarkFeaturedSrc?: string | null;
  isFeatured?: boolean;
  tierType: number;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
  xl: "size-20",
};

const borderClasses: Record<number, string> = {
  [TIER_TYPES.EXOTIC]: "ring-[oklch(0.8_0.15_85)]",
  [TIER_TYPES.LEGENDARY]: "ring-[oklch(0.7_0.15_310)]",
  [TIER_TYPES.RARE]: "ring-[oklch(0.65_0.15_250)]",
  [TIER_TYPES.UNCOMMON]: "ring-[oklch(0.65_0.12_145)]",
  [TIER_TYPES.COMMON]: "ring-[oklch(0.5_0_0)]",
};

export function WeaponIcon({
  iconSrc,
  watermarkSrc,
  watermarkFeaturedSrc,
  isFeatured = false,
  tierType,
  name,
  size = "md",
  className,
}: WeaponIconProps) {
  const borderColor = borderClasses[tierType] ?? borderClasses[TIER_TYPES.COMMON];

  // Use featured watermark if weapon is featured and has one, otherwise use regular watermark
  const activeWatermark = isFeatured && watermarkFeaturedSrc ? watermarkFeaturedSrc : watermarkSrc;

  return (
    <div
      className={cn(
        "bg-muted relative overflow-hidden rounded-sm ring-1",
        borderColor,
        sizeClasses[size],
        className
      )}
    >
      {iconSrc ? (
        <>
          <img
            src={iconSrc}
            alt={name}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            draggable={false}
          />
          {activeWatermark && (
            <img
              src={activeWatermark}
              alt=""
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
              draggable={false}
            />
          )}
        </>
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center">
          <span className="text-xs">?</span>
        </div>
      )}
    </div>
  );
}
