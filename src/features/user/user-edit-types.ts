export type UserEditTab = 'user' | 'permissions' | 'access'

export type UserEditDraft = {
  nome: string
  sobrenome: string
  email: string
  bloqueado: boolean
}

export type UserFieldErrors = {
  nome?: string
  sobrenome?: string
  email?: string
  senha?: string
  general?: string
}

export type UpdateUserInput = UserEditDraft

export type UserDeleteTarget = {
  id: number
  displayName: string
}
