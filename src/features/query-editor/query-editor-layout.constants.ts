export const QUERY_EDITOR_LAYOUT_STORAGE_KEY = 'datadash:query-editor-layout'

export const SCHEMA_PANEL_WIDTH_EXPANDED = 280
export const SCHEMA_PANEL_WIDTH_COLLAPSED = 40

export const EDITOR_MIN_PX = 140
export const RESULTS_MIN_PX = 160
export const SPLIT_HANDLE_PX = 6

export const DEFAULT_EDITOR_RATIO = 0.5

export type QueryEditorFocusPane = 'none' | 'editor' | 'results'

export type PersistedQueryEditorLayout = {
  schemaCollapsed: boolean
  editorRatio: number
}
