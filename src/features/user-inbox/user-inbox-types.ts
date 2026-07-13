export type UserNotificationType =
  | 'export_ready'
  | 'export_failed'
  | 'snapshot_ready'
  | 'snapshot_failed'

export type UserNotificationPayload = {
  jobId?: string
  relatorioId?: number
  relatorioNome?: string
  downloadAvailable?: boolean
  errorMessage?: string | null
  jobTipo?: string
  jobStatus?: string
}

export type UserInboxItem = {
  id: string
  type: UserNotificationType
  title: string
  body: string
  payload: UserNotificationPayload
  readAt: string | null
  createdAt: string
}

export type UserInboxListResult = {
  items: UserInboxItem[]
  page: number
  pageSize: number
  total: number
}

export type UserProfileSummary = {
  ultimoLogin: string | null
  membroDesde: string | null
  relatoriosAcessiveis: number
  dashboardsAcessiveis: number
  relatoriosFavoritos: number
  dashboardsFavoritos: number
  relatoriosProprios: number
  regras: string[]
  permissoes: string[]
  notificacoesNaoLidas: number
}
