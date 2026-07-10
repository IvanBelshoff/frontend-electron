import type { UserCreateDraft, UserCreateFieldErrors } from '@/features/user/user-create-types'
import type {
  UserEditDraft,
  UserFieldErrors,
  UserPasswordDraft,
  UserPasswordFieldErrors,
} from '@/features/user/user-edit-types'
import { ApiError } from '@/features/auth/auth-types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export function parseUserFieldErrors(error: unknown): UserFieldErrors {
  if (error instanceof ApiError && error.statusCode === 400) {
    const body = error.body as { errors?: Record<string, unknown>; message?: string } | undefined
    const errors = body?.errors

    if (errors && typeof errors === 'object') {
      const fieldErrors: UserFieldErrors = {}

      if (typeof errors.nome === 'string') fieldErrors.nome = errors.nome
      if (typeof errors.sobrenome === 'string') fieldErrors.sobrenome = errors.sobrenome
      if (typeof errors.email === 'string') fieldErrors.email = errors.email
      if (typeof errors.senha === 'string') fieldErrors.senha = errors.senha

      if (
        !fieldErrors.nome &&
        !fieldErrors.sobrenome &&
        !fieldErrors.email &&
        !fieldErrors.senha
      ) {
        fieldErrors.general = formatValidationErrorMessage(errors) ?? error.message
      }

      return fieldErrors
    }

    return {
      general: formatValidationErrorMessage(body?.errors) ?? error.message,
    }
  }

  if (error instanceof ApiError && error.statusCode === 409) {
    const body = error.body as { errors?: { email?: string }; message?: string } | undefined

    if (body?.errors?.email) {
      return { email: body.errors.email }
    }

    return { general: error.message }
  }

  return {
    general: error instanceof Error ? error.message : 'Falha ao salvar usuário.',
  }
}

export function validateUserDraft(draft: UserEditDraft): UserFieldErrors {
  const errors: UserFieldErrors = {}
  const nome = draft.nome.trim()
  const sobrenome = draft.sobrenome.trim()
  const email = draft.email.trim()

  if (!nome) {
    errors.nome = 'Nome é obrigatório.'
  } else if (nome.length < 3) {
    errors.nome = 'Nome deve possuir pelo menos 3 caracteres.'
  } else if (nome.length > 100) {
    errors.nome = 'Nome deve possuir no máximo 100 caracteres.'
  }

  if (!sobrenome) {
    errors.sobrenome = 'Sobrenome é obrigatório.'
  } else if (sobrenome.length < 3) {
    errors.sobrenome = 'Sobrenome deve possuir pelo menos 3 caracteres.'
  } else if (sobrenome.length > 100) {
    errors.sobrenome = 'Sobrenome deve possuir no máximo 100 caracteres.'
  }

  if (!email) {
    errors.email = 'E-mail é obrigatório.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'E-mail inválido.'
  }

  return errors
}

export function validatePasswordFields(
  senha: string,
  confirmarSenha: string,
): Pick<UserPasswordFieldErrors, 'senha' | 'confirmarSenha'> {
  const errors: Pick<UserPasswordFieldErrors, 'senha' | 'confirmarSenha'> = {}

  if (!senha) {
    errors.senha = 'Senha é obrigatória.'
  } else if (senha.length < 8) {
    errors.senha = 'A senha deve possuir no mínimo 8 caracteres.'
  } else if (senha.length > 100) {
    errors.senha = 'A senha deve possuir no máximo 100 caracteres.'
  }

  if (!confirmarSenha) {
    errors.confirmarSenha = 'Confirmação de senha é obrigatória.'
  } else if (confirmarSenha !== senha) {
    errors.confirmarSenha = 'As senhas não coincidem.'
  }

  return errors
}

export function parseUserPasswordFieldErrors(error: unknown): UserPasswordFieldErrors {
  const baseErrors = parseUserFieldErrors(error)

  return {
    senha: baseErrors.senha,
    confirmarSenha: undefined,
    general: baseErrors.general,
  }
}

export function validateUserPasswordDraft(draft: UserPasswordDraft): UserPasswordFieldErrors {
  const passwordErrors = validatePasswordFields(draft.senha, draft.confirmarSenha)

  return {
    senha: passwordErrors.senha,
    confirmarSenha: passwordErrors.confirmarSenha,
  }
}

export function parseUserCreateFieldErrors(error: unknown): UserCreateFieldErrors {
  const baseErrors = parseUserFieldErrors(error) as UserCreateFieldErrors
  return baseErrors
}

export function validateUserCreateDraft(draft: UserCreateDraft): UserCreateFieldErrors {
  const errors: UserCreateFieldErrors = {}
  const baseErrors = validateUserDraft({
    nome: draft.nome,
    sobrenome: draft.sobrenome,
    email: draft.email,
    bloqueado: false,
  })

  if (baseErrors.nome) errors.nome = baseErrors.nome
  if (baseErrors.sobrenome) errors.sobrenome = baseErrors.sobrenome
  if (baseErrors.email) errors.email = baseErrors.email
  if (baseErrors.general) errors.general = baseErrors.general

  const passwordErrors = validatePasswordFields(draft.senha, draft.confirmarSenha)
  if (passwordErrors.senha) errors.senha = passwordErrors.senha
  if (passwordErrors.confirmarSenha) errors.confirmarSenha = passwordErrors.confirmarSenha

  return errors
}
