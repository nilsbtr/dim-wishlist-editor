import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AdeptIcon,
  AmmoTypeIcon,
  CraftableIcon,
  DamageTypeIcon,
  HolofoilIcon,
  WeaponIcon,
} from "@/components/weapons";
import {
  getAmmoTypeBgColor,
  getAmmoTypeColor,
  getAmmoTypeName,
  getDamageTypeBgColor,
  getDamageTypeColor,
  getDamageTypeName,
  getTierTypeBgColor,
  getTierTypeColor,
  getTierTypeName,
} from "@/lib/destiny-utils";
import { cn } from "@/lib/utils";
import type { WeaponFull } from "@/types/weapons";

interface WeaponHeaderProps {
  weapon: WeaponFull;
  damageTypeIconSrc?: string | null;
}

export function WeaponHeader({ weapon, damageTypeIconSrc }: WeaponHeaderProps) {
  const { item, frame } = weapon;

  return (
    <div className="flex w-full items-center gap-3">
      {/* Weapon Icon - properly sized */}
      <WeaponIcon
        iconSrc={item.iconSrc}
        watermarkSrc={item.watermarkSrc}
        watermarkFeaturedSrc={item.watermarkFeaturedSrc}
        isFeatured={item.isFeatured}
        tierType={item.tierType}
        name={item.name}
        size="lg"
        className="shrink-0"
      />

      {/* Weapon Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Title row with boolean indicators */}
        <div className="flex items-center gap-2">
          <h2 className="truncate text-xl leading-tight font-semibold">{item.name}</h2>
          {/* Boolean indicators */}
          <div className="flex shrink-0 items-center gap-1.5">
            {item.isAdept && (
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <AdeptIcon className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent>Adept</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {item.isCraftable && (
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <CraftableIcon className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent>Craftable</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {item.isHolofoil && (
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <HolofoilIcon className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent>Holofoil</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Subtitle: itemType */}
        <p className="text-muted-foreground text-sm leading-tight">{item.itemType}</p>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Season */}
          <Badge variant="outline" className="h-6 px-2 text-xs font-medium">
            {item.season !== null ? `Season ${item.season}` : "No Season"}
          </Badge>

          {/* Tier with color */}
          <Badge
            variant="secondary"
            className={cn(
              "h-6 px-2 text-xs font-medium",
              getTierTypeColor(item.tierType),
              getTierTypeBgColor(item.tierType)
            )}
          >
            {getTierTypeName(item.tierType)}
          </Badge>

          {/* Damage type with icon and color */}
          <Badge
            variant="secondary"
            className={cn(
              "h-6 gap-1 px-2 text-xs font-medium",
              getDamageTypeColor(item.damageType),
              getDamageTypeBgColor(item.damageType)
            )}
          >
            {damageTypeIconSrc && (
              <DamageTypeIcon iconSrc={damageTypeIconSrc} className="size-3.5" />
            )}
            {getDamageTypeName(item.damageType)}
          </Badge>

          {/* Ammo type with icon and color */}
          <Badge
            variant="secondary"
            className={cn(
              "h-6 gap-1 px-2 text-xs font-medium",
              getAmmoTypeColor(item.ammoType),
              getAmmoTypeBgColor(item.ammoType)
            )}
          >
            <AmmoTypeIcon ammoType={item.ammoType} className="size-3.5" />
            {getAmmoTypeName(item.ammoType)}
          </Badge>
        </div>
      </div>

      {/* Frame info - compact with tooltip for description */}
      {frame && (
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="bg-muted/30 hidden shrink-0 cursor-help items-center gap-2.5 rounded-lg border px-3 py-2 lg:flex">
                  {frame.iconSrc && (
                    <img
                      src={frame.iconSrc}
                      alt=""
                      className="size-10 shrink-0 rounded-md"
                      loading="lazy"
                      draggable={false}
                    />
                  )}
                  <span className="max-w-32 truncate text-sm font-medium">{frame.name}</span>
                </div>
              }
            />
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-semibold">{frame.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">{frame.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
