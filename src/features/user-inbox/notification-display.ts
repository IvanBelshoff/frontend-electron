import type { UserInboxItem } from './user-inbox-types'

export type NotificationTone = 'success' | 'info' | 'error'

export function getNotificationReportName(item: UserInboxItem): string {
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
  const isFailed = item.type === 'export_failed' || item.type === 'snapshot_failed'

  if (isFailed && item.payload.errorMessage?.trim()) {
    return item.payload.errorMessage.trim()
  }

  return item.body?.trim() || ''
}

export function getNotificationKindLabel(item: UserInboxItem): string {
  if (item.type === 'export_ready' || item.type === 'export_failed') {
    return 'Exportação CSV'
  }

  return 'Snapshot'
}

export function getNotificationTone(item: UserInboxItem): NotificationTone {
  if (item.type === 'export_failed' || item.type === 'snapshot_failed') {
    return 'error'
  }

  if (item.type === 'export_ready') {
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

export function getOpenReportButtonLabel(item: UserInboxItem): string {
  if (item.type === 'snapshot_ready') {
    return 'Abrir'
  }

  return 'Abrir relatório'
}
