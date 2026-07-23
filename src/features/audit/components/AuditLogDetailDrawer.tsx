import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import clsx from 'clsx'
import IconButton from '@/components/ui/IconButton'
import AuditChangeDiff from '@/features/audit/components/AuditChangeDiff'
import AuditDiffViewToggle from '@/features/audit/components/AuditDiffViewToggle'
import { inferAuditChangeMode } from '@/features/audit/components/audit-line-diff.util'
import {
  readStoredAuditDiffViewMode,
  storeAuditDiffViewMode,
  type AuditDiffViewMode,
} from '@/features/audit/audit-diff-view-mode'
import {
  getAuditChanges,
  getLegacyMetadataDisplay,
  hasLegacyMetadata,
} from '@/features/audit/audit-change-parser'
import type { AuditLogItem } from '@/features/audit/audit-types'
import {
  getAuditActionLabel,
  getAuditActorLabel,
  getAuditCategoryLabel,
  getAuditOutcomeLabel,
  getAuditResourceLabel,
} from '@/features/audit/audit-labels'
import { formatUserDate } from '@/features/user/format-user-date'

type AuditLogDetailDrawerProps = {
  log: AuditLogItem | null
  isLoading?: boolean
  onClose: () => void
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

async function copyToClipboard(value: string): Promise<void> {
  await navigator.clipboard.writeText(value)
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
        {title}
      </h4>
      <div className="text-sm text-vscode-text">{children}</div>
    </section>
  )
}

export default function AuditLogDetailDrawer({
  log,
  isLoading = false,
  onClose,
}: AuditLogDetailDrawerProps) {
  const [diffViewMode, setDiffViewModeState] = useState<AuditDiffViewMode>(readStoredAuditDiffViewMode)

  const setDiffViewMode = useCallback((mode: AuditDiffViewMode) => {
    setDiffViewModeState(mode)
    storeAuditDiffViewMode(mode)
  }, [])

  if (!log) {
    return null
  }

  const changes = getAuditChanges(log.metadata ?? {})
  const changeMode = inferAuditChangeMode(log.action)
  const showDiffViewToggle = changes.length > 0 && changeMode === 'update'
  const showLegacyMetadata = hasLegacyMetadata(log.metadata ?? {})
  const legacyMetadataJson = JSON.stringify(getLegacyMetadataDisplay(log.metadata ?? {}), null, 2)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className={clsx(
          'flex h-full w-full max-w-3xl flex-col border-l border-vscode-border bg-vscode-sidebar shadow-xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Detalhe do log de auditoria"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-vscode-border px-4 py-3">
          <h3 className="text-sm font-semibold text-vscode-text">Detalhe da auditoria</h3>
          <IconButton icon={<CloseIcon />} label="Fechar" onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-vscode-text-muted">Carregando detalhes…</p>
          ) : (
            <>
              <DetailSection title="Ator">
                <p>{getAuditActorLabel(log.actor_type, log.actor_email)}</p>
                {log.actor_user_id != null ? (
                  <p className="mt-1 text-xs text-vscode-text-muted">
                    ID: {log.actor_user_id}
                  </p>
                ) : null}
              </DetailSection>

              <DetailSection title="Ação">
                <p>{getAuditActionLabel(log.action)}</p>
                <p className="mt-1 font-mono text-xs text-vscode-text-muted">{log.action}</p>
                <p className="mt-2 text-xs text-vscode-text-muted">
                  Categoria: {getAuditCategoryLabel(log.category)}
                </p>
                <p className="mt-1 text-xs text-vscode-text-muted">
                  Resultado: {getAuditOutcomeLabel(log.outcome)}
                </p>
                <p className="mt-1 text-xs text-vscode-text-muted">
                  Em: {formatUserDate(log.criado_em)}
                </p>
              </DetailSection>

              <DetailSection title="Recurso">
                <p>{getAuditResourceLabel(log.resource_type, log.resource_id)}</p>
              </DetailSection>

              <section className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
                    Alterações
                  </h4>
                  {showDiffViewToggle ? (
                    <AuditDiffViewToggle value={diffViewMode} onChange={setDiffViewMode} />
                  ) : null}
                </div>
                <AuditChangeDiff
                  action={log.action}
                  changes={changes}
                  viewMode={diffViewMode}
                />
              </section>

              {log.http ? (
                <DetailSection title="HTTP">
                  <div className="space-y-1 text-xs">
                    {log.http.method ? <p>Método: {log.http.method}</p> : null}
                    {log.http.path ? <p>Caminho: {log.http.path}</p> : null}
                    {log.http.status_code != null ? (
                      <p>Status: {log.http.status_code}</p>
                    ) : null}
                    {log.http.ip ? <p>IP: {log.http.ip}</p> : null}
                    {log.http.user_agent ? (
                      <p className="break-all">User-Agent: {log.http.user_agent}</p>
                    ) : null}
                  </div>
                </DetailSection>
              ) : null}

              {showLegacyMetadata ? (
                <DetailSection title="Contexto">
                  <pre className="max-h-64 overflow-auto rounded border border-vscode-border bg-vscode-input-bg p-3 font-mono text-xs text-vscode-text">
                    {legacyMetadataJson}
                  </pre>
                </DetailSection>
              ) : null}

              {log.correlation_id ? (
                <DetailSection title="Correlation ID">
                  <button
                    type="button"
                    className="break-all font-mono text-xs text-vscode-accent hover:underline"
                    onClick={() => void copyToClipboard(log.correlation_id!)}
                  >
                    {log.correlation_id}
                  </button>
                </DetailSection>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
