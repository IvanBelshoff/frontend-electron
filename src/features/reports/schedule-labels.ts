import type { AgendamentoFrequencia } from '@/features/reports/report-schedule-types'

const FREQUENCIA_LABELS: Record<AgendamentoFrequencia, string> = {
  minuto: 'Minuto',
  hora: 'Hora',
  dia: 'Dia',
  semana: 'Semana',
  mes: 'Mês',
}

const DIA_SEMANA_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function getFrequenciaLabel(frequencia: AgendamentoFrequencia): string {
  return FREQUENCIA_LABELS[frequencia]
}

export function formatDiasSemana(dias: number[]): string {
  if (dias.length === 0) {
    return '—'
  }

  return [...dias]
    .sort((a, b) => a - b)
    .map((dia) => DIA_SEMANA_LABELS[dia] ?? String(dia))
    .join(', ')
}

export function formatHorasMinutos(horas: number[], minutos: number[]): string {
  const horasFmt = horas.length > 0 ? horas.join(', ') : '0'
  const minutosFmt = minutos.length > 0 ? minutos.join(', ') : '0'
  return `${horasFmt}h ${minutosFmt}min`
}

export function describeScheduleSummary(input: {
  frequencia: AgendamentoFrequencia
  intervalo: number
  diasSemana: number[]
  horas: number[]
  minutos: number[]
}): string {
  switch (input.frequencia) {
    case 'minuto':
      return `A cada ${input.intervalo} minuto(s)`
    case 'hora':
      return `A cada ${input.intervalo} hora(s)`
    case 'dia':
      return `Diariamente às ${formatHorasMinutos(input.horas, input.minutos)}`
    case 'semana':
      return `Semanalmente (${formatDiasSemana(input.diasSemana)}) às ${formatHorasMinutos(input.horas, input.minutos)}`
    case 'mes':
      return `Mensalmente no dia 1 às ${formatHorasMinutos(input.horas, input.minutos)}`
    default:
      return 'Recorrência personalizada'
  }
}

export const FREQUENCIA_OPTIONS: AgendamentoFrequencia[] = [
  'minuto',
  'hora',
  'dia',
  'semana',
  'mes',
]
