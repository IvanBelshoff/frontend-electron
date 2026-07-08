import type { Connection, TipoConexao } from '@/features/connections/connection-types'

export type ConnectionFilters = {
  tipo: TipoConexao | 'all'
}

export const DEFAULT_CONNECTION_FILTERS: ConnectionFilters = {
  tipo: 'all',
}

export function areConnectionFiltersEqual(a: ConnectionFilters, b: ConnectionFilters): boolean {
  return a.tipo === b.tipo
}

export function hasActiveConnectionFilters(filters: ConnectionFilters): boolean {
  return !areConnectionFiltersEqual(filters, DEFAULT_CONNECTION_FILTERS)
}

export function applyConnectionFilters(
  connections: Connection[],
  search: string,
  filters: ConnectionFilters,
): Connection[] {
  const normalizedSearch = search.trim().toLowerCase()

  return connections.filter((connection) => {
    if (normalizedSearch && !connection.nome.toLowerCase().includes(normalizedSearch)) {
      return false
    }

    if (filters.tipo !== 'all' && connection.tipo !== filters.tipo) {
      return false
    }

    return true
  })
}
