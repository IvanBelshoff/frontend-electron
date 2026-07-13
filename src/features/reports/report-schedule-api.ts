import {
  mapAgendamentoExecucoesFromApi,
  mapReportSnapshotScheduleFromApi,
  type AgendamentoExecucaoApiRecord,
  type ReportSnapshotScheduleApiRecord,
} from '@/features/reports/report-schedule-mapper'
import type {
  AgendamentoExecucao,
  CreateReportSnapshotScheduleInput,
  ReportSnapshotSchedule,
} from '@/features/reports/report-schedule-types'
import { apiRequest } from '@/lib/api-client'

function mapCreateInputToApiBody(input: CreateReportSnapshotScheduleInput) {
  return {
    nome: input.nome,
    ativo: input.ativo,
    intervalo: input.intervalo,
    frequencia: input.frequencia,
    timezone: input.timezone,
    hora_inicio: input.horaInicio ?? null,
    dias_semana: input.diasSemana ?? [],
    horas: input.horas ?? [],
    minutos: input.minutos ?? [0],
    parametros_snapshot: input.parametrosSnapshot ?? {},
  }
}

export async function getReportSnapshotSchedule(
  reportId: number,
): Promise<ReportSnapshotSchedule | null> {
  const data = await apiRequest<ReportSnapshotScheduleApiRecord | null>(
    `/relatorios/${reportId}/agendamento-snapshot`,
  )

  return mapReportSnapshotScheduleFromApi(data)
}

export async function createReportSnapshotSchedule(
  reportId: number,
  input: CreateReportSnapshotScheduleInput,
): Promise<ReportSnapshotSchedule> {
  const data = await apiRequest<ReportSnapshotScheduleApiRecord>(
    `/relatorios/${reportId}/agendamento-snapshot`,
    {
      method: 'POST',
      body: mapCreateInputToApiBody(input),
    },
  )

  const mapped = mapReportSnapshotScheduleFromApi(data)

  if (!mapped) {
    throw new Error('Resposta inválida ao criar agendamento')
  }

  return mapped
}

export async function deleteReportSnapshotSchedule(reportId: number): Promise<void> {
  await apiRequest<void>(`/relatorios/${reportId}/agendamento-snapshot`, {
    method: 'DELETE',
  })
}

export async function listReportSnapshotScheduleExecutions(
  reportId: number,
): Promise<AgendamentoExecucao[]> {
  const data = await apiRequest<AgendamentoExecucaoApiRecord[]>(
    `/relatorios/${reportId}/agendamento-snapshot/execucoes`,
  )

  return mapAgendamentoExecucoesFromApi(data ?? [])
}
