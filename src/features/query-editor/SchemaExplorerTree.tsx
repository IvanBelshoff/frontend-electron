import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import IconButton from '@/components/ui/IconButton'
import { getConnection } from '@/features/connections/connection-api'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { TableNodeItem } from '@/features/query-editor/query-editor-types'
import SchemaExplorerDraggableItem from '@/features/query-editor/SchemaExplorerDraggableItem'
import {
  getSchemaColumnDraggableId,
  getSchemaTableDraggableId,
  type SchemaColumnDragData,
  type SchemaTableDragData,
} from '@/features/query-editor/query-editor-dnd.utils'
import {
  COLUMN_REFERENCE_TEXT_CLASS,
  isColumnReferenced,
  isSchemaReferencedInExplorer,
  isTableReferenced,
  parseSqlReferencedIdentifiers,
  SCHEMA_REFERENCE_TEXT_CLASS,
  TABLE_REFERENCE_TEXT_CLASS,
} from '@/features/query-editor/sql-referenced-identifiers'
import { useSchemaTreeState } from '@/features/query-editor/use-schema-tree-state'
import { queryKeys } from '@/lib/query-keys'

const INSERT_HINT = 'Arraste para o editor ou duplo clique para inserir'

type SchemaExplorerTreeProps = {
  connectionId: number
  query: string
  onRegisterSchemaTables: (escopo: string, tables: string[]) => void
  onRegisterTableColumns: (escopo: string, tabela: string, columns: string[]) => void
  onInsertTable: (escopo: string, tabela: string) => void
  onInsertColumn: (columnName: string) => void
  onCollapse?: () => void
}

