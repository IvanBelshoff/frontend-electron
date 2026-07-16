export type UserPhoto = {
  id: number
  nome?: string
  local?: string
  type?: string
}

export type UserDetail = {
  id: number
  nome: string
  sobrenome: string
  email: string
  bloqueado: boolean
  foto?: UserPhoto | null
}

export type AccessUser = {
  id: number
  nome: string
  sobrenome: string
  foto?: UserPhoto | null
  permitirConhecimentoIa?: boolean
}

export type DashboardAccessLists = {
  usuarios: AccessUser[]
  usuariosDisponiveis: AccessUser[]
}

export type AccessUserApiRecord = {
  id: number | string
  nome: string
  sobrenome: string
  foto?: UserPhoto | null
  permitir_conhecimento_ia?: boolean
  permitirConhecimentoIa?: boolean
}

export type DashboardAccessListsApiRecord = {
  usuarios: AccessUserApiRecord[]
  usuariosDisponiveis: AccessUserApiRecord[]
}
