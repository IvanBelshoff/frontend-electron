import clsx from 'clsx'

type AiServiceStatusIndicatorProps = {
  isChecking: boolean
  isAvailable: boolean
  error?: string
}

export default function AiServiceStatusIndicator({
  isChecking,
  isAvailable,
  error,
}: AiServiceStatusIndicatorProps) {
  if (isChecking) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-vscode-text-muted/15 px-2 py-0.5 text-xs font-medium text-vscode-text-muted">
        <span className="h-2 w-2 rounded-full bg-vscode-text-muted" />
        Verificando…
      </span>
    )
  }

  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-vscode-success/15 px-2 py-0.5 text-xs font-medium text-vscode-success">
        <span className="h-2 w-2 rounded-full bg-vscode-success" />
        Serviço disponível
      </span>
    )
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400',
        error && 'cursor-help',
      )}
      title={error}
    >
      <span className="h-2 w-2 rounded-full bg-red-400" />
      Serviço indisponível
    </span>
  )
}
