import type { UIMessage } from 'ai'
import { describe, expect, it } from 'vitest'
import {
  getMessagePlan,
  getMessageTables,
  getMessageText,
  getPendingAnalysisJobIds,
  isMessageAwaitingAnalysis,
} from '@/features/ai/ai-chat-utils'

function assistantMessage(
  id: string,
  analysis?: { status: 'processing' | 'done' | 'failed'; jobId: string },
): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text: 'ok' }],
    ...(analysis ? { metadata: { analysis } } : {}),
  }
}

describe('getPendingAnalysisJobIds', () => {
  it('returns jobs that are still processing', () => {
    const messages = [
      assistantMessage('1'),
      assistantMessage('2', { status: 'processing', jobId: 'job-1' }),
    ]

    expect(getPendingAnalysisJobIds(messages)).toEqual(['job-1'])
  })

  it('clears a job once a later message reports the outcome', () => {
    const messages = [
      assistantMessage('1', { status: 'processing', jobId: 'job-1' }),
      assistantMessage('2', { status: 'done', jobId: 'job-1' }),
    ]

    expect(getPendingAnalysisJobIds(messages)).toEqual([])
  })

  it('keeps other jobs pending when one of them fails', () => {
    const messages = [
      assistantMessage('1', { status: 'processing', jobId: 'job-1' }),
      assistantMessage('2', { status: 'processing', jobId: 'job-2' }),
      assistantMessage('3', { status: 'failed', jobId: 'job-1' }),
    ]

    expect(getPendingAnalysisJobIds(messages)).toEqual(['job-2'])
  })
})

describe('isMessageAwaitingAnalysis', () => {
  it('flags only the message that queued a still-pending analysis', () => {
    const queued = assistantMessage('1', { status: 'processing', jobId: 'job-1' })
    const result = assistantMessage('2', { status: 'done', jobId: 'job-1' })

    expect(isMessageAwaitingAnalysis(queued, ['job-1'])).toBe(true)
    expect(isMessageAwaitingAnalysis(queued, [])).toBe(false)
    expect(isMessageAwaitingAnalysis(result, ['job-1'])).toBe(false)
  })
})

describe('getMessageText', () => {
  it('strips leaked tool_call markup from text parts', () => {
    const message: UIMessage = {
      id: 'm1',
      role: 'assistant',
      parts: [{ type: 'text', text: '</tool_call>' }],
    }

    expect(getMessageText(message)).toBe('')
  })
})

describe('getMessageTables', () => {
  it('reads table from data-table parts', () => {
    const message: UIMessage = {
      id: 't1',
      role: 'assistant',
      parts: [
        {
          type: 'data-table',
          id: 'table-1',
          data: {
            title: 'NPS por mês',
            columns: [
              { key: 'mes', label: 'Mês' },
              { key: 'nps', label: 'NPS', align: 'right' },
            ],
            rows: [{ mes: '04', nps: 86.36 }],
          },
        } as UIMessage['parts'][number],
      ],
    }

    expect(getMessageTables(message)[0]?.spec.title).toBe('NPS por mês')
  })
})

describe('getMessagePlan', () => {
  it('reads plan from data-plan parts', () => {
    const message: UIMessage = {
      id: 'p1',
      role: 'assistant',
      parts: [
        {
          type: 'data-plan',
          id: 'plan-1',
          data: {
            id: '3f0b8f1e-6c3a-4d5b-9f2e-8a1b2c3d4e5f',
            status: 'awaiting_approval',
            objetivo: 'Analisar NPS',
            relatorioIds: [1],
            perguntas: [
              {
                id: 'q1',
                texto: 'Recorte?',
                opcoes: [
                  { key: 'a', label: 'A' },
                  { key: 'b', label: 'B' },
                ],
              },
            ],
            passos: [{ id: 's1', titulo: 'Passo', detalhe: 'Detalhe', status: 'pending' }],
          },
        } as UIMessage['parts'][number],
      ],
    }

    expect(getMessagePlan(message)?.objetivo).toBe('Analisar NPS')
  })

  it('prefers newer plan status from metadata over stale data-plan parts', () => {
    const planId = '3f0b8f1e-6c3a-4d5b-9f2e-8a1b2c3d4e5f'
    const message: UIMessage = {
      id: 'p1',
      role: 'assistant',
      parts: [
        {
          type: 'data-plan',
          id: planId,
          data: {
            id: planId,
            status: 'awaiting_approval',
            objetivo: 'Analisar NPS',
            relatorioIds: [1],
            perguntas: [],
            passos: [],
          },
        } as UIMessage['parts'][number],
      ],
      metadata: {
        plan: {
          id: planId,
          status: 'running',
          objetivo: 'Analisar NPS',
          relatorioIds: [1],
          perguntas: [],
          passos: [],
          jobId: 'job-1',
        },
      },
    }

    expect(getMessagePlan(message)?.status).toBe('running')
  })
})
