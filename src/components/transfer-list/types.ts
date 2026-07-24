import type { ReactNode, Ref } from 'react'
import type { TransferListActiveDrag } from '@/components/transfer-list/transfer-list-dnd-utils'

export type TransferListSide = 'available' | 'granted'

export type TransferListColumnConfig<T> = {
  title: string
  count: number
  helper: string
  items: T[]
  search: string
  searchPlaceholder: string
  emptyMessage: string
  selectedIds: number[]
  isAllSelected: boolean
  onSearchChange: (value: string) => void
  onToggleSelectAll: () => void
}

export type TransferListItemRenderContext = {
  side: TransferListSide
  selected: boolean
  selectionDisabled: boolean
  onToggle: () => void
  dragHandle?: ReactNode
  isDragging?: boolean
  isOverlay?: boolean
}

export type TransferListProps<T> = {
  available: TransferListColumnConfig<T>
  granted: TransferListColumnConfig<T>
  getItemId: (item: T) => number
  isItemSelectable: (item: T, side: TransferListSide) => boolean
  renderItem: (item: T, ctx: TransferListItemRenderContext) => ReactNode
  renderGrantedItemActions?: (item: T) => ReactNode
  onToggleItem: (side: TransferListSide, id: number) => void
  onMoveSelectedRight: () => void
  onMoveAllRight: () => void
  onMoveSelectedLeft: () => void
  onMoveAllLeft: () => void
  canMoveAllLeft: number
  disabled?: boolean
  enableDragAndDrop?: boolean
  onMoveItem?: (fromSide: TransferListSide, itemId: number) => void | Promise<void>
}

export type TransferListColumnProps<T> = {
  side: TransferListSide
  config: TransferListColumnConfig<T>
  getItemId: (item: T) => number
  isItemSelectable: (item: T, side: TransferListSide) => boolean
  renderItem: (item: T, ctx: TransferListItemRenderContext) => ReactNode
  onToggleItem: (side: TransferListSide, id: number) => void
  disabled?: boolean
  listRef?: Ref<HTMLDivElement>
  enableDragAndDrop?: boolean
  activeDrag?: TransferListActiveDrag | null
}
