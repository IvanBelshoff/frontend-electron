import type { ParametroRelatorio } from '@/features/reports/report-types'
import type {
  ColumnNodeItem,
  QueryCountResult,
  QueryPreviewResult,
  SchemaNodeItem,
  TableNodeItem,
} from '@/features/query-editor/query-editor-types'
import { apiRequest } from '@/lib/api-client'

type QueryPreviewApiRecord = {
  colunas: string[]
  dados: Record<string, unknown>[]
  total_linhas: number
  truncado: boolean
  tempo_ms: number
}

type QueryCountApiRecord = {
  total_linhas: number
  tempo_ms: number
}

type SchemaListApiRecord = {
  items: Array<{ nome: string; tipo: string }>
}

type TableListApiRecord = {
  items: Array<{ nome: string; tipo: string }>
}

type ColumnListApiRecord = {
  items: Array<{ nome: string; tipo_dado: string; nullable?: boolean }>
}

export type ConsultarConexaoParams = {
  query: string
  parametros?: Record<string, unknown>
  parametrosSchema?: ParametroRelatorio[]
  limite?: number
}

export type ContarConsultaParams = {
  query: string
  parametros?: Record<string, unknown>
  parametrosSchema?: ParametroRelatorio[]
}

function mapPreviewFromApi(record: QueryPreviewApiRecord): QueryPreviewResult {
  return {
    colunas: record.colunas,
    dados: record.dados,
    totalLinhas: record.total_linhas,
    truncado: record.truncado,
    tempoMs: record.tempo_ms,
  }
}

function mapCountFromApi(record: QueryCountApiRecord): QueryCountResult {
  return {
    totalLinhas: record.total_linhas,
    tempoMs: record.tempo_ms,
  }
}

function mapSchemaItems(items: SchemaListApiRecord['items']): SchemaNodeItem[] {
  return items.map((item) => ({
    nome: item.nome,
    tipo: item.tipo === 'database' ? 'database' : 'schema',
  }))
}

function mapTableItems(items: TableListApiRecord['items']): TableNodeItem[] {
  return items.map((item) => ({
    nome: item.nome,
    tipo: item.tipo === 'view' ? 'view' : 'table',
  }))
}

function mapColumnItems(items: ColumnListApiRecord['items']): ColumnNodeItem[] {
  return items.map((item) => ({
    nome: item.nome,
    tipoDado: item.tipo_dado,
    nullable: item.nullable,
  }))
}

export async function consultarConexao(
  connectionId: number,
  params: ConsultarConexaoParams,
): Promise<QueryPreviewResult> {
  const data = await apiRequest<QueryPreviewApiRecord>(`/conexoes/${connectionId}/consultar`, {
    method: 'POST',
    body: {
      query: params.query,
      parametros: params.parametros ?? {},
      parametros_schema: params.parametrosSchema,
      limite: params.limite,
    },
  })

  return mapPreviewFromApi(data)
}

export async function contarConsulta(
  connectionId: number,
  params: ContarConsultaParams,
): Promise<QueryCountResult> {
  const data = await apiRequest<QueryCountApiRecord>(
    `/conexoes/${connectionId}/consultar/contar`,
    {
      method: 'POST',
      body: {
        query: params.query,
        parametros: params.parametros ?? {},
        parametros_schema: params.parametrosSchema,
      },
    },
  )

  return mapCountFromApi(data)
}

export async function listConnectionSchema(connectionId: number): Promise<SchemaNodeItem[]> {
  const data = await apiRequest<SchemaListApiRecord>(`/conexoes/${connectionId}/schema`)
  return mapSchemaItems(data.items)
}

export async function listConnectionTables(
  connectionId: number,
  escopo: string,
): Promise<TableNodeItem[]> {
  const data = await apiRequest<TableListApiRecord>(
    `/conexoes/${connectionId}/schema/${encodeURIComponent(escopo)}/tabelas`,
  )
  return mapTableItems(data.items)
}

export async function listConnectionColumns(
  connectionId: number,
  escopo: string,
  tabela: string,
): Promise<ColumnNodeItem[]> {
  const data = await apiRequest<ColumnListApiRecord>(
    `/conexoes/${connectionId}/schema/${encodeURIComponent(escopo)}/tabelas/${encodeURIComponent(tabela)}/colunas`,
  )
  return mapColumnItems(data.items)
}
