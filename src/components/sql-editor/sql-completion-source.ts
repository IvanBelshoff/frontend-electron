import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import type { TipoConexao } from '@/features/connections/connection-types'
import type { ParametroRelatorio } from '@/features/reports/report-types'
import {
  buildParameterCompletionItems,
  buildSqlCompletionItems,
  filterCompletionItems,
  filterParameterCompletionItems,
} from './sql-completion'

function toCompletionOptions(
  items: ReturnType<typeof buildSqlCompletionItems>,
) {
  return items.map((item) => ({
    label: item.label,
    type: item.type,
    detail: item.detail,
    apply: item.insertText ?? item.label,
  }))
}

export function createSqlCompletionSource(
  connectionTipo?: TipoConexao | null,
  parametros: ParametroRelatorio[] = [],
) {
  return (context: CompletionContext) => {
    const parameterMatch = context.matchBefore(/:\w*/)
    if (parameterMatch) {
      const prefix = parameterMatch.text
      const items = filterParameterCompletionItems(
        buildParameterCompletionItems(parametros),
        prefix,
      )

      if (items.length === 0 && !context.explicit) {
        return null
      }

      return {
        from: parameterMatch.from,
        options: toCompletionOptions(items),
      }
    }

    const wordMatch = context.matchBefore(/[\w.]+/)
    if (!wordMatch && !context.explicit) {
      return null
    }

    const prefix = wordMatch?.text ?? ''
    const items = filterCompletionItems(buildSqlCompletionItems(connectionTipo), prefix)

    if (items.length === 0) {
      return null
    }

    return {
      from: wordMatch?.from ?? context.pos,
      options: toCompletionOptions(items),
    }
  }
}

export function createSqlAutocompleteExtension(
  connectionTipo?: TipoConexao | null,
  parametros: ParametroRelatorio[] = [],
) {
  return autocompletion({
    override: [createSqlCompletionSource(connectionTipo, parametros)],
    activateOnTyping: true,
    defaultKeymap: true,
  })
}
