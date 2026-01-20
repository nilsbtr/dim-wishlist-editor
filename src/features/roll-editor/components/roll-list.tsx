import { useState } from "react";

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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WishlistRoll } from "@/types/wishlist";

import { UsageBadge } from "./usage-badge";

interface RollListProps {
  rolls: Array<WishlistRoll>;
  selectedRollId: string | null;
  onSelectRoll: (rollId: string) => void;
  onDeleteRoll: (rollId: string) => void;
  onDuplicateRoll: (rollId: string) => void;
  onReorderRolls: (rollIds: Array<string>) => void;
}

export function RollList({
  rolls,
  selectedRollId,
  onSelectRoll,
  onDeleteRoll,
  onDuplicateRoll,
  onReorderRolls,
}: RollListProps) {
  const [draggedRollId, setDraggedRollId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedRollId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedRollId(null);

    if (over && active.id !== over.id) {
      const oldIndex = rolls.findIndex((r) => r.id === active.id);
      const newIndex = rolls.findIndex((r) => r.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedRolls = arrayMove(rolls, oldIndex, newIndex);
        onReorderRolls(reorderedRolls.map((r) => r.id));
      }
    }
  };

  const draggedRoll = draggedRollId ? rolls.find((r) => r.id === draggedRollId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={rolls.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {rolls.map((roll, index) => (
            <SortableRollItem
              key={roll.id}
              roll={roll}
              index={index + 1}
              isSelected={selectedRollId === roll.id}
              onSelect={() => onSelectRoll(roll.id)}
              onDelete={() => onDeleteRoll(roll.id)}
              onDuplicate={() => onDuplicateRoll(roll.id)}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {draggedRoll && (
          <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">
                Roll #{rolls.findIndex((r) => r.id === draggedRoll.id) + 1}
              </span>
              <UsageBadge usage={draggedRoll.usage} />
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableRollItemProps {
  roll: WishlistRoll;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableRollItem({
  roll,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableRollItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: roll.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
          isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50 border-transparent"
        )}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab touch-none active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="bg-muted shrink-0 rounded px-1.5 py-0.5 text-xs font-medium tabular-nums">
            #{index}
          </span>
          <UsageBadge usage={roll.usage} className="shrink-0" />
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="size-3" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
