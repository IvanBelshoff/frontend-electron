import { buildAuditQuery } from '@/features/audit/audit-mapper'
import type {
  AuditActionsMeta,
  AuditFilters,
  AuditLogItem,
  AuditLogsListResult,
} from '@/features/audit/audit-types'
import { apiRequest } from '@/lib/api-client'

export async function listAuditLogs(filters: AuditFilters): Promise<AuditLogsListResult> {
  const query = buildAuditQuery(filters)
  return apiRequest<AuditLogsListResult>(`/admin/audit${query}`)
}

export async function getAuditLog(id: string): Promise<AuditLogItem> {
  return apiRequest<AuditLogItem>(`/admin/audit/${id}`)
}

export async function listAuditActions(): Promise<AuditActionsMeta> {
  return apiRequest<AuditActionsMeta>('/admin/audit/meta/actions')
}
