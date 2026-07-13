import { coerceApiDateString } from '@/lib/datetime'
import type {
  Connection,
  ConnectionEditDraft,
  CreateConnectionInput,
  TipoConexao,
  UpdateConnectionInput,
} from '@/features/connections/connection-types'

export type ConnectionApiRecord = {
  id: number | string
  nome: string
  tipo: TipoConexao
  host: string
  porta: number
  database: string
  usuario: string
  opcoes?: Record<string, unknown> | null
  usuario_cadastrador?: string | null
  usuario_atualizador?: string | null
  data_criacao?: string | null
  data_atualizacao?: string | null
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  return String(value)
}

function normalizeTipoConexao(value: unknown): TipoConexao {
  if (value === 'mysql' || value === 'mssql' || value === 'oracle') {
    return value
  }

  return 'postgres'
}

function parseOpcoesString(value: Record<string, unknown> | null | undefined): string {
  if (!value || Object.keys(value).length === 0) {
    return ''
  }

  return JSON.stringify(value, null, 2)
}

function parseOpcoesJson(value: string): Record<string, unknown> | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  return JSON.parse(trimmed) as Record<string, unknown>
}

export function mapConnectionFromApi(record: ConnectionApiRecord): Connection {
  return {
    id: Number(record.id),
    nome: record.nome,
    tipo: normalizeTipoConexao(record.tipo),
    host: record.host,
    porta: Number(record.porta),
    database: record.database,
    usuario: record.usuario,
    opcoes: record.opcoes ?? null,
    usuarioCadastrador: normalizeOptionalString(record.usuario_cadastrador),
    usuarioAtualizador: normalizeOptionalString(record.usuario_atualizador),
    dataCriacao: coerceApiDateString(record.data_criacao),
    dataAtualizacao: coerceApiDateString(record.data_atualizacao),
  }
}

export function mapConnectionListFromApi(records: ConnectionApiRecord[]): Connection[] {
  return records.map(mapConnectionFromApi)
}

export function mapConnectionToEditDraft(connection: Connection): ConnectionEditDraft {
  return {
    nome: connection.nome,
    tipo: connection.tipo,
    host: connection.host,
    porta: connection.porta,
    database: connection.database,
    usuario: connection.usuario,
    senha: '',
    opcoes: parseOpcoesString(connection.opcoes),
  }
}

function mapConnectionDraftToApi(
  input: ConnectionEditDraft,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    nome: input.nome.trim(),
    tipo: input.tipo,
    host: input.host.trim(),
    porta: input.porta,
    database: input.database.trim(),
    usuario: input.usuario.trim(),
  }

  if (input.senha.trim()) {
    body.senha = input.senha
  }

  const opcoes = parseOpcoesJson(input.opcoes)
  if (opcoes !== undefined) {
    body.opcoes = opcoes
  }

  return body
}

export function mapConnectionToCreateApi(
  input: CreateConnectionInput,
): Record<string, unknown> {
  const body = mapConnectionDraftToApi(input)
  body.senha = input.senha
  return body
}

export function mapConnectionToUpdateApi(
  input: UpdateConnectionInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (input.nome !== undefined) body.nome = input.nome.trim()
  if (input.tipo !== undefined) body.tipo = input.tipo
  if (input.host !== undefined) body.host = input.host.trim()
  if (input.porta !== undefined) body.porta = input.porta
  if (input.database !== undefined) body.database = input.database.trim()
  if (input.usuario !== undefined) body.usuario = input.usuario.trim()
  if (input.senha !== undefined && input.senha.trim()) {
    body.senha = input.senha
  }

  if (input.opcoes !== undefined) {
    const trimmed = input.opcoes.trim()
    body.opcoes = trimmed ? (JSON.parse(trimmed) as Record<string, unknown>) : null
  }

  return body
}

export function areConnectionDraftsEqual(
  a: ConnectionEditDraft,
  b: ConnectionEditDraft,
): boolean {
  return (
    a.nome === b.nome &&
    a.tipo === b.tipo &&
    a.host === b.host &&
    a.porta === b.porta &&
    a.database === b.database &&
    a.usuario === b.usuario &&
    a.senha === b.senha &&
    a.opcoes === b.opcoes
  )
}
