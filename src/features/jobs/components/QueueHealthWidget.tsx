import clsx from 'clsx'
import SettingsCard from '@/components/settings/SettingsCard'
import { useCurrentMetrics } from '@/features/system-metrics/use-system-metrics'
import type { DependencyStatus } from '@/features/system-metrics/system-metrics-types'

function formatQueueName(name: string): string {
  return name
    .replace('report.', '')
    .replace('scheduler.', '')
}

function PgBossStatusBadge({ status }: { status: DependencyStatus }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'up' && 'bg-vscode-success/15 text-vscode-success',
        status === 'down' && 'bg-red-500/15 text-red-400',
        status === 'disabled' && 'bg-vscode-text-muted/15 text-vscode-text-muted',
      )}
    >
      {status === 'up' ? 'Online' : status === 'down' ? 'Offline' : 'Desabilitado'}
    </span>
  )
}

export default function QueueHealthWidget() {
  const { data, isLoading, isError } = useCurrentMetrics()

  const queues = data?.dependencies.pgBoss.queues ?? []
  const pgBossStatus = data?.dependencies.pgBoss.status ?? 'disabled'

  if (isLoading) {
    return (
      <SettingsCard>
        <p className="text-sm text-vscode-text-muted">Carregando saúde das filas...</p>
      </SettingsCard>
    )
  }

  if (isError || !data) {
    return (
      <SettingsCard>
        <p className="text-sm text-red-400">Não foi possível carregar as filas pg-boss.</p>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-vscode-text">Saúde das filas pg-boss</h2>
        <PgBossStatusBadge status={pgBossStatus} />
      </div>

      {queues.length === 0 ? (
        <p className="text-sm text-vscode-text-muted">Nenhuma fila monitorada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {queues.map((queue) => (
            <div
              key={queue.name}
              className="rounded border border-vscode-border bg-vscode-bg/40 px-3 py-3"
            >
              <p className="text-sm font-medium text-vscode-text">{formatQueueName(queue.name)}</p>
              <p className="mt-1 text-xs text-vscode-text-muted">{queue.name}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-vscode-text">{queue.pending}</p>
                  <p className="text-xs text-vscode-text-muted">Pendentes</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-vscode-accent">{queue.active}</p>
                  <p className="text-xs text-vscode-text-muted">Ativos</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-400">{queue.failed}</p>
                  <p className="text-xs text-vscode-text-muted">Falhos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  )
}