export default function SchemaExplorerTree({
  connectionId,
  query,
  onRegisterSchemaTables,
  onRegisterTableColumns,
  onInsertTable,
  onInsertColumn,
  onCollapse,
}: SchemaExplorerTreeProps) {
  const connectionQuery = useQuery({
    queryKey: queryKeys.connection.detail(connectionId),
    queryFn: () => getConnection(connectionId),
  })

  const connectionLabel = useMemo(() => {
    if (connectionQuery.isLoading) {
      return 'Carregando conexão...'
    }

    if (!connectionQuery.data) {
      return 'Conexão indisponível'
    }

    return `${connectionQuery.data.nome} (${connectionQuery.data.tipo})`
  }, [connectionQuery.data, connectionQuery.isLoading])

  const referencedIdentifiers = useMemo(
    () => parseSqlReferencedIdentifiers(query),
    [query],
  )

  const shouldPrefetchScopeTables = referencedIdentifiers.unqualifiedTables.size > 0

  const {
    filter,
    setFilter,
    scopes,
    isLoadingScopes,
    tablesByScope,
    tableNamesByScope,
    columnsByTable,
    isLoadingTables,
    isLoadingColumns,
    toggleExpanded,
    isExpanded,
    scopeKey,
    tableKey,
  } = useSchemaTreeState(
    connectionId,
    onRegisterSchemaTables,
    onRegisterTableColumns,
    shouldPrefetchScopeTables,
  )

  const handleInsertTable = useCallback(
    (escopo: string, tabela: string) => {
      onInsertTable(escopo, tabela)
    },
    [onInsertTable],
  )

  const handleInsertColumn = useCallback(
    (columnName: string) => {
      onInsertColumn(columnName)
    },
    [onInsertColumn],
  )

  return (
    <div className="flex h-full min-h-0 flex-col rounded-md border border-vscode-border bg-vscode-sidebar/40">
      <div className="border-b border-vscode-border px-3 py-2">
        <div className="mb-2 flex min-w-0 items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-vscode-text-muted">
              Conexão
            </p>
            <p
              className="truncate text-xs text-vscode-text"
              title={connectionQuery.data ? connectionLabel : undefined}
            >
              {connectionLabel}
            </p>
          </div>
          {onCollapse ? (
            <IconButton
              icon={<DashboardMaterialIcon name="chevron_left" className="text-[1.05rem]" />}
              label="Recolher explorador de schema"
              onClick={onCollapse}
              className="h-7 w-7 shrink-0 rounded-md text-vscode-text-muted hover:text-vscode-text"
            />
          ) : null}
        </div>

        <div className="border-t border-vscode-border pt-2">
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrar schema..."
            className="w-full rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-xs text-vscode-text placeholder:text-vscode-text-muted focus:outline-none focus:ring-2 focus:ring-vscode-accent/30"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 text-sm">
        {isLoadingScopes && (
          <p className="px-2 py-3 text-xs text-vscode-text-muted">Carregando schemas...</p>
        )}

        {!isLoadingScopes && scopes.length === 0 && (
          <p className="px-2 py-3 text-xs text-vscode-text-muted">Nenhum schema encontrado.</p>
        )}

        <ul className="space-y-1">
          {scopes.map((scope) => {
            const scopeNodeKey = scopeKey(scope.nome)
            const expanded = isExpanded(scopeNodeKey)
            const tables = (tablesByScope[scope.nome] ?? []) as TableNodeItem[]
            const scopeReferenced = isSchemaReferencedInExplorer(
              referencedIdentifiers,
              scope.nome,
              tableNamesByScope[scope.nome] ?? [],
            )

            return (
              <li key={scope.nome}>
                <button
                  type="button"
                  onClick={() => toggleExpanded(scopeNodeKey)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-vscode-bg/50"
                >
                  <span className="text-vscode-text-muted">{expanded ? '▾' : '▸'}</span>
                  <span
                    className={clsx(
                      'truncate',
                      scopeReferenced ? SCHEMA_REFERENCE_TEXT_CLASS : 'font-medium text-vscode-text',
                    )}
                  >
                    {scope.nome}
                  </span>
                  <span className="ml-auto text-[10px] uppercase text-vscode-text-muted">
                    {scope.tipo}
                  </span>
                </button>

                {expanded && (
                  <ul className="ml-4 border-l border-vscode-border/60 pl-2">
                    {isLoadingTables && tables.length === 0 && (
                      <li className="px-2 py-1 text-xs text-vscode-text-muted">
                        Carregando tabelas...
                      </li>
                    )}

                    {tables.map((table) => {
                      const tableNodeKey = tableKey(scope.nome, table.nome)
                      const tableExpanded = isExpanded(tableNodeKey)
                      const columns =
                        columnsByTable[`${scope.nome}::${table.nome}`] ?? []
                      const tableReferenced = isTableReferenced(
                        referencedIdentifiers,
                        scope.nome,
                        table.nome,
                      )

                      return (
                        <li key={table.nome}>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(tableNodeKey)}
                              className="rounded px-1 text-vscode-text-muted hover:bg-vscode-bg/50"
                            >
                              {tableExpanded ? '▾' : '▸'}
                            </button>
                            <SchemaExplorerDraggableItem
                              id={getSchemaTableDraggableId(scope.nome, table.nome)}
                              data={
                                {
                                  type: 'schema-table',
                                  escopo: scope.nome,
                                  tabela: table.nome,
                                  qualifiedName: `${scope.nome}.${table.nome}`,
                                } satisfies SchemaTableDragData
                              }
                              className="min-w-0 flex-1"
                            >
                              <button
                                type="button"
                                onDoubleClick={() =>
                                  handleInsertTable(scope.nome, table.nome)
                                }
                                className={clsx(
                                  'w-full cursor-inherit truncate rounded px-1 py-1 text-left hover:bg-vscode-bg/50',
                                  tableReferenced
                                    ? TABLE_REFERENCE_TEXT_CLASS
                                    : table.tipo === 'view'
                                      ? 'text-vscode-accent/70'
                                      : 'text-vscode-text',
                                )}
                                title={INSERT_HINT}
                              >
                                {table.nome}
                              </button>
                            </SchemaExplorerDraggableItem>
                          </div>

                          {tableExpanded && (
                            <ul className="ml-5 border-l border-vscode-border/40 pl-2">
                              {isLoadingColumns && columns.length === 0 && (
                                <li className="px-2 py-1 text-xs text-vscode-text-muted">
                                  Carregando colunas...
                                </li>
                              )}

                              {columns.map((column) => {
                                const columnReferenced = isColumnReferenced(
                                  referencedIdentifiers,
                                  scope.nome,
                                  table.nome,
                                  column.nome,
                                )

                                return (
                                <li key={column.nome}>
                                  <SchemaExplorerDraggableItem
                                    id={getSchemaColumnDraggableId(
                                      scope.nome,
                                      table.nome,
                                      column.nome,
                                    )}
                                    data={
                                      {
                                        type: 'schema-column',
                                        escopo: scope.nome,
                                        tabela: table.nome,
                                        coluna: column.nome,
                                      } satisfies SchemaColumnDragData
                                    }
                                  >
                                    <button
                                      type="button"
                                      onDoubleClick={() => handleInsertColumn(column.nome)}
                                      className={clsx(
                                        'w-full cursor-inherit truncate rounded px-2 py-1 text-left text-xs hover:bg-vscode-bg/50',
                                        columnReferenced
                                          ? COLUMN_REFERENCE_TEXT_CLASS
                                          : 'text-vscode-text-muted hover:text-vscode-text',
                                      )}
                                      title={INSERT_HINT}
                                    >
                                      {column.nome}
                                      <span className="ml-1 opacity-70">{column.tipoDado}</span>
                                    </button>
                                  </SchemaExplorerDraggableItem>
                                </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
