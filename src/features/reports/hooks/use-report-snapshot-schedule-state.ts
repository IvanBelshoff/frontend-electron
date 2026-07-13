import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '@/features/auth/auth-types'
import { formatReportParamDefaults } from '@/features/reports/format-report-param-defaults'
import {
  createReportSnapshotSchedule,
  deleteReportSnapshotSchedule,
  getReportSnapshotSchedule,
  listReportSnapshotScheduleExecutions,
} from '@/features/reports/report-schedule-api'
import {
  mapScheduleDraftFromAgendamento,
  mapScheduleDraftToCreateInput,
} from '@/features/reports/report-schedule-mapper'
import {
  DEFAULT_REPORT_SCHEDULE_DRAFT,
  type ReportScheduleDraft,
} from '@/features/reports/report-schedule-types'
import type { Report } from '@/features/reports/report-types'
import { queryKeys } from '@/lib/query-keys'

const EXECUTIONS_POLL_MS = 30_000

function areScheduleDraftsEqual(a: ReportScheduleDraft, b: ReportScheduleDraft): boolean {
  return (
    a.nome === b.nome &&
    a.ativo === b.ativo &&
    a.intervalo === b.intervalo &&
    a.frequencia === b.frequencia &&
    a.timezone === b.timezone &&
    JSON.stringify(a.diasSemana) === JSON.stringify(b.diasSemana) &&
    JSON.stringify(a.horas) === JSON.stringify(b.horas) &&
    JSON.stringify(a.minutos) === JSON.stringify(b.minutos)
  )
}

export function useReportSnapshotScheduleState(
  reportId: number,
  report: Report | undefined,
  enabled: boolean,
) {
  const queryClient = useQueryClient()
  const [scheduleDraft, setScheduleDraft] = useState<ReportScheduleDraft>(
    DEFAULT_REPORT_SCHEDULE_DRAFT,
  )
  const [parametrosSnapshot, setParametrosSnapshot] = useState<Record<string, unknown>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isOffline = report?.estado === 'offline'
  const queryEnabled = enabled && isOffline && Number.isFinite(reportId) && reportId > 0

  const scheduleQuery = useQuery({
    queryKey: queryKeys.report.snapshotSchedule(reportId),
    queryFn: () => getReportSnapshotSchedule(reportId),
    enabled: queryEnabled,
  })

  const schedule = scheduleQuery.data ?? null
  const hasSchedule = schedule !== null

  const executionsQuery = useQuery({
    queryKey: queryKeys.report.snapshotScheduleExecutions(reportId),
    queryFn: () => listReportSnapshotScheduleExecutions(reportId),
    enabled: queryEnabled && hasSchedule,
    refetchInterval: queryEnabled && hasSchedule && scheduleDraft.ativo
      ? EXECUTIONS_POLL_MS
      : false,
  })

  const baselineDraft = useMemo(() => {
    if (schedule?.agendamento) {
      return mapScheduleDraftFromAgendamento(schedule.agendamento)
    }

    return {
      ...DEFAULT_REPORT_SCHEDULE_DRAFT,
      nome: report ? `Snapshot ${report.nome}` : '',
    }
  }, [schedule?.agendamento, report?.nome])

  const baselineParametros = useMemo(() => {
    const fromVinculo = schedule?.vinculo.payload?.parametros_snapshot

    if (fromVinculo && typeof fromVinculo === 'object') {
      return fromVinculo as Record<string, unknown>
    }

    if (report?.parametros) {
      return formatReportParamDefaults(report.parametros)
    }

    return {}
  }, [schedule?.vinculo.payload, report?.parametros])

  useEffect(() => {
    setScheduleDraft(baselineDraft)
    setParametrosSnapshot(baselineParametros)
    setSaveError(null)
    setSaveSuccess(false)
    setDeleteError(null)
  }, [baselineDraft, baselineParametros])

  const isDirty = useMemo(() => {
    return (
      !areScheduleDraftsEqual(scheduleDraft, baselineDraft) ||
      JSON.stringify(parametrosSnapshot) !== JSON.stringify(baselineParametros)
    )
  }, [scheduleDraft, baselineDraft, parametrosSnapshot, baselineParametros])

  const updateScheduleDraft = useCallback((patch: Partial<ReportScheduleDraft>) => {
    setScheduleDraft((current) => ({ ...current, ...patch }))
    setSaveSuccess(false)
  }, [])

  const invalidateScheduleQueries = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.report.snapshotSchedule(reportId),
    })
    await queryClient.invalidateQueries({
      queryKey: queryKeys.report.snapshotScheduleExecutions(reportId),
    })
  }, [queryClient, reportId])

  const createMutation = useMutation({
    mutationFn: (input: ReturnType<typeof mapScheduleDraftToCreateInput>) =>
      createReportSnapshotSchedule(reportId, input),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteReportSnapshotSchedule(reportId),
    onSuccess: async () => {
      setDeleteError(null)
      setSaveSuccess(false)
      await invalidateScheduleQueries()
    },
    onError: (error) => {
      setDeleteError(
        error instanceof Error ? error.message : 'Não foi possível remover o agendamento.',
      )
    },
  })

  const saveSchedule = useCallback(async () => {
    if (!report) {
      return
    }

    setSaveError(null)
    setSaveSuccess(false)

    const input = mapScheduleDraftToCreateInput(
      scheduleDraft,
      parametrosSnapshot,
      report.nome,
    )

    try {
      if (hasSchedule) {
        await deleteReportSnapshotSchedule(reportId)
      }

      await createReportSnapshotSchedule(reportId, input)
      setSaveError(null)
      setSaveSuccess(true)
      await invalidateScheduleQueries()
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        setSaveError('Já existe agendamento para este relatório.')
        return
      }

      setSaveError(
        error instanceof Error ? error.message : 'Não foi possível salvar o agendamento.',
      )
      await invalidateScheduleQueries()
    }
  }, [
    report,
    scheduleDraft,
    parametrosSnapshot,
    hasSchedule,
    reportId,
    invalidateScheduleQueries,
  ])

  const removeSchedule = useCallback(async () => {
    setDeleteError(null)
    await deleteMutation.mutateAsync()
  }, [deleteMutation])

  const refreshExecutions = useCallback(() => {
    void executionsQuery.refetch()
  }, [executionsQuery])

  return {
    schedule,
    hasSchedule,
    scheduleDraft,
    updateScheduleDraft,
    parametrosSnapshot,
    setParametrosSnapshot,
    executions: executionsQuery.data ?? [],
    isLoading: scheduleQuery.isLoading,
    isLoadingExecutions: executionsQuery.isLoading,
    isFetchingExecutions: executionsQuery.isFetching,
    isSaving: createMutation.isPending || deleteMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDirty,
    saveError,
    saveSuccess,
    deleteError,
    saveSchedule,
    removeSchedule,
    refreshExecutions,
    scheduleError: scheduleQuery.error,
    executionsError: executionsQuery.error,
  }
}
