import { useState } from "react";

import { Download, FileJson, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { DimExportOptions } from "@/services/wishlist";
import { exportAsDim, exportAsJson } from "@/services/wishlist";
import type { Wishlist } from "@/types/wishlist";

type ExportFormat = "json" | "dim";

const DEFAULT_OPTIONS: DimExportOptions = {
  includeUsage: true,
  semiGodrollLevel: 0,
};

interface ExportWishlistDialogProps {
  wishlist: Wishlist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportWishlistDialog({ wishlist, open, onOpenChange }: ExportWishlistDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("dim");
  const [options, setOptions] = useState<DimExportOptions>(DEFAULT_OPTIONS);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!wishlist) return;

    setIsExporting(true);

    try {
      if (format === "json") {
        exportAsJson(wishlist);
      } else {
        exportAsDim(wishlist, options);
      }

      toast.success("Wishlist exported", {
        description: `"${wishlist.name}" has been downloaded.`,
      });

      handleOpenChange(false);
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOptions(DEFAULT_OPTIONS);
    }
    onOpenChange(newOpen);
  };

  const getSemiGodrollLabel = (level: number) => {
    if (level === 0) return "Disabled";
    if (level === 1) return "Level 1 (ignore barrels)";
    return "Level 2 (ignore barrels + magazines)";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Wishlist</DialogTitle>
          <DialogDescription>
            Export "{wishlist?.name}" to use with DIM or share with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormatOption
                selected={format === "dim"}
                onClick={() => setFormat("dim")}
                icon={FileText}
                title="DIM Format"
                description="Import directly into Destiny Item Manager"
              />
              <FormatOption
                selected={format === "json"}
                onClick={() => setFormat("json")}
                icon={FileJson}
                title="JSON Format"
                description="Full data for backup or sharing"
              />
            </div>
          </div>

          {/* DIM-specific options */}
          {format === "dim" && (
            <div className="space-y-5">
              {/* Include usage checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="include-usage"
                  checked={options.includeUsage}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeUsage: checked === true }))
                  }
                />
                <div>
                  <Label htmlFor="include-usage" className="cursor-pointer">
                    Include usage information in notes
                  </Label>
                  <p className="text-muted-foreground text-xs">Adds PvE/PvP labels to roll notes</p>
                </div>
              </div>

              {/* Semi-godroll slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Semi-Godroll Level</Label>
                  <span className="text-muted-foreground text-sm">
                    {getSemiGodrollLabel(options.semiGodrollLevel)}
                  </span>
                </div>
                <Slider
                  value={[options.semiGodrollLevel]}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      semiGodrollLevel: Array.isArray(value) ? value[0] : value,
                    }))
                  }
                  min={0}
                  max={2}
                  step={1}
                />
                <p className="text-muted-foreground text-xs">
                  Generate additional "semi-godroll" entries by ignoring the first X perk columns.
                  Useful for highlighting weapons with good traits but non-ideal barrels/magazines.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="size-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormatOption({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
      }`}
    >
      <Icon className={`mt-0.5 size-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </button>
  );
}
