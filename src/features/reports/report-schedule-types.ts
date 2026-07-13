export type AgendamentoFrequencia = 'minuto' | 'hora' | 'dia' | 'semana' | 'mes'

export type AgendamentoVinculoTipo = 'report_snapshot_refresh'

export type AgendamentoExecucaoStatus = 'started' | 'completed' | 'failed' | 'skipped'

export type Agendamento = {
  id: number
  nome: string
  ativo: boolean
  intervalo: number
  frequencia: AgendamentoFrequencia
  timezone: string
  horaInicio: string | null
  diasSemana: number[]
  horas: number[]
  minutos: number[]
  cronExpression: string
  proximaExecucao: string | null
  ultimaExecucao: string | null
  usuarioCadastrador: string | null
  usuarioAtualizador: string | null
  dataCriacao: string
  dataAtualizacao: string
}

export type AgendamentoVinculo = {
  id: number
  agendamentoId: number
  tipo: AgendamentoVinculoTipo
  entidadeTipo: string
  entidadeId: number
  payload: Record<string, unknown>
  ativo: boolean
  pgbossScheduleKey: string
  dataCriacao: string
  dataAtualizacao: string
}

export type AgendamentoExecucao = {
  id: number
  vinculoId: number
  status: AgendamentoExecucaoStatus
  jobId: string | null
  erro: string | null
  iniciadoEm: string
  concluidoEm: string | null
}

export type ReportSnapshotSchedule = {
  agendamento: Agendamento
  vinculo: AgendamentoVinculo
}

export type CreateReportSnapshotScheduleInput = {
  nome?: string
  ativo?: boolean
  intervalo?: number
  frequencia: AgendamentoFrequencia
  timezone?: string
  horaInicio?: string | null
  diasSemana?: number[]
  horas?: number[]
  minutos?: number[]
  parametrosSnapshot?: Record<string, unknown>
}

export type ReportScheduleDraft = {
  nome: string
  ativo: boolean
  intervalo: number
  frequencia: AgendamentoFrequencia
  timezone: string
  diasSemana: number[]
  horas: number[]
  minutos: number[]
}

export const DEFAULT_REPORT_SCHEDULE_DRAFT: ReportScheduleDraft = {
  nome: '',
  ativo: true,
  intervalo: 1,
  frequencia: 'dia',
  timezone: 'America/Sao_Paulo',
  diasSemana: [],
  horas: [8],
  minutos: [0],
}
