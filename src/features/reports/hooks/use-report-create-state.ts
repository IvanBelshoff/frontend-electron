import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { createReport } from '@/features/reports/report-api'
import type {
  ReportCreateSaveMode,
  ReportEditDraft,
  ReportFieldErrors,
} from '@/features/reports/report-types'
import { INITIAL_REPORT_CREATE_DRAFT } from '@/features/reports/report-types'
import {
  parseReportFieldErrors,
  validateReportDraft,
} from '@/features/reports/report-validation'
import { queryKeys } from '@/lib/query-keys'

const REPORTS_FETCH_LIMIT = 100

type CreateReportMutationInput = {
  draft: ReportEditDraft
  mode: ReportCreateSaveMode
}

export function useReportCreateState() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ReportEditDraft>(INITIAL_REPORT_CREATE_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<ReportFieldErrors>({})

  const createMutation = useMutation({
    mutationFn: ({ draft: input }: CreateReportMutationInput) => createReport(input),
    onSuccess: async (createdReport, { mode }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.report.list({ limit: REPORTS_FETCH_LIMIT }),
      })

      if (mode === 'edit') {
        void navigate({
          to: '/relatorios/$relatorioId/editar',
          params: { relatorioId: String(createdReport.id) },
        })
        return
      }

      void navigate({ to: '/relatorios/gerenciar' })
    },
    onError: (error) => {
      setFieldErrors(parseReportFieldErrors(error))
    },
  })

  const updateDraft = useCallback((patch: Partial<ReportEditDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch }

      if (patch.temporario === false) {
        next.dataExpiracaoInicial = null
        next.dataExpiracaoFinal = null
      }

      return next
    })
    setFieldErrors({})
  }, [])

  const save = useCallback(
    async (mode: ReportCreateSaveMode) => {
      const validationErrors = validateReportDraft(draft)

      if (
        validationErrors.nome ||
        validationErrors.query ||
        validationErrors.idConexao ||
        validationErrors.general
      ) {
        setFieldErrors(validationErrors)
        return
      }

      await createMutation.mutateAsync({ draft, mode })
    },
    [createMutation, draft],
  )

  const saveToList = useCallback(async () => {
    await save('list')
  }, [save])

  const saveAndEdit = useCallback(async () => {
    await save('edit')
  }, [save])

  return {
    draft,
    updateDraft,
    fieldErrors,
    saveToList,
    saveAndEdit,
    isSaving: createMutation.isPending,
  }
}
