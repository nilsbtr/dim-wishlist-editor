import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { USAGE_TYPES } from "@/types/wishlist";

interface UsageBadgeProps {
  usage: string;
  className?: string;
}

const usageStyles: Record<string, { bg: string; text: string; label: string }> = {
  [USAGE_TYPES.PVE]: {
    bg: "bg-[oklch(0.6_0.15_145/0.15)]",
    text: "text-[oklch(0.7_0.2_145)]",
    label: "PvE",
  },
  [USAGE_TYPES.PVP]: {
    bg: "bg-[oklch(0.6_0.15_25/0.15)]",
    text: "text-[oklch(0.7_0.2_25)]",
    label: "PvP",
  },
};

export function UsageBadge({ usage, className }: UsageBadgeProps) {
  const style = usageStyles[usage.toLowerCase()] as
    | { bg: string; text: string; label: string }
    | undefined;

  if (style) {
    return (
      <Badge variant="secondary" className={cn(style.bg, style.text, "border-0", className)}>
        {style.label}
      </Badge>
    );
  }

  // Custom usage - show as-is
  return (
    <Badge variant="secondary" className={className}>
      {usage}
    </Badge>
  );
}

export function getUsageLabel(usage: string): string {
  const normalized = usage.toLowerCase();
  if (normalized === USAGE_TYPES.PVE) return "PvE";
  if (normalized === USAGE_TYPES.PVP) return "PvP";
  return usage;
}
