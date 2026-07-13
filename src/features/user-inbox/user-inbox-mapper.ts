import { coerceApiDateString } from '@/lib/datetime'
import type {
  UserInboxItem,
  UserNotificationPayload,
  UserNotificationType,
  UserProfileSummary,
} from './user-inbox-types'

type UserInboxApiRecord = {
  id: string
  type: UserNotificationType
  title: string
  body: string
  payload?: UserNotificationPayload
  read_at?: string | null
  created_at?: string
}

type UserProfileSummaryApiRecord = {
  ultimo_login?: string | null
  membro_desde?: string | null
  relatorios_acessiveis?: number
  dashboards_acessiveis?: number
  relatorios_favoritos?: number
  dashboards_favoritos?: number
  relatorios_proprios?: number
  regras?: string[]
  permissoes?: string[]
  notificacoes_nao_lidas?: number
}

export function mapUserInboxItemFromApi(record: UserInboxApiRecord): UserInboxItem {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    body: record.body,
    payload: record.payload ?? {},
    readAt: coerceApiDateString(record.read_at) ?? null,
    createdAt: coerceApiDateString(record.created_at) ?? new Date().toISOString(),
  }
}

export function mapUserProfileSummaryFromApi(
  record: UserProfileSummaryApiRecord,
): UserProfileSummary {
  return {
    ultimoLogin: coerceApiDateString(record.ultimo_login) ?? null,
    membroDesde: coerceApiDateString(record.membro_desde) ?? null,
    relatoriosAcessiveis: record.relatorios_acessiveis ?? 0,
    dashboardsAcessiveis: record.dashboards_acessiveis ?? 0,
    relatoriosFavoritos: record.relatorios_favoritos ?? 0,
    dashboardsFavoritos: record.dashboards_favoritos ?? 0,
    relatoriosProprios: record.relatorios_proprios ?? 0,
    regras: record.regras ?? [],
    permissoes: record.permissoes ?? [],
    notificacoesNaoLidas: record.notificacoes_nao_lidas ?? 0,
  }
}
