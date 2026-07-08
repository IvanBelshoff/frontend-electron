export type AccessReport = {
  id: number
  nome: string
  icone: string
  idProprietario?: number
}

export type UserReportAccessLists = {
  relatorios: AccessReport[]
  relatoriosDisponiveis: AccessReport[]
}

export type UserReportAccessListsApiRecord = {
  relatorios?: Array<{
    id: number | string
    nome: string
    icone?: string | null
    id_proprietario?: number | string | null
    idProprietario?: number | string | null
  }>
  relatoriosDisponiveis?: Array<{
    id: number | string
    nome: string
    icone?: string | null
    id_proprietario?: number | string | null
    idProprietario?: number | string | null
  }>
}
