import type { TipoConexao } from '@/features/connections/connection-types'
import type { ParametroRelatorio } from '@/features/reports/report-types'

export type SqlCompletionItem = {
  label: string
  type: 'keyword' | 'function' | 'parameter'
  detail?: string
  insertText?: string
}

const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'ON',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'WITH',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'DISTINCT',
  'LIMIT',
  'OFFSET',
  'UNION',
  'UNION ALL',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'BETWEEN',
  'LIKE',
  'EXISTS',
  'ASC',
  'DESC',
]

const FUNCTIONS_BY_DIALECT: Record<TipoConexao, string[]> = {
  postgres: [
    'COALESCE',
    'NULLIF',
    'CAST',
    'NOW',
    'CURRENT_DATE',
    'DATE_TRUNC',
    'TO_CHAR',
    'TO_DATE',
    'EXTRACT',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
  ],
  mysql: [
    'COALESCE',
    'IFNULL',
    'CAST',
    'CURDATE',
    'CURTIME',
    'NOW',
    'DATE_FORMAT',
    'STR_TO_DATE',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
  ],
  mssql: [
    'COALESCE',
    'ISNULL',
    'CAST',
    'GETDATE',
    'DATEADD',
    'DATEDIFF',
    'FORMAT',
    'CONVERT',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
  ],
  oracle: [
    'NVL',
    'COALESCE',
    'CAST',
    'SYSDATE',
    'TO_DATE',
    'TO_CHAR',
    'TRUNC',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
  ],
}

const GENERIC_FUNCTIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CAST']

export function buildParameterCompletionItems(
  parametros: ParametroRelatorio[] = [],
): SqlCompletionItem[] {
  return parametros.map((parametro) => ({
    label: `:${parametro.nome}`,
    insertText: `:${parametro.nome}`,
    type: 'parameter',
    detail: parametro.label ?? `parâmetro (${parametro.tipo})`,
  }))
}

export function buildSqlCompletionItems(
  connectionTipo?: TipoConexao | null,
): SqlCompletionItem[] {
  const keywords: SqlCompletionItem[] = SQL_KEYWORDS.map((keyword) => ({
    label: keyword,
    type: 'keyword',
    detail: 'keyword',
  }))

  const functions = (connectionTipo ? FUNCTIONS_BY_DIALECT[connectionTipo] : GENERIC_FUNCTIONS).map(
    (name) => ({
      label: name,
      type: 'function' as const,
      detail: 'função',
      insertText: `${name}()`,
    }),
  )

  return [...keywords, ...functions]
}

export function filterCompletionItems(
  items: SqlCompletionItem[],
  prefix: string,
): SqlCompletionItem[] {
  const normalized = prefix.trim().toUpperCase()

  if (!normalized) {
    return items
  }

  return items.filter((item) => item.label.toUpperCase().includes(normalized))
}

export function filterParameterCompletionItems(
  items: SqlCompletionItem[],
  prefix: string,
): SqlCompletionItem[] {
  const normalized = prefix.startsWith(':') ? prefix.slice(1).toLowerCase() : prefix.toLowerCase()

  if (!normalized) {
    return items
  }

  return items.filter((item) =>
    item.label.slice(1).toLowerCase().startsWith(normalized),
  )
}
