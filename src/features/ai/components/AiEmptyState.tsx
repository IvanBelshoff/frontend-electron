import clsx from 'clsx'

type AiEmptyStateProps = {
  userName?: string
  disabled?: boolean
  onSuggestionClick: (text: string) => void
}

const SUGGESTIONS = [
  'Quais relatórios posso consultar?',
  'Resuma os dados do meu relatório principal.',
  'Quais colunas estão disponíveis no relatório de vendas?',
]

export default function AiEmptyState({
  userName,
  disabled = false,
  onSuggestionClick,
}: AiEmptyStateProps) {
  const greeting = userName ? `Olá, ${userName}!` : 'Olá!'

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-6 overflow-y-auto p-8 text-center">
      <div>
        <h2 className="text-lg font-semibold text-vscode-text">{greeting}</h2>
        <p className="mt-2 max-w-lg text-sm text-vscode-text-muted">
          Sou o assistente de negócios do DataDash. Posso consultar relatórios autorizados para você
          e responder com base nos dados reais, citando a fonte.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-3">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => onSuggestionClick(suggestion)}
            className={clsx(
              'rounded-lg border border-vscode-border bg-vscode-sidebar/70 px-3 py-3 text-left text-sm text-vscode-text transition-colors',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-vscode-accent/40 hover:bg-vscode-accent/10',
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
