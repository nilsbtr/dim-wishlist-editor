import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { arrayMove } from "@dnd-kit/sortable";
import { Check, Save } from "lucide-react";

import { CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Perk } from "@/types/weapons";
import type { WishlistRoll } from "@/types/wishlist";

import { PerkColumnEditor } from "./perk-column-editor";

interface RollPerkEditorProps {
  roll: WishlistRoll;
  perkColumns: Array<Array<Perk>>;
  onSave: (
    data: { usage: string; notes: string; perkHashes: Array<Array<number>> },
    silent?: boolean
  ) => void;
}

export function RollPerkEditor({ roll, perkColumns, onSave }: RollPerkEditorProps) {
  const [editingPerkHashes, setEditingPerkHashes] = useState<Array<Array<number>>>(() =>
    roll.perkHashes.map((col) => [...col])
  );
  const [editingUsage, setEditingUsage] = useState(() => {
    const usage = roll.usage.toLowerCase();
    return usage === "pve" || usage === "pvp" ? usage : "custom";
  });
  const [editingCustomUsage, setEditingCustomUsage] = useState(() => {
    const usage = roll.usage.toLowerCase();
    return usage === "pve" || usage === "pvp" ? "" : roll.usage;
  });
  const [editingNotes, setEditingNotes] = useState(roll.notes);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save debounce ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when roll changes
  useEffect(() => {
    setEditingPerkHashes(roll.perkHashes.map((col) => [...col]));
    const usage = roll.usage.toLowerCase();
    setEditingUsage(usage === "pve" || usage === "pvp" ? usage : "custom");
    setEditingCustomUsage(usage === "pve" || usage === "pvp" ? "" : roll.usage);
    setEditingNotes(roll.notes);
    setHasChanges(false);
  }, [roll.id]); // Only reset when roll ID changes

  // Track changes
  useEffect(() => {
    const perkHashesChanged = JSON.stringify(editingPerkHashes) !== JSON.stringify(roll.perkHashes);
    const usageChanged =
      editingUsage === "custom"
        ? editingCustomUsage !== roll.usage
        : editingUsage !== roll.usage.toLowerCase();
    const notesChanged = editingNotes !== roll.notes;
    setHasChanges(perkHashesChanged || usageChanged || notesChanged);
  }, [editingPerkHashes, editingUsage, editingCustomUsage, editingNotes, roll]);

  // Auto-save when perks change (silent - no toast)
  useEffect(() => {
    if (!hasChanges) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set up new auto-save
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(true); // Silent auto-save
    }, 800); // Auto-save after 800ms of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editingPerkHashes, editingUsage, editingCustomUsage, editingNotes, hasChanges]);

  const handleSave = useCallback(
    (silent = false) => {
      const finalUsage =
        editingUsage === "custom" ? editingCustomUsage.trim() || "custom" : editingUsage;
      setIsSaving(true);
      onSave(
        {
          usage: finalUsage,
          notes: editingNotes.trim(),
          perkHashes: editingPerkHashes,
        },
        silent
      );
      setHasChanges(false);
      setTimeout(() => setIsSaving(false), 500);
    },
    [editingUsage, editingCustomUsage, editingNotes, editingPerkHashes, onSave]
  );

  const togglePerk = useCallback((columnIndex: number, perkHash: number) => {
    setEditingPerkHashes((prev) => {
      const newPerks = [...prev];
      const columnPerks = [...(newPerks[columnIndex] ?? [])];
      const idx = columnPerks.indexOf(perkHash);
      if (idx !== -1) {
        columnPerks.splice(idx, 1);
      } else {
        columnPerks.push(perkHash);
      }
      newPerks[columnIndex] = columnPerks;
      return newPerks;
    });
  }, []);

  const reorderPerks = useCallback((columnIndex: number, oldIndex: number, newIndex: number) => {
    setEditingPerkHashes((prev) => {
      const newPerks = [...prev];
      const columnPerks = [...(newPerks[columnIndex] ?? [])];
      const reordered = arrayMove(columnPerks, oldIndex, newIndex);
      newPerks[columnIndex] = reordered;
      return newPerks;
    });
  }, []);

  // Determine grid columns based on number of perk columns
  const gridColsClass = useMemo(() => {
    const colCount = perkColumns.length;
    if (colCount <= 3) return "sm:grid-cols-2 lg:grid-cols-3";
    if (colCount <= 4) return "sm:grid-cols-2 lg:grid-cols-4";
    if (colCount <= 5) return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
  }, [perkColumns.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CardHeader className="flex-none space-y-3 border-b pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Select value={editingUsage} onValueChange={(v) => v && setEditingUsage(v)}>
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pve">PvE</SelectItem>
                <SelectItem value="pvp">PvP</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {editingUsage === "custom" && (
              <Input
                value={editingCustomUsage}
                onChange={(e) => setEditingCustomUsage(e.target.value)}
                placeholder="Custom label..."
                className="h-8 w-32"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Save className="size-3 animate-pulse" />
                Saving...
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Check className="text-primary size-3" />
                Auto-saved
              </span>
            )}
          </div>
        </div>
        <Textarea
          value={editingNotes}
          onChange={(e) => setEditingNotes(e.target.value)}
          placeholder="Notes (optional) - Why is this roll good?"
          className="min-h-[56px] resize-none text-sm"
        />
      </CardHeader>

      <CardContent className="relative min-h-0 flex-1 p-0">
        <ScrollArea className="h-full">
          <div className={cn("grid gap-3 p-4", gridColsClass)}>
            {perkColumns.map((column, columnIndex) => {
              const selectedHashes = editingPerkHashes[columnIndex] ?? [];
              return (
                <PerkColumnEditor
                  key={columnIndex}
                  columnIndex={columnIndex}
                  perks={column}
                  selectedHashes={selectedHashes}
                  onTogglePerk={(hash) => togglePerk(columnIndex, hash)}
                  onReorderPerks={(oldIndex, newIndex) =>
                    reorderPerks(columnIndex, oldIndex, newIndex)
                  }
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
}
