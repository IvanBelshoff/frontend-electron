import type { UserInboxItem } from './user-inbox-types'

export type NotificationTone = 'success' | 'info' | 'error'

function isAiExploreNotification(item: UserInboxItem): boolean {
  return (
    item.type === 'ai_dashboard_discovery_ready' ||
    item.type === 'ai_dashboard_explore_ready' ||
    item.type === 'ai_dashboard_explore_failed'
  )
}

export function getNotificationReportName(item: UserInboxItem): string {
  if (isAiExploreNotification(item)) {
    if (item.payload.dashboardNome?.trim()) {
      return item.payload.dashboardNome.trim()
    }
    if (item.payload.dashboardId) {
      return `Dashboard #${item.payload.dashboardId}`
    }
    return 'Dashboard'
  }

  if (item.payload.relatorioNome?.trim()) {
    return item.payload.relatorioNome.trim()
  }

  const match = item.body.match(/relatório "([^"]+)"/i)
  if (match?.[1]) {
    return match[1]
  }

  if (item.payload.relatorioId) {
    return `Relatório #${item.payload.relatorioId}`
  }

  return 'Relatório'
}

export function getNotificationSummary(item: UserInboxItem): string {
  const isFailed =
    item.type === 'export_failed' ||
    item.type === 'snapshot_failed' ||
    item.type === 'ai_dashboard_explore_failed'

  if (isFailed && item.payload.errorMessage?.trim()) {
    return item.payload.errorMessage.trim()
  }

  return item.body?.trim() || ''
}

export function getNotificationKindLabel(item: UserInboxItem): string {
  if (item.type === 'export_ready' || item.type === 'export_failed') {
    return 'Exportação CSV'
  }

  if (item.type === 'ai_dashboard_discovery_ready') {
    return 'Mapa do dashboard'
  }

  if (
    item.type === 'ai_dashboard_explore_ready' ||
    item.type === 'ai_dashboard_explore_failed'
  ) {
    return 'Análise do dashboard'
  }

  return 'Snapshot'
}

export function getNotificationTone(item: UserInboxItem): NotificationTone {
  if (
    item.type === 'export_failed' ||
    item.type === 'snapshot_failed' ||
    item.type === 'ai_dashboard_explore_failed'
  ) {
    return 'error'
  }

  if (
    item.type === 'export_ready' ||
    item.type === 'ai_dashboard_explore_ready'
  ) {
    return 'success'
  }

  return 'info'
}

export function getNotificationOrigemLabel(
  origem?: 'manual' | 'agendado' | null,
): string | null {
  if (origem === 'manual') {
    return 'Manual'
  }

  if (origem === 'agendado') {
    return 'Agendado'
  }

  return null
}

export function canDownloadNotification(item: UserInboxItem): boolean {
  return (
    item.type === 'export_ready' &&
    item.payload.downloadAvailable === true &&
    Boolean(item.payload.jobId)
  )
}

export function canOpenReportNotification(item: UserInboxItem): boolean {
  if (!item.payload.relatorioId) {
    return false
  }

  return (
    item.type === 'snapshot_ready' ||
    item.type === 'export_failed' ||
    item.type === 'snapshot_failed'
  )
}

export function canOpenAiChatNotification(item: UserInboxItem): boolean {
  return isAiExploreNotification(item) && Boolean(item.payload.threadId)
}

export function getOpenReportButtonLabel(item: UserInboxItem): string {
  if (item.type === 'snapshot_ready') {
    return 'Abrir'
  }

  return 'Abrir relatório'
}

export function getNotificationSubjectLabel(item: UserInboxItem): string {
  return isAiExploreNotification(item) ? 'Dashboard' : 'Relatório'
}
