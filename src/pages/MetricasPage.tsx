import clsx from 'clsx'

import SettingsPageHeader from '@/components/settings/SettingsPageHeader'

import SettingsCard from '@/components/settings/SettingsCard'

import IconButton from '@/components/ui/IconButton'

import { RefreshIcon } from '@/components/settings/SettingsIcons'

import {

  useCurrentMetrics,

  useLiveMetrics,

  useMetricsHistory,

} from '@/features/system-metrics/use-system-metrics'

import type { DependencyStatus } from '@/features/system-metrics/system-metrics-types'
import { formatTimeOnly } from '@/lib/datetime'

import {

  Bar,

  BarChart,

  CartesianGrid,

  Legend,

  Line,

  LineChart,

  ResponsiveContainer,

  Tooltip,

  XAxis,

  YAxis,

} from 'recharts'



const CHART_COLORS = {

  primary: 'var(--vscode-accent)',

  secondary: '#4ec9b0',

  warning: '#dcdcaa',

  danger: '#f48771',

  grid: 'rgba(255,255,255,0.08)',

  text: 'var(--vscode-text-muted)',

}



function formatTimeLabel(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    return ''
  }

  return formatTimeOnly(value)
}



function formatUptime(seconds: number): string {

  const hours = Math.floor(seconds / 3600)

  const minutes = Math.floor((seconds % 3600) / 60)

  return `${hours}h ${minutes}m`

}



function formatCpuPercent(value: number | null | undefined): string {

  if (value === null || value === undefined) {

    return '—'

  }

  return `${value}%`

}



function formatLoadAvg(loadAvg: [number, number, number]): string {

  const isUnavailable = loadAvg.every((value) => value === 0)

  if (isUnavailable) {

    return 'N/D no Windows'

  }

  return loadAvg.map((value) => value.toFixed(2)).join(' / ')

}



function StatusBadge({

  label,

  status,

  detail,

}: {

  label: string

  status: DependencyStatus

  detail?: string

}) {

  return (

    <div className="rounded border border-vscode-border bg-vscode-bg/40 px-3 py-2">

      <div className="flex items-center justify-between gap-2">

        <span className="text-sm text-vscode-text">{label}</span>

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

      </div>

      {detail && <p className="mt-1 text-xs text-vscode-text-muted">{detail}</p>}

    </div>

  )

}



