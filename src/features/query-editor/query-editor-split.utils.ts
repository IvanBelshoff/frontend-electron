import {
  EDITOR_MIN_PX,
  QUERY_EDITOR_LAYOUT_STORAGE_KEY,
  RESULTS_MIN_PX,
  SPLIT_HANDLE_PX,
  DEFAULT_EDITOR_RATIO,
  type PersistedQueryEditorLayout,
  type QueryEditorFocusPane,
} from '@/features/query-editor/query-editor-layout.constants'

export type SplitPaneHeights = {
  editorHeight: number
  resultsHeight: number
  showHandle: boolean
}

export function clampEditorRatio(
  ratio: number,
  totalHeight: number,
  minEditor = EDITOR_MIN_PX,
  minResults = RESULTS_MIN_PX,
  handleSize = SPLIT_HANDLE_PX,
): number {
  if (totalHeight <= 0) {
    return DEFAULT_EDITOR_RATIO
  }

  const available = totalHeight - handleSize
  const minRatio = minEditor / available
  const maxRatio = (available - minResults) / available

  if (maxRatio <= minRatio) {
    return minRatio
  }

  return Math.min(Math.max(ratio, minRatio), maxRatio)
}

export function computeSplitPaneHeights(input: {
  totalHeight: number
  editorRatio: number
  focusPane: QueryEditorFocusPane
  minEditor?: number
  minResults?: number
  handleSize?: number
}): SplitPaneHeights {
  const {
    totalHeight,
    editorRatio,
    focusPane,
    minEditor = EDITOR_MIN_PX,
    minResults = RESULTS_MIN_PX,
    handleSize = SPLIT_HANDLE_PX,
  } = input

  if (totalHeight <= 0) {
    return { editorHeight: 0, resultsHeight: 0, showHandle: false }
  }

  if (focusPane === 'editor') {
    return { editorHeight: totalHeight, resultsHeight: 0, showHandle: false }
  }

  if (focusPane === 'results') {
    return { editorHeight: 0, resultsHeight: totalHeight, showHandle: false }
  }

  const clampedRatio = clampEditorRatio(
    editorRatio,
    totalHeight,
    minEditor,
    minResults,
    handleSize,
  )
  const available = totalHeight - handleSize
  const editorHeight = Math.round(available * clampedRatio)
  const resultsHeight = totalHeight - handleSize - editorHeight

  return { editorHeight, resultsHeight, showHandle: true }
}

export function ratioFromEditorHeight(
  editorHeight: number,
  totalHeight: number,
  handleSize = SPLIT_HANDLE_PX,
): number {
  const available = totalHeight - handleSize
  if (available <= 0) {
    return DEFAULT_EDITOR_RATIO
  }

  return clampEditorRatio(editorHeight / available, totalHeight)
}

export function loadPersistedQueryEditorLayout(): PersistedQueryEditorLayout {
  if (typeof sessionStorage === 'undefined') {
    return { schemaCollapsed: false, editorRatio: DEFAULT_EDITOR_RATIO }
  }

  const raw = sessionStorage.getItem(QUERY_EDITOR_LAYOUT_STORAGE_KEY)
  if (!raw) {
    return { schemaCollapsed: false, editorRatio: DEFAULT_EDITOR_RATIO }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedQueryEditorLayout>
    const editorRatio =
      typeof parsed.editorRatio === 'number' && parsed.editorRatio > 0 && parsed.editorRatio < 1
        ? parsed.editorRatio
        : DEFAULT_EDITOR_RATIO

    return {
      schemaCollapsed: Boolean(parsed.schemaCollapsed),
      editorRatio,
    }
  } catch {
    return { schemaCollapsed: false, editorRatio: DEFAULT_EDITOR_RATIO }
  }
}

export function savePersistedQueryEditorLayout(layout: PersistedQueryEditorLayout): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  sessionStorage.setItem(QUERY_EDITOR_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
}

export function toggleFocusPane(
  current: QueryEditorFocusPane,
  target: 'editor' | 'results',
): QueryEditorFocusPane {
  return current === target ? 'none' : target
}

export function isDefaultEditorRatio(
  ratio: number,
  defaultRatio = DEFAULT_EDITOR_RATIO,
  epsilon = 0.005,
): boolean {
  return Math.abs(ratio - defaultRatio) < epsilon
}
