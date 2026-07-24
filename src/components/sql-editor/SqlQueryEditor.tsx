import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { keymap, EditorView } from '@codemirror/view'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import type { TipoConexao } from '@/features/connections/connection-types'
import type { ParametroRelatorio } from '@/features/reports/report-types'
import { useTheme } from '@/features/settings/theme/theme-provider'
import { createSqlAutocompleteExtension } from './sql-completion-source'
import { createSqlEditorTheme, createSqlSyntaxHighlighting } from './sql-editor-theme'
import { formatSqlQuery } from './sql-format.util'
import { resolveConnectionDialectLabel } from './sql-dialect'

export type SqlQueryEditorProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  connectionTipo?: TipoConexao | null
  parametros?: ParametroRelatorio[]
  hasError?: boolean
  disabled?: boolean
  placeholder?: string
  minRows?: number
}

const LINE_HEIGHT_PX = 21
const EDITOR_PADDING_PX = 16

export default function SqlQueryEditor({
  id,
  value,
  onChange,
  connectionTipo = null,
  parametros = [],
  hasError = false,
  disabled = false,
  placeholder,
  minRows = 6,
}: SqlQueryEditorProps) {
  const minHeight = minRows * LINE_HEIGHT_PX + EDITOR_PADDING_PX
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(minHeight)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setContainerHeight(minHeight)
  }, [minHeight])

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

  const extensions = useMemo(
    () => [
      sql(),
      createSqlSyntaxHighlighting(resolvedTheme),
      createSqlEditorTheme(hasError, resolvedTheme),
      createSqlAutocompleteExtension(connectionTipo, parametros),
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
    [connectionTipo, handleFormat, hasError, parametros, resolvedTheme],
  )

  const dialectLabel = resolveConnectionDialectLabel(connectionTipo)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleFormat}
          disabled={disabled || !value.trim()}
          className={clsx(
            'rounded border px-2.5 py-1 text-xs font-medium transition-colors',
            'border-vscode-border bg-vscode-bg/40 text-vscode-text hover:border-vscode-accent/40 hover:bg-vscode-accent/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          Formatar
        </button>
        <span className="text-xs text-vscode-text-muted">
          {dialectLabel} · Ctrl+Shift+F
        </span>
      </div>

      <div
        ref={containerRef}
        className={clsx(
          'resize-y overflow-hidden rounded-md',
          disabled && 'pointer-events-none opacity-60',
        )}
        style={{ height: minHeight, minHeight }}
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
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
          }}
        />
      </div>
    </div>
  )
}
