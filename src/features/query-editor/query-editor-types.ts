import type { ParametroRelatorio } from '@/features/reports/report-types'
import type { TipoConexao } from '@/features/connections/connection-types'

export type SchemaNodeTipo = 'database' | 'schema'

export type TableNodeTipo = 'table' | 'view'

export type SchemaNodeItem = {
  nome: string
  tipo: SchemaNodeTipo
}

export type TableNodeItem = {
  nome: string
  tipo: TableNodeTipo
}

export type ColumnNodeItem = {
  nome: string
  tipoDado: string
  nullable?: boolean
}

export type QueryPreviewResult = {
  colunas: string[]
  dados: Record<string, unknown>[]
  totalLinhas: number
  truncado: boolean
  tempoMs: number
}

export type QueryCountResult = {
  totalLinhas: number
  tempoMs: number
}

export type QueryEditorSession = {
  query: string
  idConexao: number
  connectionTipo?: TipoConexao | null
  parametros: ParametroRelatorio[]
  returnPath: string
  relatorioId?: number
}

export type QueryEditorApplyResult = {
  query: string
  parametros?: ParametroRelatorio[]
}

export type SchemaCompletionContext = {
  schemas: Record<string, string[]>
  columnsByTable: Record<string, string[]>
}
