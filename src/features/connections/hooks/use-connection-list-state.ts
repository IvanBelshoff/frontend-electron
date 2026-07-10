import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { hasPermission } from '@/features/auth/rbac'
import { CONNECTION_RBAC } from '@/features/auth/rbac-requirements'
import { useRbac } from '@/features/auth/use-rbac'
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
  const rbac = useRbac()
  const canCreate = hasPermission(rbac, CONNECTION_RBAC.create)
  const canEdit = hasPermission(rbac, CONNECTION_RBAC.update)
  const canDelete = hasPermission(rbac, CONNECTION_RBAC.delete)
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
    if (!canCreate) return
    void navigate({ to: '/conexoes/nova' })
  }, [canCreate, navigate])

  const handleEdit = useCallback(
    (connection: Connection) => {
      if (!canEdit) return
      void navigate({
        to: '/conexoes/$conexaoId/editar',
        params: { conexaoId: String(connection.id) },
      })
    },
    [canEdit, navigate],
  )

  return {
    connections,
    filteredConnections,
    totalCount,
    filteredCount,
    canCreate,
    canEdit,
    canDelete,
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
