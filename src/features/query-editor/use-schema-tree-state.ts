import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import {
  listConnectionColumns,
  listConnectionSchema,
  listConnectionTables,
} from '@/features/query-editor/query-editor-api'
import { queryKeys } from '@/lib/query-keys'

type ExpandedNodeKey = string

function nodeKey(parts: string[]): string {
  return parts.join('::')
}

export function useSchemaTreeState(
  connectionId: number,
  onRegisterSchemaTables: (escopo: string, tables: string[]) => void,
  onRegisterTableColumns: (escopo: string, tabela: string, columns: string[]) => void,
) {
  const [expandedKeys, setExpandedKeys] = useState<Set<ExpandedNodeKey>>(new Set())
  const [filter, setFilter] = useState('')

  const schemaQuery = useQuery({
    queryKey: queryKeys.connection.schema(connectionId),
    queryFn: () => listConnectionSchema(connectionId),
    enabled: connectionId > 0,
  })

  const expandedScopes = useMemo(
    () =>
      [...expandedKeys]
        .filter((key) => key.startsWith('scope::'))
        .map((key) => key.replace('scope::', '')),
    [expandedKeys],
  )

  const expandedTables = useMemo(
    () =>
      [...expandedKeys]
        .filter((key) => key.startsWith('table::'))
        .map((key) => {
          const [, escopo, tabela] = key.split('::')
          return { escopo, tabela }
        })
        .filter((item): item is { escopo: string; tabela: string } =>
          Boolean(item.escopo && item.tabela),
        ),
    [expandedKeys],
  )

  const tablesQueries = useQuery({
    queryKey: queryKeys.connection.tabelas(connectionId, expandedScopes.join('|')),
    queryFn: async () => {
      const entries = await Promise.all(
        expandedScopes.map(async (escopo) => {
          const tables = await listConnectionTables(connectionId, escopo)
          onRegisterSchemaTables(
            escopo,
            tables.map((table) => table.nome),
          )
          return [escopo, tables] as const
        }),
      )

      return Object.fromEntries(entries)
    },
    enabled: connectionId > 0 && expandedScopes.length > 0,
  })

  const columnsQueries = useQuery({
    queryKey: queryKeys.connection.colunas(
      connectionId,
      expandedTables.map((item) => `${item.escopo}.${item.tabela}`).join('|'),
    ),
    queryFn: async () => {
      const entries = await Promise.all(
        expandedTables.map(async ({ escopo, tabela }) => {
          const columns = await listConnectionColumns(connectionId, escopo, tabela)
          onRegisterTableColumns(
            escopo,
            tabela,
            columns.map((column) => column.nome),
          )
          return [`${escopo}::${tabela}`, columns] as const
        }),
      )

      return Object.fromEntries(entries)
    },
    enabled: connectionId > 0 && expandedTables.length > 0,
  })

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys((current) => {
      const next = new Set(current)

      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
  }, [])

  const isExpanded = useCallback((key: string) => expandedKeys.has(key), [expandedKeys])

  const filteredScopes = useMemo(() => {
    const items = schemaQuery.data ?? []
    const normalizedFilter = filter.trim().toLowerCase()

    if (!normalizedFilter) {
      return items
    }

    return items.filter((item) => item.nome.toLowerCase().includes(normalizedFilter))
  }, [filter, schemaQuery.data])

  return {
    filter,
    setFilter,
    scopes: filteredScopes,
    isLoadingScopes: schemaQuery.isLoading,
    schemaError: schemaQuery.error,
    tablesByScope: tablesQueries.data ?? {},
    columnsByTable: columnsQueries.data ?? {},
    isLoadingTables: tablesQueries.isFetching,
    isLoadingColumns: columnsQueries.isFetching,
    toggleExpanded,
    isExpanded,
    scopeKey: (escopo: string) => nodeKey(['scope', escopo]),
    tableKey: (escopo: string, tabela: string) => nodeKey(['table', escopo, tabela]),
  }
}
