import { Link, createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Database,
  ExternalLink,
  FileText,
  List,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { manifestQueryOptions } from "@/hooks/useManifestLoader";
import { useWeaponCount } from "@/hooks/useWeapons";
import { useGlobalStats } from "@/hooks/useWishlists";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const manifestQuery = useQuery(manifestQueryOptions);
  const weaponCount = useWeaponCount();
  const globalStats = useGlobalStats();

  const isLoading = manifestQuery.isLoading;
  const isInitialized = weaponCount !== undefined && weaponCount > 0;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-primary/5 absolute -top-40 -right-40 size-96 rounded-full bg-gradient-to-bl via-transparent to-transparent blur-3xl" />
        <div className="from-primary/3 absolute -bottom-20 -left-20 size-72 rounded-full bg-gradient-to-tr via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-10 px-4 py-10">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-500">
            <Sparkles className="size-4" />
            <span>Destiny 2 Weapon Rolls</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="from-foreground via-foreground/90 to-foreground/70 bg-gradient-to-r bg-clip-text text-transparent">
                DIM Wishlist
              </span>
              <br />
              <span className="text-primary">Editor</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Create and manage wishlists for Destiny Item Manager. Define your ideal weapon rolls,
              and never miss a god roll again.
            </p>
          </div>

          {isInitialized && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" render={<Link to="/edit" />} className="gap-2">
                <List className="size-5" />
                View Wishlists
                <ArrowRight className="size-4" />
              </Button>
              {globalStats && globalStats.wishlistCount === 0 && (
                <Button variant="outline" size="lg" render={<Link to="/edit" />}>
                  Create Your First Wishlist
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : !isInitialized ? (
          <InitializingState />
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Weapons"
                value={weaponCount}
                description="Available in database"
                icon={Target}
                gradient="from-blue-500/20 to-blue-600/5"
                iconColor="text-blue-500"
              />
              <StatCard
                title="Wishlists"
                value={globalStats?.wishlistCount ?? 0}
                description="Created locally"
                icon={List}
                gradient="from-amber-500/20 to-amber-600/5"
                iconColor="text-amber-500"
              />
              <StatCard
                title="Saved Rolls"
                value={globalStats?.totalRolls ?? 0}
                description="Across all wishlists"
                icon={FileText}
                gradient="from-emerald-500/20 to-emerald-600/5"
                iconColor="text-emerald-500"
              />
            </div>

            {/* Info Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="group relative overflow-hidden">
                <div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Zap className="text-primary size-5" />
                    </div>
                    What are Wishlists?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground relative space-y-3 text-sm">
                  <p>
                    Wishlists help you identify your ideal weapon rolls in Destiny 2. When imported
                    into DIM (Destiny Item Manager), weapons matching your wishlist criteria are
                    highlighted with a thumbs-up icon.
                  </p>
                  <p>
                    You can define multiple rolls per weapon, specify which perks to look for, and
                    add notes explaining why certain combinations are desirable.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden">
                <div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Sparkles className="text-primary size-5" />
                    </div>
                    How to Use
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground relative space-y-3 text-sm">
                  <ol className="list-inside list-decimal space-y-2.5">
                    <li className="leading-relaxed">
                      <span className="text-foreground font-medium">Create</span> a new wishlist or
                      import an existing one
                    </li>
                    <li className="leading-relaxed">
                      <span className="text-foreground font-medium">Browse</span> weapons and select
                      the ones you want to track
                    </li>
                    <li className="leading-relaxed">
                      <span className="text-foreground font-medium">Add rolls</span> with your
                      preferred perk combinations
                    </li>
                    <li className="leading-relaxed">
                      <span className="text-foreground font-medium">Export</span> to DIM format and
                      import in Destiny Item Manager
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Resources */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resources</CardTitle>
                <CardDescription>Helpful links for Destiny 2 loadout management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group gap-2"
                    render={
                      <a
                        href="https://destinyitemmanager.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <span className="size-4 rounded bg-gradient-to-br from-orange-400 to-orange-600" />
                    Destiny Item Manager
                    <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group gap-2"
                    render={<a href="https://light.gg" target="_blank" rel="noopener noreferrer" />}
                  >
                    <span className="size-4 rounded bg-gradient-to-br from-cyan-400 to-cyan-600" />
                    light.gg
                    <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group gap-2"
                    render={
                      <a href="https://d2foundry.gg" target="_blank" rel="noopener noreferrer" />
                    }
                  >
                    <span className="size-4 rounded bg-gradient-to-br from-rose-400 to-rose-600" />
                    d2foundry.gg
                    <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  iconColor,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <CardContent className="relative pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-4xl font-bold tracking-tight tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
          <div className="bg-muted/80 rounded-xl p-3 transition-transform duration-300 group-hover:scale-110">
            <Icon className={`size-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InitializingState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16">
        <EmptyState
          icon={Database}
          title="Initializing Database"
          description="Loading weapon data from the Destiny 2 manifest. This only happens once and may take a moment..."
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="border-primary/30 size-12 animate-spin rounded-full border-4 border-t-transparent" />
              <div className="border-primary absolute inset-0 size-12 animate-ping rounded-full border opacity-20" />
            </div>
            <span className="text-muted-foreground text-sm">Loading manifest data...</span>
          </div>
        </EmptyState>
      </CardContent>
    </Card>
  );
}
