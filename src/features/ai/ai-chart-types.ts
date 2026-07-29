export type AiChartType = 'line' | 'bar' | 'area' | 'scatter'

export type AiChartAxisType = 'category' | 'number' | 'time'

export type AiChartSeries = {
  key: string
  label: string
}

export type AiChartValue = string | number | null

export type AiChartSpec = {
  type: AiChartType
  title: string
  subtitle?: string
  xAxis: {
    key: string
    label: string
    type: AiChartAxisType
  }
  yAxis?: {
    label?: string
    unit?: string
  }
  series: AiChartSeries[]
  data: Record<string, AiChartValue>[]
  source?: string
  footnote?: string
}

const CHART_TYPES: AiChartType[] = ['line', 'bar', 'area', 'scatter']

/**
 * O spec é validado por Zod no backend, mas o part chega como `unknown` pelo
 * stream: revalidamos o formato mínimo para nunca quebrar a bolha da mensagem.
 */
export function parseAiChartSpec(value: unknown): AiChartSpec | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as Partial<AiChartSpec>

  if (!candidate.type || !CHART_TYPES.includes(candidate.type)) {
    return null
  }

  if (typeof candidate.title !== 'string' || !candidate.title) {
    return null
  }

  if (
    typeof candidate.xAxis !== 'object' ||
    candidate.xAxis === null ||
    typeof candidate.xAxis.key !== 'string'
  ) {
    return null
  }

  if (!Array.isArray(candidate.series) || candidate.series.length === 0) {
    return null
  }

  if (!Array.isArray(candidate.data) || candidate.data.length === 0) {
    return null
  }

  return candidate as AiChartSpec
}
