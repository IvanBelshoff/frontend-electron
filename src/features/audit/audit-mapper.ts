import type { AuditFilters } from '@/features/audit/audit-types'

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function buildAuditQuery(filters: AuditFilters): string {
  return buildQueryString({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    actorUserId: filters.actorUserId,
    action: filters.action,
    category: filters.category,
    outcome: filters.outcome,
    resourceType: filters.resourceType,
    resourceId: filters.resourceId,
    from: filters.from,
    to: filters.to,
    sort: filters.sort,
  })
}
