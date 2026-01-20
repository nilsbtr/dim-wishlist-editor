import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Perk } from "@/types/weapons";

interface PerkTooltipContentProps {
  perk: Perk;
}

/**
 * Parse perk description that may contain bullet points (•)
 * Returns the main description and an array of bullet points
 */
function parseDescription(description: string): { main: string; bullets: Array<string> } {
  // Split by bullet point character
  const parts = description.split("•").map((s) => s.trim());

  // First part is the main description
  const main = parts[0] || "";

  // Rest are bullet points
  const bullets = parts.slice(1).filter(Boolean);

  return { main, bullets };
}

export function PerkTooltipContent({ perk }: PerkTooltipContentProps) {
  const parsed = perk.description ? parseDescription(perk.description) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {perk.iconSrc && (
          <img
            src={perk.iconSrc}
            alt=""
            className={cn(
              "size-10 shrink-0 rounded-md border",
              perk.isDeprecated ? "border-destructive/50 opacity-60" : "border-border"
            )}
            draggable={false}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold", perk.isDeprecated && "text-destructive")}>
            {perk.name}
          </p>
          <p className="text-muted-foreground text-xs">{perk.itemType}</p>
          {perk.isDeprecated && (
            <Badge variant="destructive" className="mt-1 gap-1 text-[10px]">
              <AlertTriangle className="size-2.5" />
              Deprecated
            </Badge>
          )}
        </div>
      </div>
      {parsed && (
        <div className="space-y-2">
          {parsed.main && (
            <p className="text-muted-foreground text-sm leading-relaxed">{parsed.main}</p>
          )}
          {parsed.bullets.length > 0 && (
            <ul className="text-muted-foreground space-y-1 text-sm">
              {parsed.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
