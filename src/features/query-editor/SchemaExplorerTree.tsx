import clsx from 'clsx'
import { useCallback } from 'react'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { TableNodeItem } from '@/features/query-editor/query-editor-types'
import SchemaExplorerDraggableItem from '@/features/query-editor/SchemaExplorerDraggableItem'
import {
  getSchemaColumnDraggableId,
  getSchemaTableDraggableId,
  type SchemaColumnDragData,
  type SchemaTableDragData,
} from '@/features/query-editor/query-editor-dnd.utils'
import { useSchemaTreeState } from '@/features/query-editor/use-schema-tree-state'

const INSERT_HINT = 'Arraste para o editor ou duplo clique para inserir'

type SchemaExplorerTreeProps = {
  connectionId: number
  onRegisterSchemaTables: (escopo: string, tables: string[]) => void
  onRegisterTableColumns: (escopo: string, tabela: string, columns: string[]) => void
  onInsertTable: (escopo: string, tabela: string) => void
  onInsertColumn: (columnName: string) => void
  onCollapse?: () => void
}

export default function SchemaExplorerTree({
  connectionId,
  onRegisterSchemaTables,
  onRegisterTableColumns,
  onInsertTable,
  onInsertColumn,
  onCollapse,
}: SchemaExplorerTreeProps) {
  const {
    filter,
    setFilter,
    scopes,
    isLoadingScopes,
    tablesByScope,
    columnsByTable,
    isLoadingTables,
    isLoadingColumns,
    toggleExpanded,
    isExpanded,
    scopeKey,
    tableKey,
  } = useSchemaTreeState(connectionId, onRegisterSchemaTables, onRegisterTableColumns)

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
        <div className="flex items-center gap-1.5">
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrar schema..."
            className="min-w-0 flex-1 rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-xs text-vscode-text placeholder:text-vscode-text-muted focus:outline-none focus:ring-2 focus:ring-vscode-accent/30"
          />
          {onCollapse ? (
            <IconButton
              icon={<DashboardMaterialIcon name="chevron_left" className="text-[1.05rem]" />}
              label="Recolher explorador de schema"
              onClick={onCollapse}
              className="h-7 w-7 shrink-0 rounded-md text-vscode-text-muted hover:text-vscode-text"
            />
          ) : null}
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

            return (
              <li key={scope.nome}>
                <button
                  type="button"
                  onClick={() => toggleExpanded(scopeNodeKey)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-vscode-bg/50"
                >
                  <span className="text-vscode-text-muted">{expanded ? '▾' : '▸'}</span>
                  <span className="truncate font-medium text-vscode-text">{scope.nome}</span>
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
                                  table.tipo === 'view'
                                    ? 'text-vscode-accent'
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

                              {columns.map((column) => (
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
                                      className="w-full cursor-inherit truncate rounded px-2 py-1 text-left text-xs text-vscode-text-muted hover:bg-vscode-bg/50 hover:text-vscode-text"
                                      title={INSERT_HINT}
                                    >
                                      {column.nome}
                                      <span className="ml-1 opacity-70">{column.tipoDado}</span>
                                    </button>
                                  </SchemaExplorerDraggableItem>
                                </li>
                              ))}
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
