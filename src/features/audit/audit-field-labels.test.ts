import { describe, expect, it } from 'vitest'
import { getAuditFieldLabel } from '@/features/audit/audit-field-labels'
import {
  buildLineDiffRows,
  buildSimpleChangePanels,
  buildUnifiedChangeRows,
  inferAuditChangeMode,
} from '@/features/audit/components/audit-line-diff.util'

describe('audit-field-labels', () => {
  it('maps known fields to PT-BR labels', () => {
    expect(getAuditFieldLabel('nome')).toBe('Nome')
    expect(getAuditFieldLabel('regrasIds')).toBe('Regras')
  })

  it('falls back to raw field name', () => {
    expect(getAuditFieldLabel('custom_field')).toBe('custom_field')
  })
})

describe('audit-line-diff util', () => {
  it('builds remove/add rows for changed lines', () => {
    const rows = buildLineDiffRows('linha antiga', 'linha nova')

    expect(rows).toEqual([
      { type: 'remove', lineNumber: 1, content: 'linha antiga' },
      { type: 'add', lineNumber: 2, content: 'linha nova' },
    ])
  })

  it('infers change mode from action', () => {
    expect(inferAuditChangeMode('dashboard.delete')).toBe('delete')
    expect(inferAuditChangeMode('dashboard.create')).toBe('create')
    expect(inferAuditChangeMode('dashboard.update')).toBe('update')
  })

  it('shows only before values for delete actions', () => {
    const rows = buildUnifiedChangeRows(
      [
        { field: 'nome', from: 'Dashboard Seed 01', to: null },
        { field: 'url', from: '/dash/01', to: null },
      ],
      'delete',
      getAuditFieldLabel,
    )

    expect(rows).toEqual([
      { type: 'remove', lineNumber: 1, content: 'Nome: Dashboard Seed 01' },
      { type: 'remove', lineNumber: 2, content: 'URL: /dash/01' },
    ])
  })

  it('shows only after values for create actions', () => {
    const rows = buildUnifiedChangeRows(
      [{ field: 'nome', from: null, to: 'Novo Dashboard' }],
      'create',
      getAuditFieldLabel,
    )

    expect(rows).toEqual([
      { type: 'add', lineNumber: 1, content: 'Nome: Novo Dashboard' },
    ])
  })

  it('shows before and after for update actions', () => {
    const rows = buildUnifiedChangeRows(
      [{ field: 'nome', from: 'Antigo', to: 'Novo' }],
      'update',
      getAuditFieldLabel,
    )

    expect(rows).toEqual([
      { type: 'remove', lineNumber: 1, content: 'Nome: Antigo' },
      { type: 'add', lineNumber: 2, content: 'Nome: Novo' },
    ])
  })

  it('splits simple panels into antes and depois', () => {
    const panels = buildSimpleChangePanels(
      [{ field: 'nome', from: 'Antigo', to: 'Novo' }],
      'update',
      getAuditFieldLabel,
    )

    expect(panels).toEqual({
      before: ['Nome: Antigo'],
      after: ['Nome: Novo'],
    })
  })

  it('shows only antes panel for delete actions in simple mode', () => {
    const panels = buildSimpleChangePanels(
      [{ field: 'nome', from: 'Dashboard', to: null }],
      'delete',
      getAuditFieldLabel,
    )

    expect(panels).toEqual({
      before: ['Nome: Dashboard'],
      after: [],
    })
  })
})
