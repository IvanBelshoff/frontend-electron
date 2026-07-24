import { useDraggable } from '@dnd-kit/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import TransferListDragHandle from '@/components/transfer-list/TransferListDragHandle'
import { getTransferListDraggableId } from '@/components/transfer-list/transfer-list-dnd-utils'
import type { TransferListSide } from '@/components/transfer-list/types'

type TransferListDraggableItemProps = {
  side: TransferListSide
  itemId: number
  disabled?: boolean
  draggable?: boolean
  children: (ctx: { dragHandle: ReactNode; isDragging: boolean }) => ReactNode
}

export default function TransferListDraggableItem({
  side,
  itemId,
  disabled = false,
  draggable = true,
  children,
}: TransferListDraggableItemProps) {
  const isDragDisabled = disabled || !draggable

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: getTransferListDraggableId(side, itemId),
    disabled: isDragDisabled,
    data: { side, itemId },
  })

  const dragHandle = (
    <TransferListDragHandle
      attributes={attributes}
      listeners={listeners}
      disabled={isDragDisabled}
    />
  )

  return (
    <div
      ref={setNodeRef}
      className={clsx('transition-opacity', isDragging && 'opacity-40')}
      data-transfer-item-id={itemId}
    >
      {children({ dragHandle, isDragging })}
    </div>
  )
}
