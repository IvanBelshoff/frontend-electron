import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import {
  confirmDashboardAnalysis,
  getDashboardExploreJob,
  startDashboardDiscovery,
} from '@/features/ai/ai-dashboard-explore-api'
import type { AiExploreCard as ExploreCardType } from '@/features/ai/ai-dashboard-explore-types'
import { getOptionChipsFromExploreCard } from '@/features/ai/ai-explore-card-utils'
import { ApiError } from '@/features/auth/auth-types'

/** Evita loop: refresh remonta o card e recria o effect; o Set sobrevive ao remount. */
const finishedExploreJobIds = new Set<string>()

type AiExploreCardProps = {
  card: ExploreCardType
  threadId?: string
  disabled?: boolean
  onChipClick?: (value: string) => void
  onJobStarted?: () => void
  onJobFinished?: () => void
}

export default function AiExploreCardView({
  card,
  threadId,
  disabled = false,
  onChipClick,
  onJobStarted,
  onJobFinished,
}: AiExploreCardProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusLabel, setStatusLabel] = useState<string | null>(null)
  const chips = getOptionChipsFromExploreCard(card)
  const onJobFinishedRef = useRef(onJobFinished)

  useEffect(() => {
    onJobFinishedRef.current = onJobFinished
  }, [onJobFinished])

  const jobId =
    card.kind === 'discovery_running' || card.kind === 'analysis_running'
      ? card.jobId
      : null

  useEffect(() => {
    if (!jobId) {
      return
    }

    if (finishedExploreJobIds.has(jobId)) {
      setStatusLabel(
        card.kind === 'analysis_running' ? 'Análise concluída.' : 'Mapa pronto.',
      )
      return
    }

    let cancelled = false
    let intervalId: number | null = null

    const stopPolling = () => {
      if (intervalId != null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    const finishJob = (label: string) => {
      stopPolling()
      setStatusLabel(label)
      if (finishedExploreJobIds.has(jobId)) {
        return
      }
      finishedExploreJobIds.add(jobId)
      onJobFinishedRef.current?.()
    }

    const tick = async () => {
      try {
        const job = await getDashboardExploreJob(jobId)
        if (cancelled || finishedExploreJobIds.has(jobId)) {
          stopPolling()
          return
        }

        if (job.status === 'queued' || job.status === 'processing') {
          setStatusLabel(
            job.fase === 'discovery'
              ? `Mapeando o dashboard… ${job.progress}%`
              : `Analisando… ${job.progress}%`,
          )
          return
        }

        if (job.status === 'completed') {
          finishJob(
            job.fase === 'discovery' ? 'Mapa pronto.' : 'Análise concluída.',
          )
          return
        }

        if (job.status === 'failed') {
          finishJob(job.errorMessage || 'Falha na exploração.')
        }
      } catch {
        /* ignore transient poll errors */
      }
    }

    void tick()
    intervalId = window.setInterval(() => void tick(), 4000)

    return () => {
      cancelled = true
      stopPolling()
    }
  }, [jobId, card.kind])

  async function handleStartDiscovery() {
    if (!threadId || card.kind !== 'start_discovery') {
      setError('Abra ou continue esta conversa para iniciar a análise.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await startDashboardDiscovery({
        threadId,
        dashboardId: card.dashboardId,
      })
      onJobStarted?.()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível iniciar a análise.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmAnalysis() {
    if (!threadId || card.kind !== 'confirm_analysis') {
      setError('Abra ou continue esta conversa para confirmar a análise.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await confirmDashboardAnalysis({
        threadId,
        dashboardId: card.dashboardId,
        plano: card.plano,
      })
      onJobStarted?.()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível confirmar a análise.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-vscode-border bg-vscode-sidebar/50 p-3">
      <p className="text-xs font-semibold text-vscode-text">
        {card.kind === 'start_discovery' && `Análise avançada · ${card.dashboardNome}`}
        {card.kind === 'discovery_running' && `Mapeando · ${card.dashboardNome}`}
        {card.kind === 'discovery_ready' && `Mapa pronto · ${card.dashboardNome}`}
        {card.kind === 'confirm_analysis' && `Confirmar plano · ${card.dashboardNome}`}
        {card.kind === 'analysis_running' && `Analisando · ${card.dashboardNome}`}
        {card.kind === 'analysis_ready' && `Insight pronto · ${card.dashboardNome}`}
      </p>

      {card.kind === 'start_discovery' && (
        <p className="text-xs text-vscode-text-muted">
          Vou mapear abas e filtros, fazer perguntas e só então abrir as páginas com o recorte
          escolhido.
        </p>
      )}

      {card.kind === 'confirm_analysis' && (
        <div className="space-y-1 text-xs text-vscode-text-muted">
          <p>
            <span className="text-vscode-text">Pergunta:</span> {card.plano.perguntaAnalitica}
          </p>
          {card.plano.abas.length > 0 && (
            <p>
              <span className="text-vscode-text">Abas:</span> {card.plano.abas.join(', ')}
            </p>
          )}
          {card.plano.filtros.length > 0 && (
            <p>
              <span className="text-vscode-text">Filtros:</span>{' '}
              {card.plano.filtros.map((f) => `${f.nome}=${f.valor}`).join('; ')}
            </p>
          )}
        </div>
      )}

      {statusLabel && (
        <p className="text-xs text-vscode-text-muted">{statusLabel}</p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {card.kind === 'start_discovery' && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={disabled || busy || !threadId}
            loading={busy}
            onClick={() => void handleStartDiscovery()}
          >
            Iniciar análise
          </Button>
        </div>
      )}

      {card.kind === 'confirm_analysis' && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={disabled || busy || !threadId}
            loading={busy}
            onClick={() => void handleConfirmAnalysis()}
          >
            Analisar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || busy}
            onClick={() => onChipClick?.('Quero ajustar o plano de análise.')}
          >
            Ajustar
          </Button>
        </div>
      )}

      {chips.length > 0 && onChipClick && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={disabled}
              onClick={() => onChipClick(chip)}
              className="rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-[11px] text-vscode-text hover:border-vscode-accent/50 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
