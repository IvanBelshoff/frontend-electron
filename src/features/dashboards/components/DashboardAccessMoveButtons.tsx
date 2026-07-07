import clsx from 'clsx'

type DashboardAccessMoveButtonsProps = {
  disabled?: boolean
  canMoveSelectedRight?: boolean
  canMoveSelectedLeft?: boolean
  onMoveSelectedRight: () => void
  onMoveAllRight: () => void
  onMoveSelectedLeft: () => void
  onMoveAllLeft: () => void
}

function MoveButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors',
        'border-vscode-border bg-vscode-input-bg/60 text-vscode-accent hover:border-vscode-accent/40 hover:bg-vscode-accent/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      {children}
    </button>
  )
}

export default function DashboardAccessMoveButtons({
  disabled = false,
  canMoveSelectedRight = false,
  canMoveSelectedLeft = false,
  onMoveSelectedRight,
  onMoveAllRight,
  onMoveSelectedLeft,
  onMoveAllLeft,
}: DashboardAccessMoveButtonsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 self-center">
      <MoveButton
        label="Conceder acesso aos selecionados"
        onClick={onMoveSelectedRight}
        disabled={disabled || !canMoveSelectedRight}
      >
        {'>'}
      </MoveButton>
      <MoveButton
        label="Conceder acesso a todos filtrados"
        onClick={onMoveAllRight}
        disabled={disabled}
      >
        {'>>'}
      </MoveButton>
      <MoveButton
        label="Remover acesso dos selecionados"
        onClick={onMoveSelectedLeft}
        disabled={disabled || !canMoveSelectedLeft}
      >
        {'<'}
      </MoveButton>
      <MoveButton
        label="Remover acesso de todos filtrados"
        onClick={onMoveAllLeft}
        disabled={disabled}
      >
        {'<<'}
      </MoveButton>
    </div>
  )
}
