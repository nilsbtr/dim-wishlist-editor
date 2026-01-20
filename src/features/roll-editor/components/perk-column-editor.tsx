import { useMemo, useState } from "react";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";
import type { Perk } from "@/types/weapons";

import { PerkToggle } from "./perk-toggle";
import { PerkItemOverlay, SortablePerkItem } from "./sortable-perk-item";

interface PerkColumnEditorProps {
  columnIndex: number;
  perks: Array<Perk>;
  selectedHashes: Array<number>;
  onTogglePerk: (hash: number) => void;
  onReorderPerks: (oldIndex: number, newIndex: number) => void;
}

export function PerkColumnEditor({
  columnIndex,
  perks,
  selectedHashes,
  onTogglePerk,
  onReorderPerks,
}: PerkColumnEditorProps) {
  const [draggedHash, setDraggedHash] = useState<number | null>(null);

  // Sort perks: non-deprecated first, then deprecated at the bottom
  const sortedPerks = useMemo(() => {
    const nonDeprecated = perks.filter((p) => !p.isDeprecated);
    const deprecated = perks.filter((p) => p.isDeprecated);
    return [...nonDeprecated, ...deprecated];
  }, [perks]);

  const unselectedPerks = useMemo(
    () => sortedPerks.filter((p) => !selectedHashes.includes(p.hash)),
    [sortedPerks, selectedHashes]
  );

  const selectedCount = selectedHashes.length;
  const isAnyPerk = selectedCount === 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedHash(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedHash(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    if (
      selectedHashes.includes(activeId) &&
      selectedHashes.includes(overId) &&
      activeId !== overId
    ) {
      const oldIndex = selectedHashes.indexOf(activeId);
      const newIndex = selectedHashes.indexOf(overId);
      if (oldIndex !== newIndex) {
        onReorderPerks(oldIndex, newIndex);
      }
    }
  };

  const draggedPerk = draggedHash ? sortedPerks.find((p) => p.hash === draggedHash) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Column {columnIndex + 1}</h4>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            isAnyPerk ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
          )}
        >
          {isAnyPerk ? "Any" : `${selectedCount} selected`}
        </span>
      </div>

      <div className="bg-muted/30 flex flex-col gap-0.5 rounded-lg border p-1.5">
        {/* Selected perks - draggable */}
        {selectedHashes.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={selectedHashes} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-0.5">
                {selectedHashes.map((hash, index) => {
                  const perk = sortedPerks.find((p) => p.hash === hash);
                  if (!perk) return null;
                  return (
                    <SortablePerkItem
                      key={hash}
                      perk={perk}
                      index={index}
                      onToggle={() => onTogglePerk(hash)}
                    />
                  );
                })}
              </div>
            </SortableContext>
            <DragOverlay>{draggedPerk && <PerkItemOverlay perk={draggedPerk} />}</DragOverlay>
          </DndContext>
        )}

        {/* Separator when there are both selected and unselected */}
        {selectedHashes.length > 0 && unselectedPerks.length > 0 && (
          <div className="border-border/50 my-1 border-t" />
        )}

        {/* Unselected perks - not draggable */}
        {unselectedPerks.map((perk) => (
          <PerkToggle
            key={perk.hash}
            perk={perk}
            isSelected={false}
            onToggle={() => onTogglePerk(perk.hash)}
          />
        ))}

        {sortedPerks.length === 0 && (
          <p className="text-muted-foreground py-2 text-center text-xs">No perks available</p>
        )}
      </div>
    </div>
  );
}
