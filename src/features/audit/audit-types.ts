export type AuditActorType = 'user' | 'system' | 'anonymous'

export type AuditOutcome = 'success' | 'failure' | 'denied'

export type AuditCategory =
  | 'auth'
  | 'user'
  | 'acl'
  | 'dashboard'
  | 'report'
  | 'connection'
  | 'scheduler'

export type AuditChangeSummary = 'modified' | 'truncated'

export interface AuditFieldChange {
  field: string
  from: unknown | null
  to: unknown | null
  summary?: AuditChangeSummary
  added?: number[]
  removed?: number[]
}

export interface AuditMetadataV2 {
  changes?: AuditFieldChange[]
  context?: Record<string, unknown>
}

export interface AuditHttpContext {
  method?: string
  path?: string
  status_code?: number
  ip?: string
  user_agent?: string
}

export interface AuditLogListItem {
  id: string
  actor_user_id: number | null
  actor_email: string | null
  actor_type: AuditActorType
  action: string
  category: AuditCategory
  outcome: AuditOutcome
  resource_type: string | null
  resource_id: string | number | null
  criado_em: string
}

export interface AuditLogItem {
  id: string
  actor_user_id: number | null
  actor_email: string | null
  actor_type: AuditActorType
  action: string
  category: AuditCategory
  outcome: AuditOutcome
  resource_type: string | null
  resource_id: string | number | null
  http?: AuditHttpContext
  metadata: Record<string, unknown>
  correlation_id: string | null
  criado_em: string
}

export interface AuditFilters {
  page: number
  pageSize: number
  search?: string
  sort?: string
  actorUserId?: number
  action?: string
  category?: AuditCategory
  outcome?: AuditOutcome
  resourceType?: string
  resourceId?: string
  from?: string
  to?: string
}

export interface AuditLogsListResult {
  items: AuditLogListItem[]
  page: number
  pageSize: number
  total: number
}

export interface AuditActionsMeta {
  actions: string[]
}

export type AuditAdvancedFilters = Omit<AuditFilters, 'page' | 'pageSize' | 'search'>
