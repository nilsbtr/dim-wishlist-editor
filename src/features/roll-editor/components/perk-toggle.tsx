import { AlertTriangle, Check } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Perk } from "@/types/weapons";

import { PerkTooltipContent } from "./perk-tooltip";

interface PerkToggleProps {
  perk: Perk;
  isSelected: boolean;
  onToggle: () => void;
}

export function PerkToggle({ perk, isSelected, onToggle }: PerkToggleProps) {
  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-all",
                "hover:bg-background/80",
                isSelected && "bg-primary/10 ring-primary/50 ring-1",
                perk.isDeprecated && "opacity-60"
              )}
            >
              <div
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded border transition-colors",
                  isSelected
                    ? "border-primary bg-primary/20"
                    : perk.isDeprecated
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border bg-background"
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
                {isSelected && (
                  <div className="bg-primary absolute -right-0.5 -bottom-0.5 flex size-2.5 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground size-1.5" />
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-xs",
                  isSelected ? "font-medium" : "text-muted-foreground",
                  perk.isDeprecated && "text-destructive line-through"
                )}
              >
                {perk.name}
              </span>
              {perk.isDeprecated && <AlertTriangle className="text-destructive size-3 shrink-0" />}
            </button>
          }
        />
        <TooltipContent side="right" className="max-w-xs">
          <PerkTooltipContent perk={perk} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
