import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { sql, PostgreSQL, MySQL, MSSQL, StandardSQL } from '@codemirror/lang-sql'
import { keymap, EditorView } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react'
import clsx from 'clsx'
import type { TipoConexao } from '@/features/connections/connection-types'
import type { ParametroRelatorio } from '@/features/reports/report-types'
import type { SchemaCompletionContext } from '@/features/query-editor/query-editor-types'
import { createSchemaCompletionSource, type SchemaMetadataLoader } from '@/features/query-editor/sql-schema-completion'
import { createSqlQueryLinter } from '@/features/query-editor/sql-query-linter'
import { useTheme } from '@/features/settings/theme/theme-provider'
import { createSqlEditorTheme, createSqlSyntaxHighlighting } from '@/components/sql-editor/sql-editor-theme'
import { formatSqlQuery } from '@/components/sql-editor/sql-format.util'

export type AdvancedSqlQueryEditorHandle = {
  format: () => void
  focus: () => void
  insertAtPosition: (snippet: string, position: number) => void
  resolvePositionFromPointer: (clientX: number, clientY: number) => number | null
  getDocumentLength: () => number
}

export type AdvancedSqlQueryEditorProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  connectionTipo?: TipoConexao | null
  parametros?: ParametroRelatorio[]
  schemaContext?: SchemaCompletionContext
  metadataLoader?: SchemaMetadataLoader
  executionError?: string | null
  hasError?: boolean
  disabled?: boolean
  placeholder?: string
  minRows?: number
  fillHeight?: boolean
}

const LINE_HEIGHT_PX = 21
const EDITOR_PADDING_PX = 16

function resolveSqlDialect(connectionTipo?: TipoConexao | null) {
  switch (connectionTipo) {
    case 'postgres':
      return PostgreSQL
    case 'mysql':
      return MySQL
    case 'mssql':
      return MSSQL
    case 'oracle':
      return StandardSQL
    default:
      return StandardSQL
  }
}

export default forwardRef<AdvancedSqlQueryEditorHandle, AdvancedSqlQueryEditorProps>(
  function AdvancedSqlQueryEditor(
  {
  id,
  value,
  onChange,
  connectionTipo = null,
  parametros = [],
  schemaContext = { schemas: {}, columnsByTable: {} },
  metadataLoader,
  executionError = null,
  hasError = false,
  disabled = false,
  placeholder,
  minRows = 10,
  fillHeight = false,
}: AdvancedSqlQueryEditorProps,
  ref,
) {
  const minHeight = minRows * LINE_HEIGHT_PX + EDITOR_PADDING_PX
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(minHeight)
  const { resolvedTheme } = useTheme()
  const executionErrorRef = useRef(executionError)
  executionErrorRef.current = executionError

  useEffect(() => {
    if (fillHeight) {
      return
    }

    setContainerHeight(minHeight)
  }, [fillHeight, minHeight])

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }

    const syncHeight = () => {
      const nextHeight = node.clientHeight
      setContainerHeight(nextHeight)
      editorRef.current?.view?.requestMeasure()
    }

    syncHeight()

    const observer = new ResizeObserver(syncHeight)
    observer.observe(node)

    return () => observer.disconnect()
  }, [minHeight])

  const handleFormat = useCallback(() => {
    const formatted = formatSqlQuery(value, connectionTipo)
    onChange(formatted)

    requestAnimationFrame(() => {
      editorRef.current?.view?.focus()
    })
  }, [connectionTipo, onChange, value])

  const handleFocus = useCallback(() => {
    editorRef.current?.view?.focus()
  }, [])

  const handleInsertAtPosition = useCallback(
    (snippet: string, position: number) => {
      const view = editorRef.current?.view
      if (!view) {
        return
      }

      const safePosition = Math.max(0, Math.min(position, view.state.doc.length))
      view.dispatch({
        changes: { from: safePosition, insert: snippet },
        selection: { anchor: safePosition + snippet.length },
      })
      view.focus()
    },
    [],
  )

  const handleResolvePositionFromPointer = useCallback((clientX: number, clientY: number) => {
    const view = editorRef.current?.view
    if (!view) {
      return null
    }

    return view.posAtCoords({ x: clientX, y: clientY })
  }, [])

  const handleGetDocumentLength = useCallback(() => {
    return editorRef.current?.view?.state.doc.length ?? 0
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      format: handleFormat,
      focus: handleFocus,
      insertAtPosition: handleInsertAtPosition,
      resolvePositionFromPointer: handleResolvePositionFromPointer,
      getDocumentLength: handleGetDocumentLength,
    }),
    [
      handleFormat,
      handleFocus,
      handleInsertAtPosition,
      handleResolvePositionFromPointer,
      handleGetDocumentLength,
    ],
  )

  const sqlSchema = useMemo(() => schemaContext.schemas, [schemaContext.schemas])

  const extensions = useMemo(
    () => [
      sql({
        dialect: resolveSqlDialect(connectionTipo),
        schema: sqlSchema,
        upperCaseKeywords: true,
      }),
      createSqlSyntaxHighlighting(resolvedTheme),
      createSqlEditorTheme(hasError || Boolean(executionError), resolvedTheme, {
        showLineNumbers: true,
      }),
      autocompletion({
        override: [
          createSchemaCompletionSource(
            connectionTipo,
            parametros,
            schemaContext,
            metadataLoader,
          ),
        ],
        activateOnTyping: true,
        defaultKeymap: true,
      }),
      createSqlQueryLinter(() => executionErrorRef.current),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ spellcheck: 'false', autocorrect: 'off' }),
      keymap.of([
        {
          key: 'Mod-Shift-f',
          run: () => {
            handleFormat()
            return true
          },
        },
      ]),
    ],
    [
      connectionTipo,
      executionError,
      handleFormat,
      hasError,
      parametros,
      resolvedTheme,
      schemaContext,
      metadataLoader,
      sqlSchema,
    ],
  )

  return (
    <div
      ref={containerRef}
      className={clsx(
        'overflow-hidden rounded-md',
        fillHeight ? 'h-full min-h-0' : 'resize-y',
        disabled && 'pointer-events-none opacity-60',
      )}
      style={fillHeight ? undefined : { height: minHeight, minHeight }}
    >
      <CodeMirror
          key={resolvedTheme}
          ref={editorRef}
          id={id}
          value={value}
          height={`${containerHeight}px`}
          theme="none"
          extensions={extensions}
          onChange={onChange}
          editable={!disabled}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
            lintKeymap: true,
          }}
        />
    </div>
  )
},
)
