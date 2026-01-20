import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, GripVertical, X } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Perk } from "@/types/weapons";

import { PerkTooltipContent } from "./perk-tooltip";

interface SortablePerkItemProps {
  perk: Perk;
  index: number;
  onToggle: () => void;
}

export function SortablePerkItem({ perk, index, onToggle }: SortablePerkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: perk.hash,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className={cn(
                  "group flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-all",
                  perk.isDeprecated
                    ? "bg-destructive/10 ring-destructive/30 ring-1"
                    : "bg-primary/10 ring-primary/50 ring-1"
                )}
              >
                {/* Drag handle */}
                <button
                  type="button"
                  {...attributes}
                  {...listeners}
                  className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab touch-none active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="size-3" />
                </button>

                {/* Priority number */}
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                    perk.isDeprecated
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {index + 1}
                </span>

                {/* Perk icon */}
                <div
                  className={cn(
                    "relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded border transition-colors",
                    perk.isDeprecated
                      ? "border-destructive/50 bg-destructive/20"
                      : "border-primary bg-primary/20"
                  )}
                >
                  {perk.iconSrc ? (
                    <img
                      src={perk.iconSrc}
                      alt=""
                      className="size-full rounded object-contain p-0.5"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-muted-foreground text-[10px]">?</span>
                  )}
                </div>

                {/* Perk name */}
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-xs font-medium",
                    perk.isDeprecated && "text-destructive"
                  )}
                >
                  {perk.name}
                </span>

                {/* Deprecated indicator */}
                {perk.isDeprecated && (
                  <AlertTriangle className="text-destructive size-3 shrink-0" />
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            }
          />
          <TooltipContent side="right" className="max-w-xs">
            <PerkTooltipContent perk={perk} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface PerkItemOverlayProps {
  perk: Perk;
}

export function PerkItemOverlay({ perk }: PerkItemOverlayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-1.5 py-1 shadow-lg ring-2",
        perk.isDeprecated ? "bg-destructive/10 ring-destructive" : "bg-primary/10 ring-primary"
      )}
    >
      <GripVertical className="text-muted-foreground size-3" />
      <div
        className={cn(
          "flex size-6 items-center justify-center overflow-hidden rounded border",
          perk.isDeprecated
            ? "border-destructive/50 bg-destructive/20"
            : "border-primary bg-primary/20"
        )}
      >
        {perk.iconSrc ? (
          <img src={perk.iconSrc} alt="" className="size-full rounded object-contain p-0.5" />
        ) : (
          <span className="text-muted-foreground text-[10px]">?</span>
        )}
      </div>
      <span className={cn("text-xs font-medium", perk.isDeprecated && "text-destructive")}>
        {perk.name}
      </span>
    </div>
  );
}
