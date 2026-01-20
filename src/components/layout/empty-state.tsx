import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-5 py-12 text-center", className)}
    >
      {Icon && (
        <div className="from-muted to-muted/50 relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner">
          <Icon className="text-muted-foreground size-10" />
          {/* Subtle glow effect */}
          <div className="bg-primary/5 absolute inset-0 rounded-2xl blur-xl" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
