import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PanelLeft, PanelLeftClose, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeaponFilters as WeaponFiltersType } from "@/features/weapon-browser";
import { DEFAULT_FILTERS, WeaponFiltersPanel, WeaponTable } from "@/features/weapon-browser";
import { manifestQueryOptions } from "@/hooks/useManifestLoader";
import { useMaxSeason, useUniqueItemTypes, useWeapons } from "@/hooks/useWeapons";
import { useWishlist, useWishlistedWeaponHashes } from "@/hooks/useWishlists";
import { cn } from "@/lib/utils";
import type { WeaponConcise } from "@/types/weapons";

export const Route = createFileRoute("/edit/$wishlistId/")({
  component: WeaponBrowser,
});

function WeaponBrowser() {
  const { wishlistId } = Route.useParams();
  const navigate = useNavigate();

  const manifestQuery = useQuery(manifestQueryOptions);
  const wishlist = useWishlist(wishlistId);
  const weapons = useWeapons();
  const itemTypes = useUniqueItemTypes();
  const wishlistedHashes = useWishlistedWeaponHashes(wishlistId);

  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<WeaponFiltersType>(DEFAULT_FILTERS);

  const isLoading =
    manifestQuery.isLoading ||
    wishlist === undefined ||
    weapons === undefined ||
    itemTypes === undefined;

  const wishlistedHashSet = useMemo(() => new Set(wishlistedHashes ?? []), [wishlistedHashes]);
  const maxSeasonFromDb = useMaxSeason();
  const maxSeason = maxSeasonFromDb ?? 28;

  const filteredWeapons = useMemo(() => {
    if (!weapons) return [];

    // Check if season range is at default (1 to maxSeason)
    const isSeasonRangeDefault =
      filters.seasonRange[0] === 1 && filters.seasonRange[1] === maxSeason;

    return weapons.filter((weapon: WeaponConcise) => {
      // Item type filter (single selection)
      if (filters.itemType !== null && weapon.itemType !== filters.itemType) {
        return false;
      }

      // Tier type filter (single selection)
      if (filters.tierType !== null && weapon.tierType !== filters.tierType) {
        return false;
      }

      // Damage type filter
      if (filters.damageTypes.length > 0 && !filters.damageTypes.includes(weapon.damageType)) {
        return false;
      }

      // Ammo type filter
      if (filters.ammoTypes.length > 0 && !filters.ammoTypes.includes(weapon.ammoType)) {
        return false;
      }

      // Slot filter
      if (filters.slots.length > 0 && !filters.slots.includes(weapon.slot)) {
        return false;
      }

      // Season filter
      if (weapon.season === null) {
        // Include unknown season weapons only when range is at default (fallback behavior)
        if (!isSeasonRangeDefault) {
          return false;
        }
      } else {
        // Filter by season range
        if (weapon.season < filters.seasonRange[0] || weapon.season > filters.seasonRange[1]) {
          return false;
        }
      }

      // Wishlisted filter
      if (filters.showWishlisted !== null) {
        const isWishlisted = wishlistedHashSet.has(weapon.hash);
        if (filters.showWishlisted !== isWishlisted) {
          return false;
        }
      }

      return true;
    });
  }, [weapons, filters, wishlistedHashSet, maxSeason]);

  // Calculate stats
  const wishlistedCount = wishlistedHashSet.size;
  const totalWeapons = weapons?.length ?? 0;

  if (!wishlist && !isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/5">
              <Target className="text-muted-foreground size-8" />
            </div>
            <h2 className="text-lg font-semibold">Wishlist not found</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              The wishlist you're looking for doesn't exist or has been deleted.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate({ to: "/edit" })}>
              <ArrowLeft className="size-4" />
              Back to Wishlists
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Breadcrumb */}
            <nav className="mb-2 flex items-center gap-2 text-sm">
              <Link
                to="/edit"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Wishlists
              </Link>
              <span className="text-muted-foreground/50">›</span>
              <span className="text-foreground truncate font-medium">
                {wishlist?.name ?? "..."}
              </span>
            </nav>

            {/* Title and description */}
            <div className="flex items-center gap-3">
              <div className="from-primary to-primary/70 hidden size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg sm:flex">
                <Target className="size-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {wishlist?.name ?? "Loading..."}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Browse and select weapons to add to your wishlist
                </p>
              </div>
            </div>
          </div>

          {/* Stats and actions */}
          <div className="flex shrink-0 items-center gap-4">
            {/* Quick stats */}
            <div className="hidden items-center gap-4 md:flex">
              <div className="text-right">
                <p className="text-primary text-lg font-bold tabular-nums">{wishlistedCount}</p>
                <p className="text-muted-foreground text-xs">tracked</p>
              </div>
              <div className="bg-border h-8 w-px" />
              <div className="text-right">
                <p className="text-foreground text-lg font-bold tabular-nums">
                  {totalWeapons.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs">total</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-2 border-white/10 bg-white/5",
                showFilters && "bg-primary/10 border-primary/30 text-primary"
              )}
            >
              {showFilters ? (
                <>
                  <PanelLeftClose className="size-4" />
                  <span className="hidden sm:inline">Hide Filters</span>
                </>
              ) : (
                <>
                  <PanelLeft className="size-4" />
                  <span className="hidden sm:inline">Show Filters</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1">
        {/* Filters Sidebar */}
        <aside
          className={cn(
            "border-r border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent transition-all duration-300",
            showFilters ? "w-72 shrink-0" : "w-0 overflow-hidden"
          )}
        >
          <WeaponFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableItemTypes={itemTypes ?? []}
            maxSeason={maxSeason}
            className={cn("h-full", !showFilters && "invisible")}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <WeaponTable
              weapons={filteredWeapons}
              wishlistId={wishlistId}
              wishlistedHashes={wishlistedHashSet}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="rounded-xl border border-white/10">
        <div className="border-b border-white/10 bg-white/[0.02] p-4">
          <div className="flex gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-4 border-b border-white/5 p-4 last:border-b-0",
              i % 2 === 0 && "bg-white/[0.01]"
            )}
          >
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
