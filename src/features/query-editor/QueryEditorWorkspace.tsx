import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Alert from '@/components/ui/Alert'
import AdvancedSqlQueryEditor, {
  type AdvancedSqlQueryEditorHandle,
} from '@/features/query-editor/AdvancedSqlQueryEditor'
import QueryEditorDragOverlay from '@/features/query-editor/QueryEditorDragOverlay'
import QueryEditorSqlDropTarget from '@/features/query-editor/QueryEditorSqlDropTarget'
import QueryEditorSplitPane from '@/features/query-editor/QueryEditorSplitPane'
import QueryResultFooter from '@/features/query-editor/QueryResultFooter'
import QueryEditorToolbar from '@/features/query-editor/QueryEditorToolbar'
import SchemaExplorerPanel from '@/features/query-editor/SchemaExplorerPanel'
import SchemaExplorerTree from '@/features/query-editor/SchemaExplorerTree'
import type { QueryEditorSession } from '@/features/query-editor/query-editor-types'
import {
  isQueryEditorSqlDropTarget,
  parseSchemaExplorerDragData,
  resolveDropPointer,
  toActiveDrag,
  type SchemaExplorerActiveDrag,
} from '@/features/query-editor/query-editor-dnd.utils'
import { insertColumnAtPosition } from '@/features/query-editor/sql-column-insert'
import { useQueryEditorLayout } from '@/features/query-editor/use-query-editor-layout'
import { isDefaultEditorRatio } from '@/features/query-editor/query-editor-split.utils'
import { useQueryEditorState } from '@/features/query-editor/use-query-editor-state'
import { appendTableInsert, insertTableAtPosition } from '@/features/query-editor/sql-table-insert'
import ReportExecutionGrid from '@/features/reports/components/ReportExecutionGrid'
import ReportParamForm from '@/features/reports/components/ReportParamForm'

type QueryEditorWorkspaceProps = {
  session: QueryEditorSession
  onApply: (query: string) => void
  onCancel: () => void
}

