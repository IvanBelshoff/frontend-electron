import {
  DATA_GRID_CELL_CLASS,
  DATA_GRID_HEADER_CELL_CLASS,
  DATA_GRID_PREVIEW_CELL_CLASS,
  DATA_GRID_PREVIEW_HEADER_CELL_CLASS,
  DATA_GRID_ROW_MIN_HEIGHT,
} from '@/components/data-grid/data-grid.constants'
import {
  DEFAULT_DATA_GRID_STYLE,
  type DataGridColumnLinesMode,
  type UserDataGridStylePreference,
} from '@/features/settings/user-preferences-types'

export type DataGridStyleOverrides = {
  rowHeight?: number
  stickyHeader?: boolean
  showGridLines?: boolean
}

export type ResolvedDataGridStyle = {
  rowHeight: number
  cellClass: string
  headerCellClass: string
  previewCellClass: string
  previewHeaderCellClass: string
  stripedRows: boolean
  showRowLines: boolean
  stickyHeader: boolean
  showGridLines: boolean
  columnLines: DataGridColumnLinesMode
  getHeaderColumnLineClass: (isLastColumn: boolean) => string
  getBodyColumnLineClass: (isLastColumn: boolean) => string
  getRowBackgroundClass: (rowIndex: number) => string
}

function getColumnLineClass(
  mode: 'header' | 'body',
  columnLines: DataGridColumnLinesMode,
  isLastColumn: boolean,
): string {
  if (isLastColumn || columnLines === 'none') {
    return ''
  }

  if (columnLines === 'header' && mode === 'body') {
    return ''
  }

  return 'border-r border-vscode-border'
}

export function resolveDataGridStyle(
  preferences?: Partial<UserDataGridStylePreference>,
  overrides: DataGridStyleOverrides = {},
): ResolvedDataGridStyle {
  const style = { ...DEFAULT_DATA_GRID_STYLE, ...preferences }

  const rowHeight = overrides.rowHeight ?? DATA_GRID_ROW_MIN_HEIGHT

  return {
    rowHeight,
    cellClass: DATA_GRID_CELL_CLASS,
    headerCellClass: DATA_GRID_HEADER_CELL_CLASS,
    previewCellClass: DATA_GRID_PREVIEW_CELL_CLASS,
    previewHeaderCellClass: DATA_GRID_PREVIEW_HEADER_CELL_CLASS,
    stripedRows: style.stripedRows,
    showRowLines: style.showRowLines,
    stickyHeader: overrides.stickyHeader ?? style.stickyHeader,
    showGridLines: overrides.showGridLines ?? true,
    columnLines: style.columnLines,
    getHeaderColumnLineClass: (isLastColumn) =>
      getColumnLineClass('header', style.columnLines, isLastColumn),
    getBodyColumnLineClass: (isLastColumn) =>
      getColumnLineClass('body', style.columnLines, isLastColumn),
    getRowBackgroundClass: (rowIndex) => {
      if (!style.stripedRows) {
        return 'bg-vscode-sidebar'
      }

      return rowIndex % 2 === 0 ? 'bg-vscode-sidebar' : 'bg-vscode-activity-bar/50'
    },
  }
}
