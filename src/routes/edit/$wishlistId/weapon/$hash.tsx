import { Link, createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RollEditorPanel, WeaponHeader } from "@/features/roll-editor";
import { manifestQueryOptions } from "@/hooks/useManifestLoader";
import { useDamageTypeIcons, useWeapon } from "@/hooks/useWeapons";
import { useWeaponEntry, useWishlist } from "@/hooks/useWishlists";
import {
  addRoll,
  deleteRoll,
  duplicateRoll,
  reorderRolls,
  updateRoll,
} from "@/services/db/wishlist-operations";

export const Route = createFileRoute("/edit/$wishlistId/weapon/$hash")({
  component: WeaponDetail,
});

function WeaponDetail() {
  const { wishlistId, hash } = Route.useParams();

  const weaponHash = parseInt(hash, 10);

  const manifestQuery = useQuery(manifestQueryOptions);
  const wishlist = useWishlist(wishlistId);
  const weapon = useWeapon(weaponHash);
  const weaponEntry = useWeaponEntry(wishlistId, weaponHash);
  const damageTypeIcons = useDamageTypeIcons();

  const rolls = weaponEntry?.rolls ?? [];
  const perkColumns = weapon?.perks ?? [];

  const damageTypeIconSrc = weapon ? damageTypeIcons?.[weapon.item.damageType] : null;

  const handleAddRoll = async (data: {
    usage: string;
    notes: string;
    perkHashes: Array<Array<number>>;
  }) => {
    try {
      await addRoll(wishlistId, weaponHash, data);
      toast.success("Roll added", {
        description: "The roll has been added to your wishlist.",
      });
    } catch (error) {
      toast.error("Failed to add roll", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleUpdateRoll = async (
    rollId: string,
    data: { usage: string; notes: string; perkHashes: Array<Array<number>> },
    silent = false
  ) => {
    try {
      await updateRoll(wishlistId, weaponHash, rollId, data);
      if (!silent) {
        toast.success("Roll updated", {
          description: "Your changes have been saved.",
        });
      }
    } catch (error) {
      toast.error("Failed to update roll", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleDeleteRoll = async (rollId: string) => {
    try {
      await deleteRoll(wishlistId, weaponHash, rollId);
      toast.success("Roll deleted", {
        description: "The roll has been removed from your wishlist.",
      });
    } catch (error) {
      toast.error("Failed to delete roll", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleDuplicateRoll = async (rollId: string) => {
    try {
      await duplicateRoll(wishlistId, weaponHash, rollId);
      toast.success("Roll duplicated", {
        description: "A copy of the roll has been created.",
      });
    } catch (error) {
      toast.error("Failed to duplicate roll", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleReorderRolls = async (rollIds: Array<string>) => {
    try {
      await reorderRolls(wishlistId, weaponHash, rollIds);
    } catch (error) {
      toast.error("Failed to reorder rolls", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  // Loading state
  if (manifestQuery.isLoading || wishlist === undefined || weapon === undefined) {
    return (
      <div className="relative flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="from-primary/3 absolute -top-20 right-0 size-64 rounded-full bg-gradient-to-bl via-transparent to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl flex-none space-y-3 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Link
                to="/edit"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Wishlists
              </Link>
              <ChevronRight className="text-muted-foreground/50 size-3" />
              <Link
                to="/edit/$wishlistId"
                params={{ wishlistId }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ...
              </Link>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-primary/3 absolute -top-20 right-0 size-64 rounded-full bg-gradient-to-bl via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
        {/* Compact Header with breadcrumbs, weapon info, and actions in one row */}
        <div className="flex flex-none flex-col gap-2">
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between gap-4">
            <nav className="flex items-center gap-1 text-sm">
              <Link
                to="/edit"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Wishlists
              </Link>
              <ChevronRight className="text-muted-foreground/50 size-3" />
              <Link
                to="/edit/$wishlistId"
                params={{ wishlistId }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {wishlist.name}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="group gap-2"
                render={
                  <a
                    href={`https://light.gg/db/items/${weaponHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                light.gg
                <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="group gap-2"
                render={
                  <a
                    href={`https://d2foundry.gg/w/${weaponHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                d2foundry.gg
                <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>

          {/* Weapon header - compact with frame inline */}
          <div className="bg-card rounded-lg border p-3">
            <WeaponHeader weapon={weapon} damageTypeIconSrc={damageTypeIconSrc} />
          </div>
        </div>

        {/* Roll Editor Panel - takes remaining space */}
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0">
            <RollEditorPanel
              rolls={rolls}
              perkColumns={perkColumns}
              onAddRoll={handleAddRoll}
              onUpdateRoll={handleUpdateRoll}
              onDeleteRoll={handleDeleteRoll}
              onDuplicateRoll={handleDuplicateRoll}
              onReorderRolls={handleReorderRolls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {/* Weapon Header Skeleton */}
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-start gap-3">
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <div className="hidden items-center gap-2 border-l pl-3 lg:flex">
            <Skeleton className="size-10 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Skeleton */}
      <div className="grid h-96 gap-4 lg:grid-cols-[220px_1fr]">
        <div className="bg-card space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="bg-card space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-16" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-32 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
