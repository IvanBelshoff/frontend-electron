import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  assignUserRelatorios,
  getRelatoriosByUser,
  updateUserReportAiKnowledge,
} from '@/features/user/user-report-access-api'
import {
  filterAccessReportsBySearch,
  isOwnerReport,
  sortAccessReports,
} from '@/features/user/user-report-access-utils'
import type { AccessReport } from '@/features/user/user-report-access-types'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

type AccessColumn = 'available' | 'granted'

function normalizeLists(available: AccessReport[], granted: AccessReport[]) {
  return {
    available: sortAccessReports(available),
    granted: sortAccessReports(granted),
  }
}

export function useUserReportAccessState(user: ManagedUser | undefined, enabled: boolean) {
  const queryClient = useQueryClient()
  const userId = user?.id ?? 0
  const isUserBlocked = Boolean(user?.bloqueado)

  const [availableReports, setAvailableReports] = useState<AccessReport[]>([])
  const [grantedReports, setGrantedReports] = useState<AccessReport[]>([])
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<number[]>([])
  const [selectedGrantedIds, setSelectedGrantedIds] = useState<number[]>([])
  const [availableSearch, setAvailableSearch] = useState('')
  const [grantedSearch, setGrantedSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const accessQuery = useQuery({
    queryKey: queryKeys.userReportAccess(userId),
    queryFn: () => getRelatoriosByUser(userId),
    enabled: enabled && Number.isFinite(userId) && userId > 0,
  })

  useLayoutEffect(() => {
    if (!accessQuery.data) {
      setAvailableReports([])
      setGrantedReports([])
      setSelectedAvailableIds([])
      setSelectedGrantedIds([])
      return
    }

    const normalized = normalizeLists(
      accessQuery.data.relatoriosDisponiveis,
      accessQuery.data.relatorios,
    )

    setAvailableReports(normalized.available)
    setGrantedReports(normalized.granted)
    setSelectedAvailableIds([])
    setSelectedGrantedIds([])
    setErrorMessage(null)
  }, [accessQuery.data, userId])

  useLayoutEffect(() => {
    setAvailableSearch('')
    setGrantedSearch('')
    setErrorMessage(null)
  }, [userId])

  const filteredAvailableReports = useMemo(
    () => filterAccessReportsBySearch(availableReports, availableSearch),
    [availableReports, availableSearch],
  )

  const filteredGrantedReports = useMemo(
    () => filterAccessReportsBySearch(grantedReports, grantedSearch),
    [grantedReports, grantedSearch],
  )

  const isOwnerReportId = useCallback(
    (reportId: number) => {
      const report = grantedReports.find((item) => item.id === reportId)
      return Boolean(report && isOwnerReport(report, userId))
    },
    [grantedReports, userId],
  )

  const persistMutation = useMutation({
    mutationFn: (reports: AccessReport[]) =>
      assignUserRelatorios(
        userId,
        reports.map((report) => ({ id: report.id })),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) })
      setErrorMessage(null)
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao sincronizar acessos.',
      )
      void accessQuery.refetch()
    },
  })

  const aiKnowledgeMutation = useMutation({
    mutationFn: ({
      reportId,
      permitirConhecimentoIa,
    }: {
      reportId: number
      permitirConhecimentoIa: boolean
    }) => updateUserReportAiKnowledge(userId, reportId, permitirConhecimentoIa),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userReportAccess(userId) })
      void queryClient.invalidateQueries({ queryKey: ['my-reports'] })
      setErrorMessage(null)
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao atualizar conhecimento da IA.',
      )
      void accessQuery.refetch()
    },
  })

  const persistGrantedReports = useCallback(
    async (nextGranted: AccessReport[], nextAvailable: AccessReport[]) => {
      const previousGranted = grantedReports
      const previousAvailable = availableReports

      setGrantedReports(sortAccessReports(nextGranted))
      setAvailableReports(sortAccessReports(nextAvailable))
      setSelectedAvailableIds([])
      setSelectedGrantedIds([])

      try {
        await persistMutation.mutateAsync(nextGranted)
      } catch {
        setGrantedReports(previousGranted)
        setAvailableReports(previousAvailable)
      }
    },
    [availableReports, grantedReports, persistMutation],
  )

  const toggleReportSelection = useCallback(
    (column: AccessColumn, reportId: number) => {
      if (column === 'available') {
        setSelectedAvailableIds((current) =>
          current.includes(reportId)
            ? current.filter((id) => id !== reportId)
            : [...current, reportId],
        )
        return
      }

      if (isOwnerReportId(reportId)) {
        return
      }

      setSelectedGrantedIds((current) =>
        current.includes(reportId)
          ? current.filter((id) => id !== reportId)
          : [...current, reportId],
      )
    },
    [isOwnerReportId],
  )

  const toggleSelectAll = useCallback(
    (column: AccessColumn) => {
      if (column === 'available') {
        const filteredIds = filteredAvailableReports.map((report) => report.id)
        const allSelected =
          filteredIds.length > 0 &&
          filteredIds.every((id) => selectedAvailableIds.includes(id))

        setSelectedAvailableIds(allSelected ? [] : filteredIds)
        return
      }

      const selectableReports = filteredGrantedReports.filter(
        (report) => !isOwnerReport(report, userId),
      )
      const filteredIds = selectableReports.map((report) => report.id)
      const allSelected =
        filteredIds.length > 0 && filteredIds.every((id) => selectedGrantedIds.includes(id))

      setSelectedGrantedIds(allSelected ? [] : filteredIds)
    },
    [
      filteredAvailableReports,
      filteredGrantedReports,
      selectedAvailableIds,
      selectedGrantedIds,
      userId,
    ],
  )

  const isAllSelected = useCallback(
    (column: AccessColumn) => {
      if (column === 'available') {
        const filteredIds = filteredAvailableReports.map((report) => report.id)
        return (
          filteredIds.length > 0 &&
          filteredIds.every((id) => selectedAvailableIds.includes(id))
        )
      }

      const selectableReports = filteredGrantedReports.filter(
        (report) => !isOwnerReport(report, userId),
      )
      const filteredIds = selectableReports.map((report) => report.id)
      return (
        filteredIds.length > 0 && filteredIds.every((id) => selectedGrantedIds.includes(id))
      )
    },
    [
      filteredAvailableReports,
      filteredGrantedReports,
      selectedAvailableIds,
      selectedGrantedIds,
      userId,
    ],
  )

  const moveSelectedRight = useCallback(async () => {
    if (selectedAvailableIds.length === 0) {
      return
    }

    const movingReports = availableReports.filter((report) =>
      selectedAvailableIds.includes(report.id),
    )

    await persistGrantedReports(
      [...grantedReports, ...movingReports],
      availableReports.filter((report) => !selectedAvailableIds.includes(report.id)),
    )
  }, [availableReports, grantedReports, persistGrantedReports, selectedAvailableIds])

  const moveAllRight = useCallback(async () => {
    if (filteredAvailableReports.length === 0) {
      return
    }

    const movingIds = new Set(filteredAvailableReports.map((report) => report.id))

    await persistGrantedReports(
      [...grantedReports, ...filteredAvailableReports],
      availableReports.filter((report) => !movingIds.has(report.id)),
    )
  }, [availableReports, filteredAvailableReports, grantedReports, persistGrantedReports])

  const moveSelectedLeft = useCallback(async () => {
    if (selectedGrantedIds.length === 0) {
      return
    }

    const movingReports = grantedReports.filter((report) =>
      selectedGrantedIds.includes(report.id),
    )

    await persistGrantedReports(
      grantedReports.filter((report) => !selectedGrantedIds.includes(report.id)),
      [...availableReports, ...movingReports],
    )
  }, [availableReports, grantedReports, persistGrantedReports, selectedGrantedIds])

  const moveAllLeft = useCallback(async () => {
    const removableReports = filteredGrantedReports.filter(
      (report) => !isOwnerReport(report, userId),
    )

    if (removableReports.length === 0) {
      return
    }

    const movingIds = new Set(removableReports.map((report) => report.id))

    await persistGrantedReports(
      grantedReports.filter((report) => !movingIds.has(report.id)),
      [...availableReports, ...removableReports],
    )
  }, [availableReports, filteredGrantedReports, grantedReports, persistGrantedReports, userId])

  const moveItem = useCallback(
    async (fromSide: AccessColumn, reportId: number) => {
      if (fromSide === 'available') {
        const movingReport = availableReports.find((report) => report.id === reportId)
        if (!movingReport) {
          return
        }

        await persistGrantedReports(
          [...grantedReports, movingReport],
          availableReports.filter((report) => report.id !== reportId),
        )
        return
      }

      const movingReport = grantedReports.find((report) => report.id === reportId)
      if (!movingReport || isOwnerReport(movingReport, userId)) {
        return
      }

      await persistGrantedReports(
        grantedReports.filter((report) => report.id !== reportId),
        [...availableReports, movingReport],
      )
    },
    [availableReports, grantedReports, persistGrantedReports, userId],
  )

  const controlsDisabled =
    isUserBlocked ||
    (accessQuery.isLoading && !accessQuery.data) ||
    persistMutation.isPending ||
    aiKnowledgeMutation.isPending

  const toggleAiKnowledge = useCallback(
    async (reportId: number) => {
      const report = grantedReports.find((item) => item.id === reportId)
      if (!report) {
        return
      }

      const previousGranted = grantedReports
      const nextValue = !report.permitirConhecimentoIa

      setGrantedReports((current) =>
        sortAccessReports(
          current.map((item) =>
            item.id === reportId
              ? { ...item, permitirConhecimentoIa: nextValue }
              : item,
          ),
        ),
      )

      try {
        await aiKnowledgeMutation.mutateAsync({
          reportId,
          permitirConhecimentoIa: nextValue,
        })
      } catch {
        setGrantedReports(previousGranted)
      }
    },
    [aiKnowledgeMutation, grantedReports],
  )

  return {
    availableReports,
    grantedReports,
    filteredAvailableReports,
    filteredGrantedReports,
    selectedAvailableIds,
    selectedGrantedIds,
    availableSearch,
    setAvailableSearch,
    grantedSearch,
    setGrantedSearch,
    toggleReportSelection,
    toggleSelectAll,
    isAllSelected,
    moveSelectedRight,
    moveAllRight,
    moveSelectedLeft,
    moveAllLeft,
    moveItem,
    isLoading: accessQuery.isLoading,
    isSaving: persistMutation.isPending || aiKnowledgeMutation.isPending,
    isError: accessQuery.isError,
    loadError: accessQuery.error,
    errorMessage,
    controlsDisabled,
    isUserBlocked,
    isOwnerReportId,
    toggleAiKnowledge,
    refresh: accessQuery.refetch,
  }
}