export default function QueryEditorWorkspace({
  session,
  onApply,
  onCancel,
}: QueryEditorWorkspaceProps) {
  const {
    query,
    setQuery,
    parametros,
    paramValues,
    setAllParametros,
    previewResult,
    countResult,
    executionError,
    countError,
    hasLoadedData,
    isExecuting,
    isCounting,
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
    connectionId,
    connectionTipo,
  } = useQueryEditorState(session)

  const editorRef = useRef<AdvancedSqlQueryEditorHandle>(null)
  const layoutContainerRef = useRef<HTMLDivElement>(null)
  const dndFlexRef = useRef<HTMLDivElement>(null)
  const layout = useQueryEditorLayout()
  const [activeDrag, setActiveDrag] = useState<SchemaExplorerActiveDrag | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const metadataLoader = useMemo(
    () => ({
      ensureSchemaTables,
      ensureTableColumns,
    }),
    [ensureSchemaTables, ensureTableColumns],
  )

  const handleInsertTable = useCallback(
    (escopo: string, tabela: string) => {
      setQuery((current) => appendTableInsert(current, `${escopo}.${tabela}`))
    },
    [setQuery],
  )

  const handleInsertColumn = useCallback(
    (columnName: string) => {
      setQuery((current) => {
        const trimmed = current.trimEnd()
        if (!trimmed) {
          return columnName
        }

        return `${trimmed} ${columnName}`
      })
    },
    [setQuery],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragData = parseSchemaExplorerDragData(event.active.data.current)
    if (!dragData) {
      return
    }

    setActiveDrag(toActiveDrag(dragData))
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null)
  }, [])

  useEffect(() => {
    if (!activeDrag) {
      return
    }

    const previousCursor = document.body.style.cursor
    document.body.style.cursor = 'grabbing'

    return () => {
      document.body.style.cursor = previousCursor
    }
  }, [activeDrag])

  useEffect(() => {
    if (!hasLoadedData) {
      return
    }

    const measureLayout = () => {
      const layoutEl = layoutContainerRef.current
      const dndEl = dndFlexRef.current
      const bodyOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth

      // #region agent log
      fetch('http://127.0.0.1:7570/ingest/0db2c04a-a5ac-44c9-a409-caf72cacc101', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ef221f' },
        body: JSON.stringify({
          sessionId: 'ef221f',
          runId: 'post-fix',
          hypothesisId: 'H1-H3',
          location: 'QueryEditorWorkspace.tsx:layout-measure',
          message: 'workspace layout after results loaded',
          data: {
            hasLoadedData,
            columnCount: previewResult?.colunas.length ?? 0,
            rowCount: previewResult?.dados.length ?? 0,
            layoutClientWidth: layoutEl?.clientWidth ?? null,
            layoutScrollWidth: layoutEl?.scrollWidth ?? null,
            dndClientWidth: dndEl?.clientWidth ?? null,
            dndScrollWidth: dndEl?.scrollWidth ?? null,
            bodyHorizontalOverflow: bodyOverflow,
            docClientWidth: document.documentElement.clientWidth,
            docScrollWidth: document.documentElement.scrollWidth,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
    }

    measureLayout()
    const raf = requestAnimationFrame(measureLayout)
    return () => cancelAnimationFrame(raf)
  }, [hasLoadedData, previewResult?.colunas.length, previewResult?.dados.length])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)

      if (!isQueryEditorSqlDropTarget(event.over?.id)) {
        return
      }

      const dragData = parseSchemaExplorerDragData(event.active.data.current)
      if (!dragData) {
        return
      }

      const editor = editorRef.current
      if (!editor) {
        return
      }

      const pointer = resolveDropPointer(event)
      const position =
        pointer !== null
          ? editor.resolvePositionFromPointer(pointer.x, pointer.y)
          : null
      const insertPosition = position ?? editor.getDocumentLength()

      if (dragData.type === 'schema-table') {
        const { insertedText } = insertTableAtPosition(
          query,
          insertPosition,
          dragData.qualifiedName,
        )
        editor.insertAtPosition(insertedText, insertPosition)
        return
      }

      const { insertedText } = insertColumnAtPosition(query, insertPosition, dragData.coluna)
      editor.insertAtPosition(insertedText, insertPosition)
    },
    [query],
  )

  const editorPane = (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <QueryEditorSqlDropTarget isDragActive={activeDrag !== null} className="min-h-0 flex-1">
        <AdvancedSqlQueryEditor
          ref={editorRef}
          value={query}
          onChange={setQuery}
          connectionTipo={connectionTipo}
          parametros={parametros}
          schemaContext={schemaContext}
          metadataLoader={metadataLoader}
          executionError={executionError}
          fillHeight
        />
      </QueryEditorSqlDropTarget>

      {executionError && <Alert variant="error">{executionError}</Alert>}

      {parametros.length > 0 && (
        <div className="shrink-0 rounded-md border border-vscode-border bg-vscode-sidebar/30 p-3">
          <ReportParamForm
            parametros={parametros}
            values={paramValues}
            onChange={setAllParametros}
          />
        </div>
      )}
    </div>
  )

  const resultsPane = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-vscode-border">
      <ReportExecutionGrid
        className="h-full min-h-0 border-0"
        colunas={previewResult?.colunas ?? []}
        dados={previewResult?.dados ?? []}
        hasLoaded={hasLoadedData}
        totalLinhas={previewResult?.totalLinhas}
        paginationMode="client"
        fillHeight
        showPagination={false}
        enableSorting={false}
        layout={{ enableColumnReorder: false, enableColumnResize: true }}
        emptyMessage="Nenhum dado retornado pela consulta."
      />
      <QueryResultFooter
        fetchLimit={fetchLimit}
        onFetchLimitChange={setFetchLimit}
        previewResult={previewResult}
        countResult={countResult}
        isCounting={isCounting}
        countError={countError}
        onCountRows={countRows}
        resultsFocused={layout.focusPane === 'results'}
        onFocusResults={layout.focusResults}
        onClearResults={clearResults}
      />
    </div>
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vscode-border pb-4">
        <div>
          <h1 className="text-lg font-semibold text-vscode-text">Editor avançado de query</h1>
          <p className="text-sm text-vscode-text-muted">
            Teste a consulta com o explorador de schema e aplique ao relatório quando estiver
            satisfeito.
          </p>
        </div>

        <QueryEditorToolbar
          onFormat={() => editorRef.current?.format()}
          onCancel={onCancel}
          onExecute={executePreview}
          onSave={() => onApply(query)}
          canFormat={Boolean(query.trim())}
          isExecuting={isExecuting}
          showRestoreLayout={layout.focusPane !== 'none'}
          onRestoreLayout={layout.restoreSplit}
          showResetSplitRatio={
            layout.focusPane === 'none' && !isDefaultEditorRatio(layout.editorRatio)
          }
          onResetSplitRatio={layout.resetSplitRatio}
        />
      </div>

      <div ref={layoutContainerRef} className="flex min-h-0 min-w-0 flex-1 gap-3">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            ref={dndFlexRef}
            className={clsx(
              'flex min-h-0 min-w-0 flex-1 gap-3',
              activeDrag && 'cursor-grabbing',
            )}
          >
            <SchemaExplorerPanel
              collapsed={layout.schemaCollapsed}
              onToggle={layout.toggleSchemaCollapsed}
            >
              <SchemaExplorerTree
                connectionId={connectionId}
                onRegisterSchemaTables={registerSchemaTables}
                onRegisterTableColumns={registerTableColumns}
                onInsertTable={handleInsertTable}
                onInsertColumn={handleInsertColumn}
                onCollapse={layout.toggleSchemaCollapsed}
              />
            </SchemaExplorerPanel>

            <QueryEditorSplitPane
              editorRatio={layout.editorRatio}
              focusPane={layout.focusPane}
              onRatioChange={layout.setEditorRatio}
              onFocusEditor={layout.focusEditor}
              onRestoreSplit={layout.restoreSplit}
              onResetSplitRatio={layout.resetSplitRatio}
              editor={editorPane}
              results={resultsPane}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            <QueryEditorDragOverlay activeDrag={activeDrag} />
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
