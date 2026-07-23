import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ColumnOrderState, ColumnSizingState, SortingState } from '@tanstack/react-table'
import {
  layoutPatchFromTableState,
  sanitizeLayoutForColumns,
  sortingStateFromLayout,
} from '@/components/data-grid/data-grid-sort.utils'
import {
  getGridLayoutFeatures,
  shouldPersistGridLayout,
  type GridId,
} from '@/components/data-grid/grid-registry'
import { scheduleUserPreferencesPersist } from '@/features/settings/user-preferences-sync'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import type { DataGridLayoutPreference } from '@/features/settings/user-preferences-types'

const PERSIST_DEBOUNCE_MS = 500

type UseDataGridLayoutOptions = {
  columnIds: string[]
}

type UseDataGridLayoutResult = {
  layoutFeatures: ReturnType<typeof getGridLayoutFeatures>
  initialColumnOrder: ColumnOrderState
  initialColumnSizing: ColumnSizingState
  initialSorting: SortingState
  onLayoutChange: (patch: {
    columnOrder: ColumnOrderState
    columnSizing: ColumnSizingState
    sorting: SortingState
  }) => void
}

export function useDataGridLayout(
  gridId: GridId,
  { columnIds }: UseDataGridLayoutOptions,
): UseDataGridLayoutResult {
  const layoutFeatures = useMemo(() => getGridLayoutFeatures(gridId), [gridId])
  const persistLayout = shouldPersistGridLayout(gridId)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestColumnIdsRef = useRef(columnIds)
  latestColumnIdsRef.current = columnIds

  const storedLayout = useMemo(() => {
    if (!persistLayout) {
      return {}
    }

    const raw = userPreferencesStore.getPreferences().grids?.[gridId]
    return sanitizeLayoutForColumns(raw, columnIds)
  }, [gridId, columnIds, persistLayout])

  const initialColumnOrder = useMemo(() => {
    if (!layoutFeatures.enableColumnReorder) {
      return columnIds
    }

    return storedLayout.columnOrder ?? columnIds
  }, [columnIds, layoutFeatures.enableColumnReorder, storedLayout.columnOrder])

  const initialColumnSizing = useMemo(() => {
    if (!layoutFeatures.enableColumnResize) {
      return {}
    }

    return storedLayout.columnSizing ?? {}
  }, [layoutFeatures.enableColumnResize, storedLayout.columnSizing])

  const initialSorting = useMemo(() => {
    if (!persistLayout) {
      return []
    }

    return sortingStateFromLayout(storedLayout)
  }, [persistLayout, storedLayout])

  const persistLayoutPatch = useCallback(
    (patch: DataGridLayoutPreference) => {
      if (!persistLayout) {
        return
      }

      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
      }

      persistTimerRef.current = setTimeout(() => {
        persistTimerRef.current = null
        scheduleUserPreferencesPersist({
          grids: {
            [gridId]: patch,
          },
        })
      }, PERSIST_DEBOUNCE_MS)
    },
    [gridId, persistLayout],
  )

  const onLayoutChange = useCallback(
    (state: {
      columnOrder: ColumnOrderState
      columnSizing: ColumnSizingState
      sorting: SortingState
    }) => {
      const shouldPersist =
        persistLayout &&
        (layoutFeatures.enableColumnReorder || layoutFeatures.enableColumnResize)

      if (!shouldPersist) {
        return
      }

      const patch = sanitizeLayoutForColumns(
        layoutPatchFromTableState(state),
        latestColumnIdsRef.current,
      )
      persistLayoutPatch(patch)
    },
    [
      layoutFeatures.enableColumnReorder,
      layoutFeatures.enableColumnResize,
      persistLayout,
      persistLayoutPatch,
    ],
  )

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
      }
    }
  }, [])

  return {
    layoutFeatures,
    initialColumnOrder,
    initialColumnSizing,
    initialSorting,
    onLayoutChange,
  }
}
