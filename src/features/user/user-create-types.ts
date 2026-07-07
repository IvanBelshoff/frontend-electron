export type UserCreateDraft = {
  nome: string
  sobrenome: string
  email: string
  senha: string
  confirmarSenha: string
  copyPermissionsFromId: number | null
  copyDashboardsFromId: number | null
}

export type UserCreateSaveMode = 'list' | 'edit'

export type UserCreateFieldErrors = {
  nome?: string
  sobrenome?: string
  email?: string
  senha?: string
  confirmarSenha?: string
  general?: string
}

export type UserSummaryOption = {
  id: number
  nome: string
}

export const INITIAL_USER_CREATE_DRAFT: UserCreateDraft = {
  nome: '',
  sobrenome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  copyPermissionsFromId: null,
  copyDashboardsFromId: null,
}

export type CreateUserInput = {
  nome: string
  sobrenome: string
  email: string
  senha: string
  photo?: Blob
}
