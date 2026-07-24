import type { ReactNode, Ref } from 'react'

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
  /** Reserved for phase 2 (dnd-kit). When true, drag-and-drop will be enabled. */
  enableDragAndDrop?: boolean
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
}

/**
 * Phase 2 (dnd-kit): onMove* handlers will be reused from onDragEnd when items
 * are dropped between available and granted containers.
 */
