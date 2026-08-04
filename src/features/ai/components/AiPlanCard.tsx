import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  approveAiPlan,
  cancelAiPlan,
  updateAiPlan,
} from '@/features/ai/ai-chat-api'
import type { AiPlan, AiPlanQuestion, AiPlanStep } from '@/features/ai/ai-chat-types'

type AiPlanCardProps = {
  plan: AiPlan
  threadId: string
  onChanged: () => void
}

function statusLabel(status: AiPlan['status']): string {
  switch (status) {
    case 'awaiting_approval':
      return 'Aguardando aprovação'
    case 'running':
      return 'Executando'
    case 'done':
      return 'Concluído'
    case 'failed':
      return 'Falhou'
    case 'cancelled':
      return 'Cancelado'
    default:
      return status
  }
}

export default function AiPlanCard({ plan, threadId, onChanged }: AiPlanCardProps) {
  const editable = plan.status === 'awaiting_approval'
  const [objetivo, setObjetivo] = useState(plan.objetivo)
  const [perguntas, setPerguntas] = useState<AiPlanQuestion[]>(plan.perguntas)
  const [passos, setPassos] = useState<AiPlanStep[]>(plan.passos)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setObjetivo(plan.objetivo)
    setPerguntas(plan.perguntas)
    setPassos(plan.passos)
  }, [plan])

  const canApprove = useMemo(() => {
    return perguntas.every((pergunta) => {
      const answered =
        Boolean(pergunta.respostaUsuario?.trim()) ||
        Boolean(pergunta.respostaLivre?.trim())
      if (!answered) {
        return false
      }

      const isOutra =
        pergunta.respostaUsuario === 'outra' ||
        pergunta.opcoes.some(
          (option) =>
            option.key === pergunta.respostaUsuario && /outra/i.test(option.label),
        )

      if (isOutra && !pergunta.respostaLivre?.trim()) {
        return false
      }

      return true
    })
  }, [perguntas])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateAiPlan(threadId, plan.id, {
        objetivo,
        perguntas: perguntas.map((pergunta) => ({
          id: pergunta.id,
          respostaUsuario: pergunta.respostaUsuario,
          respostaLivre: pergunta.respostaLivre,
        })),
        passos: passos.map((passo) => ({
          id: passo.id,
          titulo: passo.titulo,
          detalhe: passo.detalhe,
        })),
      }),
    onSuccess: () => {
      setError(null)
      onChanged()
    },
    onError: (err: Error) => {
      setError(err.message || 'Não foi possível salvar o plano.')
    },
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      await updateAiPlan(threadId, plan.id, {
        objetivo,
        perguntas: perguntas.map((pergunta) => ({
          id: pergunta.id,
          respostaUsuario: pergunta.respostaUsuario,
          respostaLivre: pergunta.respostaLivre,
        })),
        passos: passos.map((passo) => ({
          id: passo.id,
          titulo: passo.titulo,
          detalhe: passo.detalhe,
        })),
      })
      return approveAiPlan(threadId, plan.id)
    },
    onSuccess: () => {
      setError(null)
      onChanged()
    },
    onError: (err: Error) => {
      setError(err.message || 'Não foi possível aprovar o plano.')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelAiPlan(threadId, plan.id),
    onSuccess: () => {
      setError(null)
      onChanged()
    },
    onError: (err: Error) => {
      setError(err.message || 'Não foi possível cancelar o plano.')
    },
  })

  const busy =
    saveMutation.isPending || approveMutation.isPending || cancelMutation.isPending

  return (
    <div className="mt-3 rounded-md border border-vscode-border bg-vscode-editor-bg/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-vscode-text-muted">
          Plano de análise
        </p>
        <span className="text-[11px] text-vscode-text-muted">{statusLabel(plan.status)}</span>
      </div>

      {editable ? (
        <textarea
          value={objetivo}
          onChange={(event) => setObjetivo(event.target.value)}
          rows={2}
          className="mb-3 w-full resize-y rounded border border-vscode-border bg-vscode-input-bg px-2 py-1.5 text-sm text-vscode-text"
          aria-label="Objetivo do plano"
        />
      ) : (
        <p className="mb-3 text-sm text-vscode-text">{plan.objetivo}</p>
      )}

      <div className="mb-3 space-y-3">
        {perguntas.map((pergunta, index) => (
          <fieldset key={pergunta.id} className="space-y-1.5" disabled={!editable || busy}>
            <legend className="text-xs font-medium text-vscode-text">
              {String.fromCharCode(65 + index)}. {pergunta.texto}
            </legend>
            {pergunta.opcoes.map((option) => (
              <label
                key={option.key}
                className="flex cursor-pointer items-start gap-2 text-sm text-vscode-text"
              >
                <input
                  type="radio"
                  name={`plan-${plan.id}-${pergunta.id}`}
                  className="mt-1"
                  checked={pergunta.respostaUsuario === option.key}
                  onChange={() => {
                    setPerguntas((current) =>
                      current.map((item) =>
                        item.id === pergunta.id
                          ? {
                              ...item,
                              respostaUsuario: option.key,
                              respostaLivre: /outra/i.test(option.label)
                                ? item.respostaLivre
                                : undefined,
                            }
                          : item,
                      ),
                    )
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
            {(pergunta.respostaUsuario === 'outra' ||
              pergunta.opcoes.some(
                (option) =>
                  option.key === pergunta.respostaUsuario && /outra/i.test(option.label),
              )) && (
              <input
                type="text"
                value={pergunta.respostaLivre ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setPerguntas((current) =>
                    current.map((item) =>
                      item.id === pergunta.id
                        ? { ...item, respostaLivre: value }
                        : item,
                    ),
                  )
                }}
                placeholder="Descreva a outra opção…"
                className="mt-1 w-full rounded border border-vscode-border bg-vscode-input-bg px-2 py-1.5 text-sm text-vscode-text"
              />
            )}
          </fieldset>
        ))}
      </div>

      <div className="mb-3 space-y-2">
        <p className="text-xs font-medium text-vscode-text">Passos</p>
        {passos.map((passo, index) => (
          <div key={passo.id} className="rounded border border-vscode-border/70 p-2">
            {editable ? (
              <>
                <input
                  value={passo.titulo}
                  onChange={(event) => {
                    const value = event.target.value
                    setPassos((current) =>
                      current.map((item) =>
                        item.id === passo.id ? { ...item, titulo: value } : item,
                      ),
                    )
                  }}
                  className="mb-1 w-full rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-sm font-medium text-vscode-text"
                  aria-label={`Título do passo ${index + 1}`}
                />
                <textarea
                  value={passo.detalhe}
                  onChange={(event) => {
                    const value = event.target.value
                    setPassos((current) =>
                      current.map((item) =>
                        item.id === passo.id ? { ...item, detalhe: value } : item,
                      ),
                    )
                  }}
                  rows={2}
                  className="w-full resize-y rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-sm text-vscode-text"
                  aria-label={`Detalhe do passo ${index + 1}`}
                />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-vscode-text">
                  {index + 1}. {passo.titulo}
                </p>
                <p className="text-xs text-vscode-text-muted">{passo.detalhe}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {plan.status === 'running' && (
        <p className="mb-2 flex items-center gap-2 text-xs text-vscode-text-muted">
          <span
            className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden
          />
          Executando o plano em segundo plano…
        </p>
      )}

      {plan.status === 'failed' && plan.erro && (
        <p className="mb-2 text-xs text-red-400">{plan.erro}</p>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {editable && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !canApprove}
            onClick={() => approveMutation.mutate()}
            className="rounded bg-vscode-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {approveMutation.isPending ? 'Aprovando…' : 'Aprovar plano'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => saveMutation.mutate()}
            className="rounded border border-vscode-border px-3 py-1.5 text-xs text-vscode-text disabled:opacity-50"
          >
            Salvar alterações
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => cancelMutation.mutate()}
            className="rounded border border-vscode-border px-3 py-1.5 text-xs text-vscode-text-muted disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