export default function MetricasPage() {

  const liveQuery = useLiveMetrics()

  const currentQuery = useCurrentMetrics()

  const historyQuery = useMetricsHistory(24)



  const live = liveQuery.data

  const current = currentQuery.data

  const history = historyQuery.data?.items ?? []



  const memoryChartData = history.map((item) => ({

    time: item.recordedAt,

    heapMb: item.process.memoryMb.heapUsed,

    rssMb: item.process.memoryMb.rss,

    cpuPercent: item.process.cpuPercent ?? undefined,

  }))



  const apiChartData = history.map((item) => ({

    time: item.recordedAt,

    p50: item.http.latencyMs.p50,

    p95: item.http.latencyMs.p95,

    errorRate: item.http.errorRatePercent,

    requests: item.http.requestsInWindow,

  }))



  const storageChartData = history.map((item) => ({

    time: item.recordedAt,

    diskMb: item.storage.snapshotsDiskMb,

    files: item.storage.snapshotsFileCount,

  }))



  const latestQueues = current?.dependencies.pgBoss.queues ?? []

  const queueChartData = latestQueues.map((queue) => ({

    name: queue.name.replace('report.', ''),

    pending: queue.pending,

    active: queue.active,

    failed: queue.failed,

  }))



  function handleRefresh() {

    void liveQuery.refetch()

    void currentQuery.refetch()

    void historyQuery.refetch()

  }



  const hasError = liveQuery.isError || currentQuery.isError || historyQuery.isError



  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <SettingsPageHeader
          title="Métricas"
          subtitle="Atualização automática a cada 15s (cards) e 60s (histórico)."
        />
        <IconButton
          icon={<RefreshIcon />}
          label="Atualizar métricas"
          title="Atualizar"
          onClick={handleRefresh}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pt-6">
        {hasError && (
          <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Não foi possível carregar as métricas.
          </div>
        )}



      {live && (

        <>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Uptime</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {formatUptime(live.process.uptimeSeconds)}

              </p>

            </SettingsCard>

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Memória heap</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {live.process.memoryMb.heapUsed} MB

              </p>

            </SettingsCard>

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">CPU</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {formatCpuPercent(live.process.cpuPercent)}

              </p>

            </SettingsCard>

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Event loop lag</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {live.process.eventLoopLagMs} ms

              </p>

            </SettingsCard>

          </div>



          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Latência p95</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {live.http.latencyMs.p95} ms

              </p>

            </SettingsCard>

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Taxa de erro</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {live.http.errorRatePercent}%

              </p>

            </SettingsCard>

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Memória RSS</p>

              <p className="mt-1 text-2xl font-semibold text-vscode-text">

                {live.process.memoryMb.rss} MB

              </p>

            </SettingsCard>

            <SettingsCard>

              <p className="text-xs text-vscode-text-muted">Load avg (1m / 5m / 15m)</p>

              <p className="mt-1 text-lg font-semibold text-vscode-text">

                {formatLoadAvg(live.process.loadAvg)}

              </p>

            </SettingsCard>

          </div>

        </>

      )}



      {current && (

        <SettingsCard>

          <h2 className="mb-3 text-sm font-semibold text-vscode-text">Status dos serviços</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <StatusBadge

              label="PostgreSQL"

              status={current.dependencies.postgresql.status}

              detail={`${current.dependencies.postgresql.latencyMs} ms`}

            />

            <StatusBadge

              label="MongoDB"

              status={current.dependencies.mongodb.status}

              detail={`${current.dependencies.mongodb.latencyMs} ms`}

            />

            <StatusBadge

              label="pg-boss"

              status={current.dependencies.pgBoss.status}

              detail={`${current.dependencies.pgBoss.queues.length} fila(s)`}

            />

          </div>

        </SettingsCard>

      )}



      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <SettingsCard>

          <h2 className="mb-3 text-sm font-semibold text-vscode-text">Recursos (24h)</h2>

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={memoryChartData}>

                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />

                <XAxis dataKey="time" tickFormatter={formatTimeLabel} stroke={CHART_COLORS.text} fontSize={12} />

                <YAxis yAxisId="memory" stroke={CHART_COLORS.text} fontSize={12} />

                <YAxis yAxisId="cpu" orientation="right" stroke={CHART_COLORS.text} fontSize={12} unit="%" />

                <Tooltip labelFormatter={formatTimeLabel} />

                <Legend />

                <Line yAxisId="memory" type="monotone" dataKey="heapMb" name="Heap MB" stroke={CHART_COLORS.primary} dot={false} />

                <Line yAxisId="memory" type="monotone" dataKey="rssMb" name="RSS MB" stroke={CHART_COLORS.secondary} dot={false} />

                <Line yAxisId="cpu" type="monotone" dataKey="cpuPercent" name="CPU %" stroke={CHART_COLORS.warning} dot={false} connectNulls />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </SettingsCard>



        <SettingsCard>

          <h2 className="mb-3 text-sm font-semibold text-vscode-text">API (24h)</h2>

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={apiChartData}>

                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />

                <XAxis dataKey="time" tickFormatter={formatTimeLabel} stroke={CHART_COLORS.text} fontSize={12} />

                <YAxis stroke={CHART_COLORS.text} fontSize={12} />

                <Tooltip labelFormatter={formatTimeLabel} />

                <Legend />

                <Line type="monotone" dataKey="p50" name="p50 ms" stroke={CHART_COLORS.secondary} dot={false} />

                <Line type="monotone" dataKey="p95" name="p95 ms" stroke={CHART_COLORS.primary} dot={false} />

                <Line type="monotone" dataKey="errorRate" name="Erro %" stroke={CHART_COLORS.danger} dot={false} />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </SettingsCard>



        <SettingsCard>

          <h2 className="mb-3 text-sm font-semibold text-vscode-text">Filas pg-boss</h2>

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={queueChartData}>

                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />

                <XAxis dataKey="name" stroke={CHART_COLORS.text} fontSize={12} />

                <YAxis stroke={CHART_COLORS.text} fontSize={12} />

                <Tooltip />

                <Legend />

                <Bar dataKey="pending" name="Pendentes" fill={CHART_COLORS.warning} />

                <Bar dataKey="active" name="Ativos" fill={CHART_COLORS.primary} />

                <Bar dataKey="failed" name="Falhos" fill={CHART_COLORS.danger} />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </SettingsCard>



        <SettingsCard>

          <h2 className="mb-3 text-sm font-semibold text-vscode-text">Armazenamento de snapshots (24h)</h2>

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={storageChartData}>

                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />

                <XAxis dataKey="time" tickFormatter={formatTimeLabel} stroke={CHART_COLORS.text} fontSize={12} />

                <YAxis stroke={CHART_COLORS.text} fontSize={12} />

                <Tooltip labelFormatter={formatTimeLabel} />

                <Legend />

                <Line type="monotone" dataKey="diskMb" name="Disco MB" stroke={CHART_COLORS.primary} dot={false} />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </SettingsCard>
      </div>
      </div>
    </div>
  )
}


