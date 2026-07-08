export type TipoConexao = 'postgres' | 'mysql' | 'mssql' | 'oracle'

export type Connection = {
  id: number
  nome: string
  tipo: TipoConexao
  host: string
  porta: number
  database: string
  usuario: string
  opcoes?: Record<string, unknown> | null
  usuarioCadastrador?: string
  usuarioAtualizador?: string
  dataCriacao?: string
  dataAtualizacao?: string
}

export type ConnectionEditDraft = {
  nome: string
  tipo: TipoConexao
  host: string
  porta: number
  database: string
  usuario: string
  senha: string
  opcoes: string
}

export type CreateConnectionInput = ConnectionEditDraft

export type UpdateConnectionInput = Partial<ConnectionEditDraft>

export type ConnectionCreateSaveMode = 'list' | 'edit'

export const INITIAL_CONNECTION_CREATE_DRAFT: ConnectionEditDraft = {
  nome: '',
  tipo: 'postgres',
  host: 'localhost',
  porta: 5432,
  database: '',
  usuario: '',
  senha: '',
  opcoes: '',
}

export type ConnectionFieldErrors = {
  nome?: string
  host?: string
  porta?: string
  database?: string
  usuario?: string
  senha?: string
  general?: string
}

export type ConnectionTestResult = {
  sucesso: boolean
  mensagem: string
  tempo_ms?: number
}
