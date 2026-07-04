import type { DashboardEditDraft, DashboardFieldErrors } from '@/features/dashboards/dashboard-types'
import { ApiError } from '@/features/auth/auth-types'

function formatValidationErrorMessage(errors: unknown): string | undefined {
  if (!errors || typeof errors !== 'object') {
    return undefined
  }

  const entries = Object.entries(errors as Record<string, unknown>)
  const messages = entries.flatMap(([field, value]) => {
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

  return messages.length > 0 ? messages.join(' ') : undefined
}

export function parseDashboardFieldErrors(error: unknown): DashboardFieldErrors {
  if (error instanceof ApiError && error.statusCode === 400) {
    const body = error.body as { errors?: unknown; message?: string } | undefined
    const fieldErrors: DashboardFieldErrors = {
      general: formatValidationErrorMessage(body?.errors) ?? error.message,
    }

    return fieldErrors
  }

  if (!(error instanceof ApiError) || error.statusCode !== 409) {
    return { general: error instanceof Error ? error.message : 'Falha ao salvar dashboard.' }
  }

  const body = error.body as { errors?: { nome?: string; url?: string }; message?: string } | undefined
  const fieldErrors: DashboardFieldErrors = {}

  if (body?.errors?.nome) fieldErrors.nome = body.errors.nome
  if (body?.errors?.url) fieldErrors.url = body.errors.url

  if (!fieldErrors.nome && !fieldErrors.url) {
    fieldErrors.general = error.message
  }

  return fieldErrors
}

export function validateDashboardDraft(draft: DashboardEditDraft): DashboardFieldErrors {
  const errors: DashboardFieldErrors = {}

  if (!draft.nome.trim()) {
    errors.nome = 'Nome é obrigatório.'
  }

  if (!draft.url.trim()) {
    errors.url = 'URL é obrigatória.'
  }

  if (draft.temporario) {
    if (!draft.dataExpiracaoInicial) {
      errors.general = 'Data de expiração inicial é obrigatória para dashboards temporários.'
    }

    if (!draft.dataExpiracaoFinal) {
      errors.general = 'Data de expiração final é obrigatória para dashboards temporários.'
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
