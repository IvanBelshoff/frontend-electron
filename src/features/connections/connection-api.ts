import {
  mapConnectionFromApi,
  mapConnectionListFromApi,
  mapConnectionToCreateApi,
  mapConnectionToUpdateApi,
  type ConnectionApiRecord,
} from '@/features/connections/connection-mapper'
import type {
  Connection,
  ConnectionTestResult,
  CreateConnectionInput,
  TipoConexao,
  UpdateConnectionInput,
} from '@/features/connections/connection-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'

export type ListConnectionsParams = {
  page?: number
  limit?: number
  nome?: string
  tipo?: TipoConexao
}

export type ListConnectionsResult = {
  items: Connection[]
  totalCount: number
}

function buildConnectionsQuery(params: ListConnectionsParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 100))

  if (params.nome) {
    searchParams.set('nome', params.nome)
  }

  if (params.tipo) {
    searchParams.set('tipo', params.tipo)
  }

  return searchParams.toString()
}

function parseTotalCount(headerValue: string | null): number {
  if (!headerValue) {
    return 0
  }

  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function listConnections(
  params: ListConnectionsParams = {},
): Promise<ListConnectionsResult> {
  const query = buildConnectionsQuery(params)
  const { data, response } = await apiRequestWithResponse<ConnectionApiRecord[]>(
    `/conexoes?${query}`,
  )

  return {
    items: mapConnectionListFromApi(data),
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}

export async function getConnection(id: number): Promise<Connection> {
  const data = await apiRequest<ConnectionApiRecord>(`/conexoes/${id}`)
  return mapConnectionFromApi(data)
}

export async function createConnection(input: CreateConnectionInput): Promise<Connection> {
  const data = await apiRequest<ConnectionApiRecord>('/conexoes', {
    method: 'POST',
    body: mapConnectionToCreateApi(input),
  })

  return mapConnectionFromApi(data)
}

export async function updateConnection(
  id: number,
  input: UpdateConnectionInput,
): Promise<Connection> {
  const data = await apiRequest<ConnectionApiRecord>(`/conexoes/${id}`, {
    method: 'PATCH',
    body: mapConnectionToUpdateApi(input),
  })

  return mapConnectionFromApi(data)
}

export async function deleteConnection(id: number): Promise<void> {
  await apiRequest<void>(`/conexoes/${id}`, { method: 'DELETE' })
}

export async function testConnection(id: number): Promise<ConnectionTestResult> {
  const data = await apiRequest<{ ok?: boolean }>(`/conexoes/${id}/testar`, {
    method: 'POST',
  })

  return {
    sucesso: Boolean(data.ok),
    mensagem: data.ok
      ? 'Conexão estabelecida com sucesso.'
      : 'Falha ao testar conexão.',
  }
}
