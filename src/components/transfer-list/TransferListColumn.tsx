import { useDroppable } from '@dnd-kit/core'
import clsx from 'clsx'
import Input from '@/components/ui/Input'
import TransferListDraggableItem from '@/components/transfer-list/TransferListDraggableItem'
import { SearchIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { TransferListColumnProps } from '@/components/transfer-list/types'

export default function TransferListColumn<T>({
  side,
  config,
  getItemId,
  isItemSelectable,
  renderItem,
  onToggleItem,
  disabled = false,
  listRef,
  enableDragAndDrop = false,
  activeDrag = null,
}: TransferListColumnProps<T>) {
  const {
    title,
    count,
    helper,
    items,
    search,
    searchPlaceholder,
    emptyMessage,
    selectedIds,
    isAllSelected,
    onSearchChange,
    onToggleSelectAll,
  } = config

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: side,
    disabled: !enableDragAndDrop || disabled,
  })

  const selectableCount = items.filter((item) => isItemSelectable(item, side)).length
  const selectAllDisabled = disabled || selectableCount === 0
  const isDropTarget = Boolean(activeDrag && activeDrag.side !== side)

  const renderListItem = (item: T) => {
    const itemId = getItemId(item)
    const selectable = isItemSelectable(item, side)
    const selected = selectedIds.includes(itemId)
    const itemDisabled = disabled || !selectable
    const draggable = selectable

    const itemContext = {
      side,
      selected,
      selectionDisabled: itemDisabled,
      onToggle: () => onToggleItem(side, itemId),
    }

    if (!enableDragAndDrop) {
      return renderItem(item, itemContext)
    }

    if (!draggable) {
      return renderItem(item, itemContext)
    }

    return (
      <TransferListDraggableItem
        side={side}
        itemId={itemId}
        disabled={disabled}
        draggable={draggable}
      >
        {({ dragHandle, isDragging }) =>
          renderItem(item, {
            ...itemContext,
            dragHandle,
            isDragging,
          })
        }
      </TransferListDraggableItem>
    )
  }

  return (
    <section
      ref={setDroppableRef}
      className={clsx(
        'flex h-full min-h-0 flex-col rounded-lg border p-4 transition-colors duration-150',
        isDropTarget
          ? clsx(
              'border-vscode-accent/40 bg-vscode-accent/5 ring-1 ring-inset ring-vscode-accent/15',
              isOver && 'border-vscode-accent/50 bg-vscode-accent/8',
            )
          : 'border-vscode-border bg-vscode-sidebar/60',
      )}
    >
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-sm text-vscode-text">{title}</strong>
            <span className="rounded-full border border-vscode-border px-2 py-0.5 text-xs text-vscode-text-muted">
              {count}
            </span>
          </div>
          <p className="mt-1 text-xs text-vscode-text-muted">{helper}</p>
        </div>

        <button
          type="button"
          onClick={onToggleSelectAll}
          disabled={selectAllDisabled}
          className={clsx(
            'shrink-0 rounded border px-2.5 py-1 text-xs font-medium transition-colors',
            'border-vscode-border text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isAllSelected ? 'Limpar seleção' : 'Selecionar todos'}
        </button>
      </div>

      <div className="relative mb-3 shrink-0">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vscode-text-muted">
          <SearchIcon />
        </span>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          disabled={disabled}
          className="pl-9"
        />
      </div>

      <div
        ref={listRef}
        data-transfer-list-side={side}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
      >
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-vscode-text-muted">{emptyMessage}</p>
        ) : (
          items.map((item) => {
            const itemId = getItemId(item)

            return <div key={itemId}>{renderListItem(item)}</div>
          })
        )}
      </div>
    </section>
  )
}
