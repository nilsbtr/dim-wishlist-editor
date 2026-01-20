import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Github, Home, List, RefreshCw, Sparkles, Twitter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { forceManifestRefresh } from "@/services/manifest/loader";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const navItems: Array<NavItem> = [
  { to: "/", label: "Home", icon: <Home className="size-4" />, exact: true },
  { to: "/edit", label: "Wishlists", icon: <List className="size-4" /> },
];

export function AppHeader() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return currentPath === item.to;
    }
    return currentPath.startsWith(item.to);
  };

  const handleRefreshManifest = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    toast.info("Refreshing manifest...", { id: "manifest-refresh" });

    try {
      const result = await forceManifestRefresh();
      // Invalidate all queries to force refetch with new data
      await queryClient.invalidateQueries();
      toast.success("Manifest refreshed!", {
        id: "manifest-refresh",
        description: `${result.weaponCount} weapons loaded`,
      });
    } catch (error) {
      toast.error("Failed to refresh manifest", {
        id: "manifest-refresh",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="from-primary to-primary/80 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="size-4 text-black" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              DIM Wishlist Editor
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Button
                key={item.to}
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 transition-all",
                  isActive(item)
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                )}
                render={<Link to={item.to} />}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Refresh Manifest Button */}
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleRefreshManifest}
                    disabled={isRefreshing}
                  />
                }
              >
                <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
              </TooltipTrigger>
              <TooltipContent>Refresh Manifest</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Social links */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
            render={
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              />
            }
          >
            <Github className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
            render={
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              />
            }
          >
            <Twitter className="size-4" />
          </Button>

          {/* Mobile Nav */}
          <nav className="flex items-center gap-1 sm:hidden">
            {navItems.map((item) => (
              <Button
                key={item.to}
                variant="ghost"
                size="icon-sm"
                className={cn(
                  isActive(item)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                render={<Link to={item.to} />}
              >
                {item.icon}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
