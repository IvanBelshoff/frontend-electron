import type {
  AccessReport,
  UserReportAccessLists,
  UserReportAccessListsApiRecord,
} from '@/features/user/user-report-access-types'

function mapAccessReportFromApi(
  record: NonNullable<UserReportAccessListsApiRecord['relatorios']>[number],
): AccessReport | null {
  const id = Number(record.id)
  const nome =
    typeof record.nome === 'string' && record.nome.trim().length > 0
      ? record.nome.trim()
      : 'Relatório sem nome'
  const icone =
    typeof record.icone === 'string' && record.icone.trim().length > 0
      ? record.icone.trim()
      : 'table_chart'
  const rawOwnerId = record.id_proprietario ?? record.idProprietario
  const ownerId = Number(rawOwnerId)

  if (!Number.isFinite(id)) {
    return null
  }

  return {
    id,
    nome,
    icone,
    ...(Number.isFinite(ownerId) && ownerId > 0 ? { idProprietario: ownerId } : {}),
    permitirConhecimentoIa:
      record.permitirConhecimentoIa ?? record.permitir_conhecimento_ia ?? false,
  }
}

export function mapUserReportAccessListsFromApi(
  record: UserReportAccessListsApiRecord,
): UserReportAccessLists {
  const relatorios = (record.relatorios ?? [])
    .map(mapAccessReportFromApi)
    .filter((report): report is AccessReport => report !== null)

  const relatoriosDisponiveis = (record.relatoriosDisponiveis ?? [])
    .map(mapAccessReportFromApi)
    .filter((report): report is AccessReport => report !== null)

  return {
    relatorios,
    relatoriosDisponiveis,
  }
}
