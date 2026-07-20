import { describe, expect, it } from 'vitest'
import {
  canOpenReportNotification,
  getNotificationReportName,
  getNotificationSummary,
  getNotificationTone,
} from './notification-display'
import type { UserInboxItem } from './user-inbox-types'

function createItem(overrides: Partial<UserInboxItem> = {}): UserInboxItem {
  return {
    id: 'notification-id',
    type: 'snapshot_ready',
    title: 'Snapshot atualizado',
    body: 'O snapshot do relatório "Vendas Mensais" foi atualizado.',
    payload: {
      relatorioId: 10,
      relatorioNome: 'Vendas Mensais',
    },
    readAt: null,
    createdAt: '2026-07-20T13:55:00.000Z',
    ...overrides,
  }
}

describe('notification-display', () => {
  it('returns report name from payload', () => {
    expect(getNotificationReportName(createItem())).toBe('Vendas Mensais')
  })

  it('falls back to report name extracted from body', () => {
    const item = createItem({
      payload: { relatorioId: 10 },
      body: 'O snapshot do relatório "Relatório Legado" foi atualizado.',
    })

    expect(getNotificationReportName(item)).toBe('Relatório Legado')
  })

  it('falls back to report id when name is unavailable', () => {
    const item = createItem({
      body: '',
      payload: { relatorioId: 42 },
    })

    expect(getNotificationReportName(item)).toBe('Relatório #42')
  })

  it('prioritizes error message for failed notifications', () => {
    const item = createItem({
      type: 'export_failed',
      body: 'Não foi possível exportar o relatório "Vendas Mensais".',
      payload: {
        relatorioId: 10,
        relatorioNome: 'Vendas Mensais',
        errorMessage: 'Timeout ao gerar CSV',
      },
    })

    expect(getNotificationSummary(item)).toBe('Timeout ao gerar CSV')
    expect(getNotificationTone(item)).toBe('error')
  })

  it('allows opening report for snapshot and failed notifications', () => {
    expect(canOpenReportNotification(createItem())).toBe(true)
    expect(
      canOpenReportNotification(
        createItem({
          type: 'export_failed',
          payload: { relatorioId: 10 },
        }),
      ),
    ).toBe(true)
    expect(
      canOpenReportNotification(
        createItem({
          type: 'export_ready',
          payload: { relatorioId: 10, downloadAvailable: true, jobId: 'job-id' },
        }),
      ),
    ).toBe(false)
  })
})
