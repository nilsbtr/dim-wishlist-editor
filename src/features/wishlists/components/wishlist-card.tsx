import { Link } from "@tanstack/react-router";

import {
  ArrowRight,
  Calendar,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Target,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Wishlist } from "@/types/wishlist";

interface WishlistCardProps {
  wishlist: Wishlist;
  weaponCount: number;
  rollCount: number;
  onEdit: (wishlist: Wishlist) => void;
  onDelete: (wishlist: Wishlist) => void;
  onExport: (wishlist: Wishlist) => void;
  index?: number;
}

export function WishlistCard({
  wishlist,
  weaponCount,
  rollCount,
  onEdit,
  onDelete,
  onExport,
  index = 0,
}: WishlistCardProps) {
  const updatedDate = new Date(wishlist.updatedAt);
  const formattedDate = updatedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Vibrant accent colors with glow effects
  const accentColors = [
    {
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      border: "hover:border-amber-500/40",
    },
    {
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/20",
      border: "hover:border-blue-500/40",
    },
    {
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/20",
      border: "hover:border-emerald-500/40",
    },
    {
      gradient: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/20",
      border: "hover:border-purple-500/40",
    },
    {
      gradient: "from-rose-500 to-red-500",
      glow: "shadow-rose-500/20",
      border: "hover:border-rose-500/40",
    },
    {
      gradient: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/20",
      border: "hover:border-cyan-500/40",
    },
  ];
  const accent = accentColors[index % accentColors.length];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] transition-all duration-300",
        accent.border,
        "hover:shadow-xl",
        accent.glow
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r opacity-50 transition-opacity duration-300 group-hover:opacity-100",
          accent.gradient
        )}
      />

      {/* Hover glow effect */}
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30",
          accent.gradient
        )}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Link
            to="/edit/$wishlistId"
            params={{ wishlistId: wishlist.id }}
            className="group/link min-w-0 flex-1"
          >
            <h3 className="group-hover/link:text-primary truncate text-lg font-semibold tracking-tight transition-colors">
              {wishlist.name}
            </h3>
            {wishlist.description && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
                {wishlist.description}
              </p>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground opacity-0 transition-all group-hover:opacity-100"
                />
              }
            >
              <MoreVertical className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(wishlist)}>
                <Pencil className="size-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(wishlist)}>
                <Download className="size-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(wishlist)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="gap-1.5 border border-white/10 bg-white/5 font-medium backdrop-blur-sm"
          >
            <Target className="size-3.5" />
            <span className="tabular-nums">{weaponCount}</span>
            <span className="text-muted-foreground font-normal">
              weapon{weaponCount !== 1 ? "s" : ""}
            </span>
          </Badge>
          <Badge
            variant="secondary"
            className="gap-1.5 border border-white/10 bg-white/5 font-medium backdrop-blur-sm"
          >
            <FileText className="size-3.5" />
            <span className="tabular-nums">{rollCount}</span>
            <span className="text-muted-foreground font-normal">
              roll{rollCount !== 1 ? "s" : ""}
            </span>
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Calendar className="size-3" />
            {formattedDate}
          </span>
          <Link
            to="/edit/$wishlistId"
            params={{ wishlistId: wishlist.id }}
            className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs font-medium transition-colors"
          >
            Open
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
