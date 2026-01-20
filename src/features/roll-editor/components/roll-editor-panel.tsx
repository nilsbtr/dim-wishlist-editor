import { useCallback, useEffect, useMemo, useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Perk } from "@/types/weapons";
import type { WishlistRoll } from "@/types/wishlist";

import { RollList } from "./roll-list";
import { RollPerkEditor } from "./roll-perk-editor";

interface RollEditorPanelProps {
  rolls: Array<WishlistRoll>;
  perkColumns: Array<Array<Perk>>;
  onAddRoll: (data: { usage: string; notes: string; perkHashes: Array<Array<number>> }) => void;
  onUpdateRoll: (
    rollId: string,
    data: { usage: string; notes: string; perkHashes: Array<Array<number>> },
    silent?: boolean
  ) => void;
  onDeleteRoll: (rollId: string) => void;
  onDuplicateRoll: (rollId: string) => void;
  onReorderRolls: (rollIds: Array<string>) => void;
}

export function RollEditorPanel({
  rolls,
  perkColumns,
  onAddRoll,
  onUpdateRoll,
  onDeleteRoll,
  onDuplicateRoll,
  onReorderRolls,
}: RollEditorPanelProps) {
  const [selectedRollId, setSelectedRollId] = useState<string | null>(rolls[0]?.id ?? null);

  // Update selection when rolls change
  useEffect(() => {
    if (selectedRollId && !rolls.find((r) => r.id === selectedRollId)) {
      // Selected roll was deleted, select first roll
      setSelectedRollId(rolls[0]?.id ?? null);
    } else if (!selectedRollId && rolls.length > 0) {
      // No selection but rolls exist, select first
      setSelectedRollId(rolls[0].id);
    } else if (rolls.length > 0 && !rolls.find((r) => r.id === selectedRollId)) {
      // Selection doesn't exist, select the last roll (likely just added)
      setSelectedRollId(rolls[rolls.length - 1].id);
    }
  }, [rolls, selectedRollId]);

  const selectedRoll = useMemo(
    () => rolls.find((r) => r.id === selectedRollId),
    [rolls, selectedRollId]
  );

  const handleAddRoll = useCallback(() => {
    onAddRoll({
      usage: "pve",
      notes: "",
      perkHashes: perkColumns.map(() => []),
    });
  }, [onAddRoll, perkColumns]);

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Left: Roll List */}
      <Card className="flex w-full flex-col overflow-hidden lg:w-56 lg:shrink-0">
        <CardHeader className="flex-none space-y-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Rolls</CardTitle>
            <Button size="xs" onClick={handleAddRoll} className="gap-1">
              <Plus className="size-3" />
              Add
            </Button>
          </div>
          {rolls.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {rolls.length} roll{rolls.length !== 1 ? "s" : ""} • Drag to reorder
            </p>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {rolls.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-muted-foreground text-sm">No rolls yet</p>
            </div>
          ) : (
            <ScrollArea className="h-full px-3 pb-3">
              <RollList
                rolls={rolls}
                selectedRollId={selectedRollId}
                onSelectRoll={setSelectedRollId}
                onDeleteRoll={onDeleteRoll}
                onDuplicateRoll={onDuplicateRoll}
                onReorderRolls={onReorderRolls}
              />
            </ScrollArea>
          )}
        </CardContent>
        {rolls.length > 1 && (
          <div className="border-t px-3 py-2">
            <p className="text-muted-foreground text-center text-xs">↑ Higher = higher priority</p>
          </div>
        )}
      </Card>

      {/* Right: Roll Editor */}
      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {selectedRoll ? (
          <RollPerkEditor
            key={selectedRoll.id}
            roll={selectedRoll}
            perkColumns={perkColumns}
            onSave={(data, silent) => onUpdateRoll(selectedRoll.id, data, silent)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Select a roll to edit</p>
              {rolls.length === 0 && (
                <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={handleAddRoll}>
                  <Plus className="size-3" />
                  Create Your First Roll
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
