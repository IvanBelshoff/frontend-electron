import TransferListColumn from '@/components/transfer-list/TransferListColumn'
import TransferListMoveButtons from '@/components/transfer-list/TransferListMoveButtons'
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
}: TransferListProps<T>) {
  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-stretch">
      <TransferListColumn
        side="available"
        config={available}
        getItemId={getItemId}
        isItemSelectable={isItemSelectable}
        renderItem={renderItem}
        onToggleItem={onToggleItem}
        disabled={disabled}
      />

      <TransferListMoveButtons
        disabled={disabled}
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
      />
    </div>
  )
}
