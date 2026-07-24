import clsx from 'clsx'
import type { ReactNode, Ref } from 'react'

type TransferListSelectableRowProps = {
  selected: boolean
  selectionDisabled?: boolean
  onToggle: () => void
  children: ReactNode
  actions?: ReactNode
  dragHandle?: ReactNode
  itemId?: number
  rowRef?: Ref<HTMLDivElement>
  isDragging?: boolean
  isOverlay?: boolean
}

export default function TransferListSelectableRow({
  selected,
  selectionDisabled = false,
  onToggle,
  children,
  actions,
  dragHandle,
  itemId,
  rowRef,
  isDragging = false,
  isOverlay = false,
}: TransferListSelectableRowProps) {
  const rowClassName = clsx(
    'flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
    selected
      ? 'border-vscode-accent bg-vscode-accent/10'
      : 'border-vscode-border bg-vscode-bg/40 hover:border-vscode-accent/40',
    isDragging && 'opacity-40',
    isOverlay && 'shadow-lg ring-1 ring-vscode-accent/20',
  )

  const labelClassName = clsx(
    'flex min-w-0 flex-1 cursor-pointer items-center gap-3',
    selectionDisabled && 'cursor-not-allowed opacity-70',
  )

  const checkbox = isOverlay ? null : (
    <input
      type="checkbox"
      checked={selected}
      disabled={selectionDisabled}
      onChange={onToggle}
      className="h-4 w-4 rounded border-vscode-border accent-vscode-accent"
    />
  )

  if (actions || dragHandle) {
    return (
      <div
        ref={rowRef}
        className={rowClassName}
        data-transfer-item-id={itemId}
      >
        {dragHandle}
        <label className={labelClassName}>
          {checkbox}
          {children}
        </label>
        {!isOverlay ? actions : null}
      </div>
    )
  }

  return (
    <label
      ref={rowRef as Ref<HTMLLabelElement>}
      className={clsx(rowClassName, labelClassName, 'gap-3')}
      data-transfer-item-id={itemId}
    >
      {checkbox}
      {children}
    </label>
  )
}
