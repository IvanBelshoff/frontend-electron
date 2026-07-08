import type { ParametroRelatorio } from '@/features/reports/report-types'

export function formatReportParamDefaults(
  parametros: ParametroRelatorio[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  for (const parametro of parametros) {
    if (parametro.padrao !== undefined && parametro.padrao !== null) {
      values[parametro.nome] = parametro.padrao
      continue
    }

    switch (parametro.tipo) {
      case 'string':
        values[parametro.nome] = ''
        break
      case 'number':
        values[parametro.nome] = ''
        break
      case 'date':
        values[parametro.nome] = ''
        break
      case 'boolean':
        values[parametro.nome] = false
        break
      case 'enum':
        values[parametro.nome] = parametro.valores?.[0] ?? ''
        break
    }
  }

  return values
}
