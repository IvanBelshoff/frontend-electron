import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import {
  SPLIT_HANDLE_PX,
  type QueryEditorFocusPane,
} from '@/features/query-editor/query-editor-layout.constants'
import {
  computeSplitPaneHeights,
  ratioFromEditorHeight,
} from '@/features/query-editor/query-editor-split.utils'

type QueryEditorSplitPaneProps = {
  editorRatio: number
  focusPane: QueryEditorFocusPane
  onRatioChange: (ratio: number) => void
  onFocusEditor: () => void
  onRestoreSplit: () => void
  onResetSplitRatio: () => void
  editor: ReactNode
  results: ReactNode
}

function PaneFocusButton({
  label,
  active,
  icon,
  onClick,
}: {
  label: string
  active: boolean
  icon: string
  onClick: () => void
}) {
  return (
    <IconButton
      icon={<DashboardMaterialIcon name={icon} className="text-[1rem]" />}
      label={label}
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'absolute right-2 top-2 z-10 h-7 w-7 rounded-md border border-transparent bg-vscode-bg/70 backdrop-blur-sm',
        active
          ? 'border-vscode-accent/40 text-vscode-accent'
          : 'text-vscode-text-muted hover:border-vscode-border hover:text-vscode-text',
      )}
    />
  )
}

export default function QueryEditorSplitPane({
  editorRatio,
  focusPane,
  onRatioChange,
  onFocusEditor,
  onRestoreSplit,
  onResetSplitRatio,
  editor,
  results,
}: QueryEditorSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [totalHeight, setTotalHeight] = useState(0)
  const dragStateRef = useRef<{ startY: number; startEditorHeight: number } | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }

    const syncHeight = () => {
      setTotalHeight(node.clientHeight)
    }

    syncHeight()

    const observer = new ResizeObserver(syncHeight)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const { editorHeight, resultsHeight, showHandle } = computeSplitPaneHeights({
    totalHeight,
    editorRatio,
    focusPane,
  })

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current
      const container = containerRef.current
      if (!dragState || !container) {
        return
      }

      const delta = event.clientY - dragState.startY
      const nextEditorHeight = dragState.startEditorHeight + delta
      onRatioChange(ratioFromEditorHeight(nextEditorHeight, container.clientHeight))
    },
    [onRatioChange],
  )

  const handlePointerUp = useCallback(() => {
    dragStateRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }, [handlePointerMove])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (focusPane !== 'none') {
        return
      }

      event.preventDefault()
      dragStateRef.current = {
        startY: event.clientY,
        startEditorHeight: editorHeight,
      }
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [editorHeight, focusPane, handlePointerMove, handlePointerUp],
  )

  useEffect(() => {
    if (focusPane === 'none') {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onRestoreSplit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusPane, onRestoreSplit])

  const editorFocused = focusPane === 'editor'
  const resultsFocused = focusPane === 'results'

  return (
    <div ref={containerRef} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <section
        className={clsx(
          'relative flex min-h-0 flex-col overflow-hidden',
          editorFocused ? 'flex-1' : 'shrink-0',
        )}
        style={editorFocused ? undefined : { height: editorHeight }}
        hidden={focusPane === 'results'}
      >
        <PaneFocusButton
          label={editorFocused ? 'Restaurar layout dividido' : 'Focar editor'}
          active={editorFocused}
          icon={editorFocused ? 'close_fullscreen' : 'open_in_full'}
          onClick={onFocusEditor}
        />
        <div className="flex min-h-0 flex-1 flex-col">{editor}</div>
      </section>

      {showHandle && (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-valuenow={Math.round(editorRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Redimensionar editor e resultados"
          onPointerDown={handlePointerDown}
          onDoubleClick={(event) => {
            event.stopPropagation()
            onResetSplitRatio()
          }}
          className="group relative z-10 flex shrink-0 cursor-ns-resize items-center justify-center hover:bg-vscode-accent/10"
          style={{ height: SPLIT_HANDLE_PX }}
        >
          <span className="h-1 w-10 rounded-full bg-vscode-border transition-colors group-hover:bg-vscode-accent/50" />
          <DashboardMaterialIcon
            name="drag_handle"
            className="pointer-events-none absolute text-[1rem] text-vscode-text-muted opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      )}

      <section
        className={clsx(
          'relative flex min-h-0 flex-col overflow-hidden',
          resultsFocused ? 'flex-1' : 'shrink-0',
        )}
        style={resultsFocused ? undefined : { height: resultsHeight }}
        hidden={focusPane === 'editor'}
      >
        <div className="flex min-h-0 flex-1 flex-col">{results}</div>
      </section>
    </div>
  )
}
