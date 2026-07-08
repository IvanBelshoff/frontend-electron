import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { listConnections } from '@/features/connections/connection-api'
import {
  applyConnectionFilters,
  DEFAULT_CONNECTION_FILTERS,
  type ConnectionFilters,
} from '@/features/connections/connection-filters'
import type { Connection } from '@/features/connections/connection-types'
import { queryKeys } from '@/lib/query-keys'

const CONNECTIONS_FETCH_LIMIT = 100

export function useConnectionListState() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ConnectionFilters>(DEFAULT_CONNECTION_FILTERS)

  const connectionsQuery = useQuery({
    queryKey: queryKeys.connection.list({ limit: CONNECTIONS_FETCH_LIMIT }),
    queryFn: () => listConnections({ page: 1, limit: CONNECTIONS_FETCH_LIMIT }),
  })

  const connections = connectionsQuery.data?.items ?? []
  const totalCount = connectionsQuery.data?.totalCount ?? 0

  const filteredConnections = useMemo(
    () => applyConnectionFilters(connections, search, filters),
    [connections, search, filters],
  )

  const filteredCount = filteredConnections.length

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_CONNECTION_FILTERS)
    setSearch('')
  }, [])

  const refresh = useCallback(async () => {
    await connectionsQuery.refetch()
  }, [connectionsQuery])

  const handleCreate = useCallback(() => {
    void navigate({ to: '/conexoes/nova' })
  }, [navigate])

  const handleEdit = useCallback(
    (connection: Connection) => {
      void navigate({
        to: '/conexoes/$conexaoId/editar',
        params: { conexaoId: String(connection.id) },
      })
    },
    [navigate],
  )

  return {
    connections,
    filteredConnections,
    totalCount,
    filteredCount,
    search,
    setSearch,
    filters,
    setFilters,
    clearFilters,
    isLoading: connectionsQuery.isLoading,
    isError: connectionsQuery.isError,
    error: connectionsQuery.error,
    isRefreshing: connectionsQuery.isFetching && !connectionsQuery.isLoading,
    refresh,
    handleCreate,
    handleEdit,
  }
}
