import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getReport, updateReport } from '@/features/reports/report-api'
import {
  areReportDraftsEqual,
  mapReportToEditDraft,
} from '@/features/reports/report-mapper'
import type {
  Report,
  ReportEditDraft,
  ReportEditTab,
  ReportFieldErrors,
} from '@/features/reports/report-types'
import {
  parseReportFieldErrors,
  validateReportDraft,
} from '@/features/reports/report-validation'
import { queryKeys } from '@/lib/query-keys'

const REPORTS_FETCH_LIMIT = 100

export function useReportEditState(reportId: number) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ReportEditTab>('report')
  const [draft, setDraft] = useState<ReportEditDraft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ReportFieldErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const reportQuery = useQuery({
    queryKey: queryKeys.report.detail(reportId),
    queryFn: () => getReport(reportId),
    enabled: Number.isFinite(reportId) && reportId > 0,
  })

  const report = reportQuery.data

  useEffect(() => {
    if (!report) {
      return
    }

    setDraft(mapReportToEditDraft(report))
    setFieldErrors({})
    setSaveSuccess(false)
  }, [report])

  const originalDraft = useMemo(
    () => (report ? mapReportToEditDraft(report) : null),
    [report],
  )

  const isDirty = useMemo(() => {
    if (!draft || !originalDraft) {
      return false
    }

    return !areReportDraftsEqual(draft, originalDraft)
  }, [draft, originalDraft])

  const saveMutation = useMutation({
    mutationFn: (input: ReportEditDraft) => updateReport(reportId, input),
    onSuccess: (updatedReport: Report) => {
      queryClient.setQueryData<Report>(
        queryKeys.report.detail(reportId),
        (previous) => ({
          ...updatedReport,
          usuarios: updatedReport.usuarios ?? previous?.usuarios,
        }),
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.report.list({ limit: REPORTS_FETCH_LIMIT }),
      })
      setDraft(mapReportToEditDraft(updatedReport))
      setFieldErrors({})
      setSaveSuccess(true)
    },
    onError: (error) => {
      setFieldErrors(parseReportFieldErrors(error))
      setSaveSuccess(false)
    },
  })

  const updateDraft = useCallback((patch: Partial<ReportEditDraft>) => {
    setDraft((current) => {
      if (!current) {
        return current
      }

      const next = { ...current, ...patch }

      if (patch.temporario === false) {
        next.dataExpiracaoInicial = null
        next.dataExpiracaoFinal = null
      }

      return next
    })
    setFieldErrors({})
    setSaveSuccess(false)
  }, [])

  const cancelEdit = useCallback(() => {
    if (!originalDraft) {
      return
    }

    setDraft({ ...originalDraft })
    setFieldErrors({})
    setSaveSuccess(false)
  }, [originalDraft])

  const saveEdit = useCallback(async () => {
    if (!draft) {
      return
    }

    const validationErrors = validateReportDraft(draft)

    if (
      validationErrors.nome ||
      validationErrors.query ||
      validationErrors.idConexao ||
      validationErrors.general
    ) {
      setFieldErrors(validationErrors)
      setSaveSuccess(false)
      return
    }

    await saveMutation.mutateAsync(draft)
  }, [draft, saveMutation])

  const refresh = useCallback(async () => {
    await reportQuery.refetch()
  }, [reportQuery])

  return {
    report,
    draft,
    activeTab,
    setActiveTab,
    updateDraft,
    isDirty,
    fieldErrors,
    saveSuccess,
    saveEdit,
    cancelEdit,
    refresh,
    isLoading: reportQuery.isLoading,
    isError: reportQuery.isError,
    error: reportQuery.error,
    isSaving: saveMutation.isPending,
    isRefreshing: reportQuery.isFetching && !reportQuery.isLoading,
  }
}
