import { useDraggable } from '@dnd-kit/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { SchemaExplorerDragData } from '@/features/query-editor/query-editor-dnd.utils'

type SchemaExplorerDraggableItemProps = {
  id: string
  data: SchemaExplorerDragData
  disabled?: boolean
  className?: string
  children: ReactNode
}

export default function SchemaExplorerDraggableItem({
  id,
  data,
  disabled = false,
  className,
  children,
}: SchemaExplorerDraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
    data,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={clsx(
        'touch-none',
        disabled
          ? 'cursor-not-allowed'
          : isDragging
            ? 'cursor-grabbing'
            : 'cursor-grab',
        isDragging && 'opacity-40',
        disabled && 'pointer-events-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
