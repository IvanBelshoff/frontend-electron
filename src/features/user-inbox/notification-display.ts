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

export function isAiAnalysisNotification(item: UserInboxItem): boolean {
  return item.type === 'ai_analysis_ready' || item.type === 'ai_analysis_failed'
}

/** Pergunta que originou a análise, usada no lugar do nome do relatório. */
export function getAiAnalysisQuestion(item: UserInboxItem): string {
  return item.payload.pergunta?.trim() || 'Análise do assistente'
}

export function getNotificationSummary(item: UserInboxItem): string {
  const isFailed =
    item.type === 'export_failed' ||
    item.type === 'snapshot_failed' ||
    item.type === 'ai_analysis_failed'

  if (isFailed && item.payload.errorMessage?.trim()) {
    return item.payload.errorMessage.trim()
  }

  return item.body?.trim() || ''
}

export function getNotificationKindLabel(item: UserInboxItem): string {
  if (item.type === 'export_ready' || item.type === 'export_failed') {
    return 'Exportação CSV'
  }

  if (isAiAnalysisNotification(item)) {
    return 'Análise IA'
  }

  return 'Snapshot'
}

export function getNotificationTone(item: UserInboxItem): NotificationTone {
  if (
    item.type === 'export_failed' ||
    item.type === 'snapshot_failed' ||
    item.type === 'ai_analysis_failed'
  ) {
    return 'error'
  }

  if (item.type === 'export_ready' || item.type === 'ai_analysis_ready') {
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

export function canOpenAiThreadNotification(item: UserInboxItem): boolean {
  return isAiAnalysisNotification(item) && Boolean(item.payload.threadId)
}

export function getOpenReportButtonLabel(item: UserInboxItem): string {
  if (item.type === 'snapshot_ready') {
    return 'Abrir'
  }

  return 'Abrir relatório'
}
