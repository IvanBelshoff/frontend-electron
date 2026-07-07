export type UserPermissionOption = {
  id: number
  nome: string
  regraId: number
  regraNome: string
  descricao?: string
}

export type UserRuleOption = {
  id: number
  nome: string
  descricao?: string
  permissoes: UserPermissionOption[]
}

export type UserPermissionsSelection = {
  ruleIds: number[]
  permissionIds: number[]
}

export type UpdateUserAuthenticationInput = {
  regras: number[]
  permissoes: number[]
}

export type RoleCatalogApiRecord = {
  id: number | string
  nome: string
  descricao?: string | null
  permissao?: Array<{
    id: number | string
    nome: string
    descricao?: string | null
  }>
}
