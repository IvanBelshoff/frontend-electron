import clsx from 'clsx'
import Button from '@/components/ui/Button'
import { QueryResultsFooterActions } from '@/features/query-editor/QueryResultsFooterActions'
import type { QueryCountResult, QueryPreviewResult } from '@/features/query-editor/query-editor-types'

type QueryResultStatusContentProps = {
  previewResult: QueryPreviewResult | null
  countResult: QueryCountResult | null
  isCounting: boolean
  countError: string | null
  onCountRows: () => void
  resultsFocused?: boolean
  onFocusResults?: () => void
  onClearResults?: () => void
}

function formatSeconds(ms: number): string {
  if (ms < 1000) {
    return `${(ms / 1000).toFixed(3)}s`
  }

  return `${(ms / 1000).toFixed(1)}s`
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function QueryResultStatusContent({
  previewResult,
  countResult,
  isCounting,
  countError,
  onCountRows,
  resultsFocused = false,
  onFocusResults,
  onClearResults,
}: QueryResultStatusContentProps) {
  if (!previewResult) {
    return null
  }

  const showCountButton = previewResult.truncado

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-vscode-text-muted">
        <span className="text-vscode-text">
          {countResult
            ? `${formatInteger(previewResult.totalLinhas)} linha(s) exibidas de ${formatInteger(countResult.totalLinhas)} registro(s)`
            : `${formatInteger(previewResult.totalLinhas)} linha(s) recuperada(s)`}
        </span>
        {' · '}
        {formatSeconds(previewResult.tempoMs)}
        {countResult ? ` · contagem em ${formatSeconds(countResult.tempoMs)}` : ''}
        {previewResult.truncado && !countResult ? ' · preview limitado' : ''}
      </span>

      {countError && <span className="text-xs text-vscode-error">{countError}</span>}

      {showCountButton && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={isCounting}
          onClick={onCountRows}
        >
          Contar registros
        </Button>
      )}

      {onFocusResults && onClearResults ? (
        <QueryResultsFooterActions
          focused={resultsFocused}
          onFocus={onFocusResults}
          onClear={onClearResults}
        />
      ) : null}
    </div>
  )
}

type QueryResultStatusBarProps = QueryResultStatusContentProps

export default function QueryResultStatusBar(props: QueryResultStatusBarProps) {
  if (!props.previewResult) {
    return null
  }

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-between gap-3 rounded-md border border-vscode-border',
        'bg-vscode-sidebar/60 px-3 py-2 text-sm text-vscode-text-muted',
      )}
    >
      <QueryResultStatusContent {...props} />
    </div>
  )
}
