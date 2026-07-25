import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_EDITOR_RATIO,
  type QueryEditorFocusPane,
} from '@/features/query-editor/query-editor-layout.constants'
import {
  loadPersistedQueryEditorLayout,
  savePersistedQueryEditorLayout,
  toggleFocusPane,
} from '@/features/query-editor/query-editor-split.utils'

export function useQueryEditorLayout() {
  const [schemaCollapsed, setSchemaCollapsed] = useState(
    () => loadPersistedQueryEditorLayout().schemaCollapsed,
  )
  const [editorRatio, setEditorRatioState] = useState(
    () => loadPersistedQueryEditorLayout().editorRatio ?? DEFAULT_EDITOR_RATIO,
  )
  const [focusPane, setFocusPane] = useState<QueryEditorFocusPane>('none')

  useEffect(() => {
    savePersistedQueryEditorLayout({ schemaCollapsed, editorRatio })
  }, [schemaCollapsed, editorRatio])

  const toggleSchemaCollapsed = useCallback(() => {
    setSchemaCollapsed((current) => !current)
  }, [])

  const setEditorRatio = useCallback((ratio: number) => {
    setEditorRatioState(ratio)
  }, [])

  const focusEditor = useCallback(() => {
    setFocusPane((current) => toggleFocusPane(current, 'editor'))
  }, [])

  const focusResults = useCallback(() => {
    setFocusPane((current) => toggleFocusPane(current, 'results'))
  }, [])

  const restoreSplit = useCallback(() => {
    setFocusPane('none')
  }, [])

  const resetSplitRatio = useCallback(() => {
    setEditorRatioState(DEFAULT_EDITOR_RATIO)
  }, [])

  return {
    schemaCollapsed,
    toggleSchemaCollapsed,
    editorRatio,
    setEditorRatio,
    focusPane,
    focusEditor,
    focusResults,
    restoreSplit,
    resetSplitRatio,
  }
}
