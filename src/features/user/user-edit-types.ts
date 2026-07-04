export type UserEditTab = 'user' | 'permissions' | 'access'

export type UserEditDraft = {
  nome: string
  sobrenome: string
  email: string
  bloqueado: boolean
}

export type UserDeleteTarget = {
  id: number
  displayName: string
}
