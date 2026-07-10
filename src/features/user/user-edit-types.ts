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

export type UserPasswordDraft = {
  senha: string
  confirmarSenha: string
}

export type UserPasswordFieldErrors = {
  senha?: string
  confirmarSenha?: string
  general?: string
}

export const EMPTY_USER_PASSWORD_DRAFT: UserPasswordDraft = {
  senha: '',
  confirmarSenha: '',
}
