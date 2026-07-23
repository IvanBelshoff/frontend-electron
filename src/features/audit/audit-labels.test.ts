import { describe, expect, it } from 'vitest'
import {
  getAuditActionLabel,
  getAuditActorLabel,
  getAuditCategoryLabel,
  getAuditOutcomeLabel,
  getAuditResourceLabel,
} from '@/features/audit/audit-labels'

describe('audit-labels', () => {
  it('maps known actions to PT-BR labels', () => {
    expect(getAuditActionLabel('auth.login.success')).toBe('Login realizado')
    expect(getAuditActionLabel('user.create')).toBe('Usuário criado')
  })

  it('falls back to raw action when unmapped', () => {
    expect(getAuditActionLabel('custom.unknown.action')).toBe('custom.unknown.action')
  })

  it('maps categories and outcomes', () => {
    expect(getAuditCategoryLabel('auth')).toBe('Autenticação')
    expect(getAuditOutcomeLabel('denied')).toBe('Negado')
  })

  it('formats actor and resource labels', () => {
    expect(getAuditActorLabel('system', null)).toBe('Sistema')
    expect(getAuditActorLabel('anonymous', null)).toBe('Anônimo')
    expect(getAuditActorLabel('user', 'admin@example.com')).toBe('admin@example.com')
    expect(getAuditResourceLabel('report', 10)).toBe('report #10')
    expect(getAuditResourceLabel(null, null)).toBe('—')
  })
})
