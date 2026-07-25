import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/features/auth/auth-types'
import { formatReportParamDefaults } from '@/features/reports/format-report-param-defaults'
import type { ParametroRelatorio } from '@/features/reports/report-types'
import {
  consultarConexao,
  contarConsulta,
} from '@/features/query-editor/query-editor-api'
import {
  clampFetchLimit,
  loadPersistedFetchLimit,
  savePersistedFetchLimit,
} from '@/features/query-editor/query-editor-fetch.utils'
import type {
  QueryCountResult,
  QueryEditorSession,
  QueryPreviewResult,
  SchemaCompletionContext,
} from '@/features/query-editor/query-editor-types'
import { useSchemaMetadata } from '@/features/query-editor/use-schema-metadata'

export function useQueryEditorState(session: QueryEditorSession) {
  const [query, setQuery] = useState(session.query)
  const [parametros, setParametros] = useState(session.parametros)
  const [paramValues, setParamValues] = useState(() =>
    formatReportParamDefaults(session.parametros),
  )
  const [previewResult, setPreviewResult] = useState<QueryPreviewResult | null>(null)
  const [countResult, setCountResult] = useState<QueryCountResult | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [countError, setCountError] = useState<string | null>(null)
  const [schemaContext, setSchemaContext] = useState<SchemaCompletionContext>({
    schemas: {},
    columnsByTable: {},
  })

  const previewQueryKeyRef = useRef('')
  const previewFetchLimitRef = useRef(loadPersistedFetchLimit())

  const [fetchLimit, setFetchLimitState] = useState(() => loadPersistedFetchLimit())

  useEffect(() => {
    savePersistedFetchLimit(fetchLimit)
  }, [fetchLimit])

  const registerSchemaTables = useCallback((escopo: string, tables: string[]) => {
    setSchemaContext((current) => ({
      ...current,
      schemas: {
        ...current.schemas,
        [escopo]: tables,
      },
    }))
  }, [])

  const registerTableColumns = useCallback(
    (escopo: string, tabela: string, columns: string[]) => {
      const qualifiedKey = `${escopo}.${tabela}`
      setSchemaContext((current) => ({
        ...current,
        columnsByTable: {
          ...current.columnsByTable,
          [qualifiedKey]: columns,
          [tabela]: columns,
        },
      }))
    },
    [],
  )

  const { ensureSchemaTables, ensureTableColumns } = useSchemaMetadata({
    connectionId: session.idConexao,
    registerSchemaTables,
    registerTableColumns,
  })

  const executeMutation = useMutation({
    mutationFn: () =>
      consultarConexao(session.idConexao, {
        query,
        parametros: paramValues,
        parametrosSchema: parametros,
        limite: fetchLimit,
      }),
    onMutate: () => {
      setExecutionError(null)
      setCountError(null)
      setCountResult(null)
    },
    onSuccess: (result) => {
      setPreviewResult(result)
      setExecutionError(null)
      previewQueryKeyRef.current = query
      previewFetchLimitRef.current = fetchLimit
    },
    onError: (error) => {
      setPreviewResult(null)
      setExecutionError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível executar a consulta.',
      )
    },
  })

  const countMutation = useMutation({
    mutationFn: () =>
      contarConsulta(session.idConexao, {
        query,
        parametros: paramValues,
        parametrosSchema: parametros,
      }),
    onMutate: () => {
      setCountError(null)
    },
    onSuccess: (result) => {
      setCountResult(result)
      setCountError(null)
    },
    onError: (error) => {
      setCountResult(null)
      setCountError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível contar os registros.',
      )
    },
  })

  const executePreview = useCallback(() => {
    void executeMutation.mutateAsync()
  }, [executeMutation])

  const countRows = useCallback(() => {
    void countMutation.mutateAsync()
  }, [countMutation])

  const clearResults = useCallback(() => {
    setPreviewResult(null)
    setCountResult(null)
    setCountError(null)
    previewQueryKeyRef.current = ''
    previewFetchLimitRef.current = fetchLimit
  }, [fetchLimit])

  const setFetchLimit = useCallback((value: number) => {
    setFetchLimitState(clampFetchLimit(value))
    setCountResult(null)
    setCountError(null)
  }, [])

  const updateParametro = useCallback((nome: string, value: unknown) => {
    setParamValues((current) => ({ ...current, [nome]: value }))
  }, [])

  const setAllParametros = useCallback((values: Record<string, unknown>) => {
    setParamValues(values)
  }, [])

  const updateParametrosSchema = useCallback((next: ParametroRelatorio[]) => {
    setParametros(next)
    setParamValues(formatReportParamDefaults(next))
  }, [])

  const hasLoadedData = previewResult !== null
  const isQueryStaleForCount =
    previewQueryKeyRef.current !== query ||
    previewFetchLimitRef.current !== fetchLimit

  const effectiveCountResult = useMemo(() => {
    if (isQueryStaleForCount) {
      return null
    }

    return countResult
  }, [countResult, isQueryStaleForCount])

  return {
    query,
    setQuery,
    parametros,
    updateParametrosSchema,
    paramValues,
    setAllParametros,
    updateParametro,
    previewResult,
    countResult: effectiveCountResult,
    executionError,
    countError,
    hasLoadedData,
    isExecuting: executeMutation.isPending,
    isCounting: countMutation.isPending,
    executePreview,
    countRows,
    clearResults,
    fetchLimit,
    setFetchLimit,
    schemaContext,
    registerSchemaTables,
    registerTableColumns,
    ensureSchemaTables,
    ensureTableColumns,
    connectionId: session.idConexao,
    connectionTipo: session.connectionTipo ?? null,
  }
}
