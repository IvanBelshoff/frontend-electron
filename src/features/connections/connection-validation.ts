import type {
  ConnectionEditDraft,
  ConnectionFieldErrors,
} from '@/features/connections/connection-types'
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

export function parseConnectionFieldErrors(error: unknown): ConnectionFieldErrors {
  if (error instanceof ApiError && error.statusCode === 400) {
    const body = error.body as { errors?: unknown; message?: string } | undefined
    return {
      general: formatValidationErrorMessage(body?.errors) ?? error.message,
    }
  }

  if (!(error instanceof ApiError) || error.statusCode !== 409) {
    return { general: error instanceof Error ? error.message : 'Falha ao salvar conexão.' }
  }

  const body = error.body as {
    errors?: {
      nome?: string
      host?: string
      porta?: string
      database?: string
      usuario?: string
      senha?: string
    }
    message?: string
  } | undefined

  const fieldErrors: ConnectionFieldErrors = {}

  if (body?.errors?.nome) fieldErrors.nome = body.errors.nome
  if (body?.errors?.host) fieldErrors.host = body.errors.host
  if (body?.errors?.porta) fieldErrors.porta = body.errors.porta
  if (body?.errors?.database) fieldErrors.database = body.errors.database
  if (body?.errors?.usuario) fieldErrors.usuario = body.errors.usuario
  if (body?.errors?.senha) fieldErrors.senha = body.errors.senha

  if (
    !fieldErrors.nome &&
    !fieldErrors.host &&
    !fieldErrors.porta &&
    !fieldErrors.database &&
    !fieldErrors.usuario &&
    !fieldErrors.senha
  ) {
    fieldErrors.general = error.message
  }

  return fieldErrors
}

type ValidateConnectionDraftOptions = {
  requirePassword?: boolean
}

export function validateConnectionDraft(
  draft: ConnectionEditDraft,
  options: ValidateConnectionDraftOptions = {},
): ConnectionFieldErrors {
  const errors: ConnectionFieldErrors = {}

  if (!draft.nome.trim()) {
    errors.nome = 'Nome é obrigatório.'
  }

  if (!draft.host.trim()) {
    errors.host = 'Host é obrigatório.'
  }

  if (!Number.isFinite(draft.porta) || draft.porta <= 0) {
    errors.porta = 'Porta deve ser um número maior que zero.'
  }

  if (!draft.database.trim()) {
    errors.database = 'Database é obrigatório.'
  }

  if (!draft.usuario.trim()) {
    errors.usuario = 'Usuário é obrigatório.'
  }

  if (options.requirePassword && !draft.senha.trim()) {
    errors.senha = 'Senha é obrigatória.'
  }

  const trimmedOpcoes = draft.opcoes.trim()
  if (trimmedOpcoes) {
    try {
      JSON.parse(trimmedOpcoes)
    } catch {
      errors.general = 'Opções devem ser um JSON válido.'
    }
  }

  return errors
}
