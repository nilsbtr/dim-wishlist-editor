import { useEffect, useRef } from "react";

import { useLiveQuery } from "dexie-react-hooks";
import { Check, Filter, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { db } from "@/services/db/dexie";
import type { DamageTypeIcons } from "@/services/manifest/loader";

import type { WeaponFilters as WeaponFiltersType } from "./constants";
import {
  AVAILABLE_AMMO_TYPES,
  AVAILABLE_DAMAGE_TYPES,
  AVAILABLE_SLOTS,
  AVAILABLE_TIER_TYPES,
  DEFAULT_FILTERS,
} from "./constants";
import { FilterSection } from "./filter-section";

interface WeaponFiltersProps {
  filters: WeaponFiltersType;
  onFiltersChange: (filters: WeaponFiltersType) => void;
  availableItemTypes: Array<string>;
  maxSeason: number;
  className?: string;
}

export function WeaponFilters({
  filters,
  onFiltersChange,
  availableItemTypes,
  maxSeason,
  className,
}: WeaponFiltersProps) {
  // Initialize season range to 1-maxSeason when the real value loads
  const lastInitializedMaxRef = useRef<number | null>(null);
  useEffect(() => {
    // Only initialize once we have a real value (not 0)
    // and only if we haven't already initialized with this maxSeason
    if (maxSeason > 0 && lastInitializedMaxRef.current !== maxSeason) {
      lastInitializedMaxRef.current = maxSeason;
      // Update if the current range uses a different max (either default or stale)
      if (filters.seasonRange[1] !== maxSeason) {
        onFiltersChange({
          ...filters,
          seasonRange: [filters.seasonRange[0], maxSeason],
        });
      }
    }
  }, [maxSeason, filters, onFiltersChange]);

  // Get damage type icons from database
  const damageTypeIcons = useLiveQuery(async () => {
    const entry = await db.helperData.get("damageTypeIcons");
    return entry?.data as DamageTypeIcons | undefined;
  }, []);

  const hasActiveFilters =
    filters.itemType !== null ||
    filters.tierType !== null ||
    filters.damageTypes.length > 0 ||
    filters.ammoTypes.length > 0 ||
    filters.slots.length > 0 ||
    filters.seasonRange[0] !== 1 ||
    filters.seasonRange[1] !== maxSeason ||
    filters.showWishlisted !== null;

  // Count active filters
  const activeFilterCount = [
    filters.itemType !== null,
    filters.tierType !== null,
    filters.damageTypes.length > 0,
    filters.ammoTypes.length > 0,
    filters.slots.length > 0,
    filters.seasonRange[0] !== 1 || filters.seasonRange[1] !== maxSeason,
    filters.showWishlisted !== null,
  ].filter(Boolean).length;

  const toggleArrayFilter = <T,>(
    key: keyof WeaponFiltersType,
    value: T,
    currentArray: Array<T>
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray });
  };

  const resetFilters = () => {
    onFiltersChange({
      ...DEFAULT_FILTERS,
      seasonRange: [1, maxSeason],
    });
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Filter className="text-primary size-4" />
          </div>
          <div>
            <span className="text-sm font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 inline-flex size-5 items-center justify-center rounded-full text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
      </div>

      <div className="from-border via-border/50 mx-4 h-px bg-gradient-to-r to-transparent" />

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {/* Weapon Type - Dropdown */}
          {availableItemTypes.length > 0 && (
            <FilterSection title="Weapon Type">
              <Select
                value={filters.itemType ?? "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    itemType: value === "all" ? null : value,
                  })
                }
              >
                <SelectTrigger className="bg-background/50 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableItemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
          )}

          {/* Rarity - Pills with colors */}
          <FilterSection title="Rarity">
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TIER_TYPES.map(({ value, label, color }) => {
                const isSelected = filters.tierType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        tierType: isSelected ? null : value,
                      })
                    }
                    className={cn(
                      "relative flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-200",
                      isSelected
                        ? "border-transparent text-black shadow-md"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                    style={{
                      backgroundColor: isSelected ? color : undefined,
                      boxShadow: isSelected ? `0 0 20px -5px ${color}` : undefined,
                    }}
                  >
                    {isSelected && <Check className="size-3" />}
                    <span style={{ color: isSelected ? undefined : color }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Damage Type - Icon Toggles */}
          <FilterSection title="Element">
            <div className="grid grid-cols-6 gap-1.5">
              {AVAILABLE_DAMAGE_TYPES.map(({ value, label, color }) => {
                const isSelected = filters.damageTypes.includes(value);
                const iconSrc = damageTypeIcons?.[value];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleArrayFilter("damageTypes", value, filters.damageTypes)}
                    title={label}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-lg border transition-all duration-200",
                      isSelected
                        ? "border-transparent shadow-lg"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? `color-mix(in oklch, ${color} 30%, transparent)`
                        : undefined,
                      boxShadow: isSelected
                        ? `0 0 16px -4px ${color}, 0 0 0 1px ${color}`
                        : undefined,
                    }}
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={label}
                        className="size-5 object-contain"
                        style={{
                          filter: isSelected
                            ? "brightness(1.3) saturate(1.2)"
                            : "brightness(0.7) saturate(0.8)",
                        }}
                      />
                    ) : (
                      <div
                        className="size-5 rounded-full"
                        style={{
                          backgroundColor: color,
                          opacity: isSelected ? 1 : 0.6,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Ammo Type - Icon Toggles */}
          <FilterSection title="Ammo">
            <div className="grid grid-cols-6 gap-1.5">
              {AVAILABLE_AMMO_TYPES.map(({ value, label, color, icon }) => {
                const isSelected = filters.ammoTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleArrayFilter("ammoTypes", value, filters.ammoTypes)}
                    title={label}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-lg border transition-all duration-200",
                      isSelected
                        ? "border-transparent shadow-lg"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? `color-mix(in oklch, ${color} 25%, transparent)`
                        : undefined,
                      boxShadow: isSelected
                        ? `0 0 16px -4px ${color}, 0 0 0 1px ${color}`
                        : undefined,
                    }}
                  >
                    <img
                      src={icon}
                      alt={label}
                      className="size-5 object-contain"
                      style={{
                        filter: isSelected ? "brightness(1.3)" : "brightness(0.6)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Equipment Slot */}
          <FilterSection title="Slot">
            <div className="flex gap-1.5">
              {AVAILABLE_SLOTS.map(({ value, label }) => {
                const isSelected = filters.slots.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleArrayFilter("slots", value, filters.slots)}
                    className={cn(
                      "relative flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/15 text-primary shadow-sm"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {isSelected && <Check className="size-3" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Season Range */}
          <FilterSection title="Season">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">Range</Label>
                <span className="text-muted-foreground text-sm">
                  S{filters.seasonRange[0]} – S{filters.seasonRange[1]}
                </span>
              </div>
              <Slider
                value={filters.seasonRange}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    seasonRange: value as [number, number],
                  })
                }
                min={1}
                max={maxSeason}
                step={1}
              />
            </div>
          </FilterSection>

          {/* Wishlisted Filter */}
          <FilterSection title="Status">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    showWishlisted: filters.showWishlisted === true ? null : true,
                  })
                }
                className={cn(
                  "relative flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-200",
                  filters.showWishlisted === true
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-sm"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                {filters.showWishlisted === true && <Check className="size-3" />}
                Has Rolls
              </button>
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    showWishlisted: filters.showWishlisted === false ? null : false,
                  })
                }
                className={cn(
                  "relative flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-200",
                  filters.showWishlisted === false
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-400 shadow-sm"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                {filters.showWishlisted === false && <X className="size-3" />}
                No Rolls
              </button>
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  );
}
