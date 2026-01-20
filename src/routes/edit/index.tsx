import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Layers, LayoutGrid, Star, Target } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreateWishlistDialog,
  DeleteWishlistDialog,
  EditWishlistDialog,
  ExportWishlistDialog,
  ImportWishlist,
  WishlistCard,
} from "@/features/wishlists";
import { manifestQueryOptions } from "@/hooks/useManifestLoader";
import { useWishlists } from "@/hooks/useWishlists";
import type { Wishlist } from "@/types/wishlist";

export const Route = createFileRoute("/edit/")({
  component: WishlistDashboard,
});

function WishlistDashboard() {
  const manifestQuery = useQuery(manifestQueryOptions);
  const wishlists = useWishlists();

  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);
  const [deletingWishlist, setDeletingWishlist] = useState<Wishlist | null>(null);
  const [exportingWishlist, setExportingWishlist] = useState<Wishlist | null>(null);

  const isLoading = manifestQuery.isLoading || wishlists === undefined;

  const sortedWishlists = wishlists ? [...wishlists].sort((a, b) => b.updatedAt - a.updatedAt) : [];

  const getWishlistStats = (wishlist: Wishlist) => {
    const entries = Object.values(wishlist.weapons);
    const weaponCount = entries.length;
    const rollCount = entries.reduce((count, entry) => count + (entry?.rolls.length ?? 0), 0);
    return { weaponCount, rollCount };
  };

  // Calculate totals
  const totalWeapons = sortedWishlists.reduce((sum, w) => sum + Object.keys(w.weapons).length, 0);
  const totalRolls = sortedWishlists.reduce(
    (sum, w) =>
      sum + Object.values(w.weapons).reduce((r, entry) => r + (entry?.rolls.length ?? 0), 0),
    0
  );

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-primary/8 via-primary/3 absolute -top-32 -right-32 h-[500px] w-[600px] rounded-full bg-gradient-to-bl to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-40 h-96 w-[500px] rounded-full bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent blur-3xl" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                              linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Hero Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="from-primary to-primary/80 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
                <Layers className="size-6 text-black" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  Wishlists
                </h1>
                <p className="text-muted-foreground">Manage your weapon roll collections</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ImportWishlist />
            <CreateWishlistDialog />
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : sortedWishlists.length === 0 ? (
          <EmptyWishlistState />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
              >
                <StatsCard
                  icon={LayoutGrid}
                  label="Wishlists"
                  value={sortedWishlists.length}
                  accentColor="primary"
                />
              </div>
              <div
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: "50ms", animationFillMode: "forwards" }}
              >
                <StatsCard
                  icon={Target}
                  label="Weapons Tracked"
                  value={totalWeapons}
                  accentColor="blue"
                />
              </div>
              <div
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
              >
                <StatsCard icon={Star} label="Saved Rolls" value={totalRolls} accentColor="amber" />
              </div>
            </div>

            {/* Wishlist grid */}
            <div className="space-y-4">
              <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Your Wishlists
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sortedWishlists.map((wishlist, index) => {
                  const stats = getWishlistStats(wishlist);
                  return (
                    <div
                      key={wishlist.id}
                      className="animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                    >
                      <WishlistCard
                        wishlist={wishlist}
                        weaponCount={stats.weaponCount}
                        rollCount={stats.rollCount}
                        onEdit={setEditingWishlist}
                        onDelete={setDeletingWishlist}
                        onExport={setExportingWishlist}
                        index={index}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <EditWishlistDialog
          wishlist={editingWishlist}
          open={editingWishlist !== null}
          onOpenChange={(open) => !open && setEditingWishlist(null)}
        />

        <DeleteWishlistDialog
          wishlist={deletingWishlist}
          open={deletingWishlist !== null}
          onOpenChange={(open) => !open && setDeletingWishlist(null)}
        />

        <ExportWishlistDialog
          wishlist={exportingWishlist}
          open={exportingWishlist !== null}
          onOpenChange={(open) => !open && setExportingWishlist(null)}
        />
      </div>
    </div>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accentColor: "primary" | "blue" | "amber";
}) {
  const colorStyles = {
    primary: {
      bg: "from-primary/15 to-primary/5",
      icon: "bg-primary/20 text-primary",
      text: "text-primary",
    },
    blue: {
      bg: "from-blue-500/15 to-blue-500/5",
      icon: "bg-blue-500/20 text-blue-400",
      text: "text-blue-400",
    },
    amber: {
      bg: "from-amber-500/15 to-amber-500/5",
      icon: "bg-amber-500/20 text-amber-400",
      text: "text-amber-400",
    },
  };

  const styles = colorStyles[accentColor];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:from-white/[0.05]">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative flex items-center gap-4">
        <div className={`rounded-lg p-2.5 ${styles.icon}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {label}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${styles.text}`}>
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyWishlistState() {
  return (
    <Card className="border-dashed border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent">
      <CardContent className="py-16">
        <EmptyState
          icon={FolderOpen}
          title="No Wishlists Yet"
          description="Create a new wishlist or import an existing one using the buttons above."
        />
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border-white/5">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="size-8 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
