import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

type TransferListDragHandleProps = {
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  disabled?: boolean
}

export default function TransferListDragHandle({
  attributes,
  listeners,
  disabled = false,
}: TransferListDragHandleProps) {
  return (
    <button
      type="button"
      aria-label="Arrastar item"
      title="Arrastar item"
      disabled={disabled}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      className="shrink-0 cursor-grab text-vscode-text-muted/70 hover:text-vscode-text active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      {...attributes}
      {...listeners}
    >
      ⋮⋮
    </button>
  )
}
