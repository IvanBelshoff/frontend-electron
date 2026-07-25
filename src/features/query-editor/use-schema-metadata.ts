import { useCallback, useRef, type MutableRefObject } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  listConnectionColumns,
  listConnectionTables,
} from '@/features/query-editor/query-editor-api'
import { queryKeys } from '@/lib/query-keys'

const SCHEMA_METADATA_STALE_MS = 5 * 60_000
const METADATA_DEBOUNCE_MS = 300

type UseSchemaMetadataOptions = {
  connectionId: number
  registerSchemaTables: (escopo: string, tables: string[]) => void
  registerTableColumns: (escopo: string, tabela: string, columns: string[]) => void
}

function debounceByKey<T>(
  key: string,
  timers: MutableRefObject<Map<string, ReturnType<typeof setTimeout>>>,
  fn: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const existing = timers.current.get(key)

    if (existing) {
      clearTimeout(existing)
    }

    const timer = setTimeout(() => {
      timers.current.delete(key)
      fn().then(resolve).catch(reject)
    }, METADATA_DEBOUNCE_MS)

    timers.current.set(key, timer)
  })
}

export function useSchemaMetadata({
  connectionId,
  registerSchemaTables,
  registerTableColumns,
}: UseSchemaMetadataOptions) {
  const queryClient = useQueryClient()
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const ensureSchemaTables = useCallback(
    (escopo: string) => {
      if (connectionId <= 0 || !escopo.trim()) {
        return Promise.resolve([] as string[])
      }

      const key = `tables:${connectionId}:${escopo}`

      return debounceByKey(key, debounceTimersRef, () =>
        queryClient.fetchQuery({
          queryKey: queryKeys.connection.tabelas(connectionId, escopo),
          queryFn: async () => {
            const tables = await listConnectionTables(connectionId, escopo)
            const names = tables.map((table) => table.nome)
            registerSchemaTables(escopo, names)
            return names
          },
          staleTime: SCHEMA_METADATA_STALE_MS,
        }),
      )
    },
    [connectionId, queryClient, registerSchemaTables],
  )

  const ensureTableColumns = useCallback(
    (escopo: string, tabela: string) => {
      if (connectionId <= 0 || !escopo.trim() || !tabela.trim()) {
        return Promise.resolve([] as string[])
      }

      const key = `columns:${connectionId}:${escopo}.${tabela}`

      return debounceByKey(key, debounceTimersRef, () =>
        queryClient.fetchQuery({
          queryKey: queryKeys.connection.colunas(connectionId, `${escopo}.${tabela}`),
          queryFn: async () => {
            const columns = await listConnectionColumns(connectionId, escopo, tabela)
            const names = columns.map((column) => column.nome)
            registerTableColumns(escopo, tabela, names)
            return names
          },
          staleTime: SCHEMA_METADATA_STALE_MS,
        }),
      )
    },
    [connectionId, queryClient, registerTableColumns],
  )

  return {
    ensureSchemaTables,
    ensureTableColumns,
  }
}
