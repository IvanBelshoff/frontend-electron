import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useMemo, useState } from 'react'
import TransferListColumn from '@/components/transfer-list/TransferListColumn'
import TransferListMoveButtons from '@/components/transfer-list/TransferListMoveButtons'
import {
  isTransferListDropSide,
  parseTransferListDraggableId,
  type TransferListActiveDrag,
} from '@/components/transfer-list/transfer-list-dnd-utils'
import type { TransferListProps } from '@/components/transfer-list/types'

export default function TransferList<T>({
  available,
  granted,
  getItemId,
  isItemSelectable,
  renderItem,
  onToggleItem,
  onMoveSelectedRight,
  onMoveAllRight,
  onMoveSelectedLeft,
  onMoveAllLeft,
  canMoveAllLeft,
  disabled = false,
  enableDragAndDrop = true,
  onMoveItem,
}: TransferListProps<T>) {
  const [activeDrag, setActiveDrag] = useState<TransferListActiveDrag | null>(null)

  const isDragEnabled = enableDragAndDrop && !disabled && Boolean(onMoveItem)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeItem = useMemo(() => {
    if (!activeDrag) {
      return null
    }

    const items = activeDrag.side === 'available' ? available.items : granted.items
    return items.find((item) => getItemId(item) === activeDrag.itemId) ?? null
  }, [activeDrag, available.items, granted.items, getItemId])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const parsed = parseTransferListDraggableId(event.active.id)

    if (!parsed) {
      return
    }

    setActiveDrag(parsed)
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)

      const currentDrag = parseTransferListDraggableId(event.active.id)

      if (!currentDrag || !onMoveItem || !event.over) {
        return
      }

      const dropSide = event.over.id

      if (!isTransferListDropSide(dropSide) || dropSide === currentDrag.side) {
        return
      }

      void onMoveItem(currentDrag.side, currentDrag.itemId)
    },
    [onMoveItem],
  )

  const isDragging = activeDrag !== null

  const content = (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-stretch">
      <TransferListColumn
        side="available"
        config={available}
        getItemId={getItemId}
        isItemSelectable={isItemSelectable}
        renderItem={renderItem}
        onToggleItem={onToggleItem}
        disabled={disabled}
        enableDragAndDrop={isDragEnabled}
        activeDrag={activeDrag}
      />

      <TransferListMoveButtons
        disabled={disabled || isDragging}
        canMoveSelectedRight={available.selectedIds.length > 0}
        canMoveSelectedLeft={granted.selectedIds.length > 0}
        canMoveAllRight={available.items.length > 0}
        canMoveAllLeft={canMoveAllLeft > 0}
        onMoveSelectedRight={onMoveSelectedRight}
        onMoveAllRight={onMoveAllRight}
        onMoveSelectedLeft={onMoveSelectedLeft}
        onMoveAllLeft={onMoveAllLeft}
      />

      <TransferListColumn
        side="granted"
        config={granted}
        getItemId={getItemId}
        isItemSelectable={isItemSelectable}
        renderItem={renderItem}
        onToggleItem={onToggleItem}
        disabled={disabled}
        enableDragAndDrop={isDragEnabled}
        activeDrag={activeDrag}
      />
    </div>
  )

  if (!isDragEnabled) {
    return content
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {content}

      <DragOverlay dropAnimation={null}>
        {activeItem && activeDrag
          ? renderItem(activeItem, {
              side: activeDrag.side,
              selected: false,
              selectionDisabled: true,
              onToggle: () => undefined,
              isOverlay: true,
            })
          : null}
      </DragOverlay>
    </DndContext>
  )
}
