import type { UserPhoto } from './user-types'

export type UserViewMode = 'grid' | 'table'

export type ManagedUserPermissionLink = {
  nome: string
  regraNome?: string
}

export type ManagedUser = {
  id: number
  nome: string
  sobrenome: string
  email: string
  bloqueado: boolean
  ultimoLogin: string | null
  dataCriacao: string | null
  dataAtualizacao: string | null
  usuarioCadastrador: string | null
  usuarioAtualizador: string | null
  regras: string[]
  permissoes: string[]
  permissoesDetalhadas: ManagedUserPermissionLink[]
  foto: UserPhoto | null
}

export type ManagedUserApiRecord = {
  id: number | string
  nome: string
  sobrenome: string
  email: string
  bloqueado: boolean
  ultimo_login?: string | null
  data_criacao?: string | null
  data_atualizacao?: string | null
  usuario_cadastrador?: string | null
  usuario_atualizador?: string | null
  regra?: Array<{ id: number | string; nome: string }>
  permissao?: Array<{
    id: number | string
    nome: string
    regra?: { id?: number | string; nome?: string } | null
  }>
  foto?: {
    id: number | string
    nome?: string
    local?: string
    tipo?: string
    type?: string
  } | null
}

export function getUserDisplayName(user: Pick<ManagedUser, 'nome' | 'sobrenome'>): string {
  return `${user.nome} ${user.sobrenome}`.trim()
}
