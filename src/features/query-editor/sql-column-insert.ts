import { insertSnippetAtPosition } from '@/features/query-editor/sql-table-insert'

export function insertColumnAtPosition(
  query: string,
  position: number,
  columnName: string,
): { nextQuery: string; cursor: number; insertedText: string } {
  return insertSnippetAtPosition(query, position, columnName)
}
