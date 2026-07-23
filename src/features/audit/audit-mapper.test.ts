import { describe, expect, it } from 'vitest'
import { buildAuditQuery } from '@/features/audit/audit-mapper'
import type { AuditFilters } from '@/features/audit/audit-types'

describe('buildAuditQuery', () => {
  it('builds query with required pagination params', () => {
    const filters: AuditFilters = { page: 1, pageSize: 50 }
    expect(buildAuditQuery(filters)).toBe('?page=1&pageSize=50')
  })

  it('includes optional filters when provided', () => {
    const filters: AuditFilters = {
      page: 2,
      pageSize: 25,
      search: 'admin@example.com',
      actorUserId: 10,
      action: 'user.create',
      category: 'user',
      outcome: 'success',
      resourceType: 'report',
      resourceId: '42',
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-22T23:59:59.999Z',
    }

    const query = buildAuditQuery(filters)

    expect(query).toContain('page=2')
    expect(query).toContain('pageSize=25')
    expect(query).toContain('search=admin%40example.com')
    expect(query).toContain('actorUserId=10')
    expect(query).toContain('action=user.create')
    expect(query).toContain('category=user')
    expect(query).toContain('outcome=success')
    expect(query).toContain('resourceType=report')
    expect(query).toContain('resourceId=42')
    expect(query).toContain('from=')
    expect(query).toContain('to=')
  })

  it('omits empty optional filters', () => {
    const filters: AuditFilters = {
      page: 1,
      pageSize: 50,
      search: '',
      resourceId: '',
    }

    expect(buildAuditQuery(filters)).toBe('?page=1&pageSize=50')
  })
})
