import type { UIMessage } from 'ai'
import { describe, expect, it } from 'vitest'
import {
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
