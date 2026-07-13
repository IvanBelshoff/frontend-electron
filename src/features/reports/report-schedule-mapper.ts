import type {
  Agendamento,
  AgendamentoExecucao,
  AgendamentoExecucaoStatus,
  AgendamentoFrequencia,
  AgendamentoVinculo,
  AgendamentoVinculoTipo,
  CreateReportSnapshotScheduleInput,
  ReportScheduleDraft,
  ReportSnapshotSchedule,
} from '@/features/reports/report-schedule-types'

export type AgendamentoApiRecord = {
  id: number | string
  nome: string
  ativo: boolean
  intervalo: number
  frequencia: AgendamentoFrequencia
  timezone: string
  horaInicio?: string | null
  hora_inicio?: string | null
  diasSemana?: number[]
  dias_semana?: number[]
  horas?: number[]
  minutos?: number[]
  cronExpression?: string
  cron_expression?: string
  proximaExecucao?: string | null
  proxima_execucao?: string | null
  ultimaExecucao?: string | null
  ultima_execucao?: string | null
  usuarioCadastrador?: string | null
  usuario_cadastrador?: string | null
  usuarioAtualizador?: string | null
  usuario_atualizador?: string | null
  dataCriacao?: string
  data_criacao?: string
  dataAtualizacao?: string
  data_atualizacao?: string
}

export type AgendamentoVinculoApiRecord = {
  id: number | string
  agendamentoId?: number | string
  agendamento_id?: number | string
  tipo: AgendamentoVinculoTipo
  entidadeTipo?: string
  entidade_tipo?: string
  entidadeId?: number | string
  entidade_id?: number | string
  payload?: Record<string, unknown>
  ativo: boolean
  pgbossScheduleKey?: string
  pgboss_schedule_key?: string
  dataCriacao?: string
  data_criacao?: string
  dataAtualizacao?: string
  data_atualizacao?: string
}

export type AgendamentoExecucaoApiRecord = {
  id: number | string
  vinculoId?: number | string
  vinculo_id?: number | string
  status: AgendamentoExecucaoStatus
  jobId?: string | null
  job_id?: string | null
  erro?: string | null
  iniciadoEm?: string
  iniciado_em?: string
  concluidoEm?: string | null
  concluido_em?: string | null
}

export type ReportSnapshotScheduleApiRecord = {
  agendamento: AgendamentoApiRecord
  vinculo: AgendamentoVinculoApiRecord
}

function toIsoString(value: unknown): string | null {
  if (value == null) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return String(value)
}

function mapAgendamentoFromApi(record: AgendamentoApiRecord): Agendamento {
  return {
    id: Number(record.id),
    nome: record.nome,
    ativo: record.ativo,
    intervalo: record.intervalo,
    frequencia: record.frequencia,
    timezone: record.timezone,
    horaInicio: toIsoString(record.horaInicio ?? record.hora_inicio),
    diasSemana: record.diasSemana ?? record.dias_semana ?? [],
    horas: record.horas ?? [],
    minutos: record.minutos ?? [0],
    cronExpression: record.cronExpression ?? record.cron_expression ?? '',
    proximaExecucao: toIsoString(record.proximaExecucao ?? record.proxima_execucao),
    ultimaExecucao: toIsoString(record.ultimaExecucao ?? record.ultima_execucao),
    usuarioCadastrador: record.usuarioCadastrador ?? record.usuario_cadastrador ?? null,
    usuarioAtualizador: record.usuarioAtualizador ?? record.usuario_atualizador ?? null,
    dataCriacao: toIsoString(record.dataCriacao ?? record.data_criacao) ?? '',
    dataAtualizacao: toIsoString(record.dataAtualizacao ?? record.data_atualizacao) ?? '',
  }
}

function mapVinculoFromApi(record: AgendamentoVinculoApiRecord): AgendamentoVinculo {
  return {
    id: Number(record.id),
    agendamentoId: Number(record.agendamentoId ?? record.agendamento_id),
    tipo: record.tipo,
    entidadeTipo: record.entidadeTipo ?? record.entidade_tipo ?? '',
    entidadeId: Number(record.entidadeId ?? record.entidade_id),
    payload: record.payload ?? {},
    ativo: record.ativo,
    pgbossScheduleKey: record.pgbossScheduleKey ?? record.pgboss_schedule_key ?? '',
    dataCriacao: toIsoString(record.dataCriacao ?? record.data_criacao) ?? '',
    dataAtualizacao: toIsoString(record.dataAtualizacao ?? record.data_atualizacao) ?? '',
  }
}

export function mapReportSnapshotScheduleFromApi(
  record: ReportSnapshotScheduleApiRecord | null,
): ReportSnapshotSchedule | null {
  if (!record?.agendamento || !record?.vinculo) {
    return null
  }

  return {
    agendamento: mapAgendamentoFromApi(record.agendamento),
    vinculo: mapVinculoFromApi(record.vinculo),
  }
}

export function mapAgendamentoExecucaoFromApi(
  record: AgendamentoExecucaoApiRecord,
): AgendamentoExecucao {
  return {
    id: Number(record.id),
    vinculoId: Number(record.vinculoId ?? record.vinculo_id),
    status: record.status,
    jobId: record.jobId ?? record.job_id ?? null,
    erro: record.erro ?? null,
    iniciadoEm: toIsoString(record.iniciadoEm ?? record.iniciado_em) ?? '',
    concluidoEm: toIsoString(record.concluidoEm ?? record.concluido_em),
  }
}

export function mapAgendamentoExecucoesFromApi(
  records: AgendamentoExecucaoApiRecord[],
): AgendamentoExecucao[] {
  return records.map(mapAgendamentoExecucaoFromApi)
}

export function mapScheduleDraftFromAgendamento(agendamento: Agendamento): ReportScheduleDraft {
  return {
    nome: agendamento.nome,
    ativo: agendamento.ativo,
    intervalo: agendamento.intervalo,
    frequencia: agendamento.frequencia,
    timezone: agendamento.timezone,
    diasSemana: [...agendamento.diasSemana],
    horas: agendamento.horas.length > 0 ? [...agendamento.horas] : [0],
    minutos: agendamento.minutos.length > 0 ? [...agendamento.minutos] : [0],
  }
}

export function mapScheduleDraftToCreateInput(
  draft: ReportScheduleDraft,
  parametrosSnapshot: Record<string, unknown>,
  reportName: string,
): CreateReportSnapshotScheduleInput {
  return {
    nome: draft.nome.trim() || `Snapshot ${reportName}`,
    ativo: draft.ativo,
    intervalo: draft.intervalo,
    frequencia: draft.frequencia,
    timezone: draft.timezone,
    diasSemana: draft.frequencia === 'semana' ? draft.diasSemana : [],
    horas: draft.frequencia === 'minuto' || draft.frequencia === 'hora' ? [] : draft.horas,
    minutos: draft.frequencia === 'minuto' || draft.frequencia === 'hora' ? [0] : draft.minutos,
    parametrosSnapshot,
  }
}
