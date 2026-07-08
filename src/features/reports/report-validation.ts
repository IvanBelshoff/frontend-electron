import { ApiError } from '@/features/auth/auth-types'
import type { ReportEditDraft, ReportFieldErrors } from '@/features/reports/report-types'

function formatValidationErrorMessage(errors: unknown): string | undefined {
  if (!errors || typeof errors !== 'object') {
    return undefined
  }

  const messages: string[] = []

  const collect = (node: unknown, prefix = ''): void => {
    if (!node || typeof node !== 'object') {
      return
    }

    const record = node as Record<string, unknown>

    if (Array.isArray(record.errors)) {
      for (const item of record.errors) {
        messages.push(prefix ? `${prefix}: ${String(item)}` : String(item))
      }
    }

    if (record.properties && typeof record.properties === 'object') {
      for (const [field, value] of Object.entries(
        record.properties as Record<string, unknown>,
      )) {
        collect(value, prefix ? `${prefix}.${field}` : field)
      }
    }
  }

  collect(errors)

  if (messages.length > 0) {
    return messages.join(' ')
  }

  const entries = Object.entries(errors as Record<string, unknown>)
  const flatMessages = entries.flatMap(([field, value]) => {
    if (typeof value === 'string') {
      return [`${field}: ${value}`]
    }

    if (Array.isArray(value)) {
      return value.map((item) => `${field}: ${String(item)}`)
    }

    if (value && typeof value === 'object' && 'errors' in value) {
      const nested = (value as { errors?: unknown[] }).errors
      if (Array.isArray(nested) && nested.length > 0) {
        return [`${field}: ${String(nested[0])}`]
      }
    }

    return []
  })

  return flatMessages.length > 0 ? flatMessages.join(' ') : undefined
}

export function parseReportFieldErrors(error: unknown): ReportFieldErrors {
  if (error instanceof ApiError && error.statusCode === 400) {
    const body = error.body as { errors?: unknown; message?: string } | undefined
    const fieldErrors: ReportFieldErrors = {
      general: formatValidationErrorMessage(body?.errors) ?? error.message,
    }

    return fieldErrors
  }

  if (!(error instanceof ApiError) || error.statusCode !== 409) {
    return { general: error instanceof Error ? error.message : 'Falha ao salvar relatório.' }
  }

  const body = error.body as { errors?: { nome?: string }; message?: string } | undefined
  const fieldErrors: ReportFieldErrors = {}

  if (body?.errors?.nome) fieldErrors.nome = body.errors.nome

  if (!fieldErrors.nome) {
    fieldErrors.general = error.message
  }

  return fieldErrors
}

export function validateReportDraft(draft: ReportEditDraft): ReportFieldErrors {
  const errors: ReportFieldErrors = {}

  if (!draft.nome.trim()) {
    errors.nome = 'Nome é obrigatório.'
  }

  if (!draft.query.trim()) {
    errors.query = 'Query é obrigatória.'
  }

  if (draft.idConexao == null) {
    errors.idConexao = 'Conexão é obrigatória.'
  }

  if (draft.temporario) {
    if (!draft.dataExpiracaoInicial) {
      errors.general = 'Data de expiração inicial é obrigatória para relatórios temporários.'
    }

    if (!draft.dataExpiracaoFinal) {
      errors.general = 'Data de expiração final é obrigatória para relatórios temporários.'
    }

    if (
      draft.dataExpiracaoInicial &&
      draft.dataExpiracaoFinal &&
      draft.dataExpiracaoFinal < draft.dataExpiracaoInicial
    ) {
      errors.general = 'A data final deve ser igual ou posterior à data inicial.'
    }
  }

  return errors
}
