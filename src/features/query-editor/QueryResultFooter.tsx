import clsx from 'clsx'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import {
  QUERY_EDITOR_MAX_FETCH_LIMIT,
  QUERY_EDITOR_PERFORMANCE_WARNING_TOOLTIP,
  QUERY_EDITOR_RECOMMENDED_FETCH_LIMIT,
} from '@/features/query-editor/query-editor-fetch.constants'
import { QueryResultsFooterActions } from '@/features/query-editor/QueryResultsFooterActions'
import {
  exceedsRecommendedFetchLimit,
  parseFetchLimitInput,
} from '@/features/query-editor/query-editor-fetch.utils'
import type { QueryCountResult, QueryPreviewResult } from '@/features/query-editor/query-editor-types'

type QueryResultFooterProps = {
  fetchLimit: number
  onFetchLimitChange: (value: number) => void
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

export default function QueryResultFooter({
  fetchLimit,
  onFetchLimitChange,
  previewResult,
  countResult,
  isCounting,
  countError,
  onCountRows,
  resultsFocused = false,
  onFocusResults,
  onClearResults,
}: QueryResultFooterProps) {
  const showWarning = exceedsRecommendedFetchLimit(fetchLimit)
  const countLabel = countResult
    ? formatInteger(countResult.totalLinhas)
    : '—'

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-vscode-border bg-vscode-sidebar/80 px-3 py-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-vscode-text-muted">
          <span>Linhas</span>
          <input
            type="number"
            min={1}
            max={QUERY_EDITOR_MAX_FETCH_LIMIT}
            value={fetchLimit}
            onChange={(event) => onFetchLimitChange(parseFetchLimitInput(event.target.value))}
            className="h-7 w-16 rounded border border-vscode-border bg-vscode-input-bg px-2 text-center text-xs text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/30"
            aria-label="Quantidade de linhas a recuperar"
          />
        </label>

        {showWarning ? (
          <span
            className="inline-flex h-7 w-7 items-center justify-center text-amber-400"
            title={QUERY_EDITOR_PERFORMANCE_WARNING_TOOLTIP}
            aria-label={QUERY_EDITOR_PERFORMANCE_WARNING_TOOLTIP}
          >
            <DashboardMaterialIcon name="warning" className="text-[1rem]" />
          </span>
        ) : null}

        <button
          type="button"
          onClick={onCountRows}
          disabled={!previewResult || isCounting}
          title="Contar registros da consulta"
          className={clsx(
            'inline-flex h-7 items-center gap-1 rounded border border-vscode-border/70 bg-vscode-bg/40 px-2 text-xs transition-colors',
            previewResult
              ? 'text-vscode-text hover:border-vscode-accent/40 hover:bg-vscode-accent/10'
              : 'cursor-not-allowed text-vscode-text-muted opacity-60',
          )}
        >
          {isCounting ? (
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
              aria-hidden="true"
            />
          ) : (
            <DashboardMaterialIcon name="tag" className="text-[0.95rem]" />
          )}
          <span className="min-w-[2ch] tabular-nums">{countLabel}</span>
        </button>

        {countError ? <span className="text-xs text-vscode-error">{countError}</span> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-vscode-text-muted">
        {previewResult ? (
          <span>
            <span className="text-vscode-text">
              {formatInteger(previewResult.totalLinhas)} linha(s)
            </span>
            {' · '}
            {formatSeconds(previewResult.tempoMs)}
            {previewResult.truncado && fetchLimit >= QUERY_EDITOR_RECOMMENDED_FETCH_LIMIT
              ? ' · limitado'
              : ''}
          </span>
        ) : (
          <span>Execute a consulta para ver os resultados</span>
        )}

        {previewResult && onFocusResults && onClearResults ? (
          <QueryResultsFooterActions
            focused={resultsFocused}
            onFocus={onFocusResults}
            onClear={onClearResults}
          />
        ) : null}
      </div>
    </div>
  )
}
