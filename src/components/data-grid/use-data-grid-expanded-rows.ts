import { useCallback, useState } from 'react'

export function useDataGridExpandedRows() {
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([])

  const toggleRowDetails = useCallback((rowId: string) => {
    setExpandedRowIds((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    )
  }, [])

  return { expandedRowIds, toggleRowDetails }
}
