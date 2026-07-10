import { useMutation } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { notify } from '@/features/notifications/notification-api'
import { updateUserPassword } from '@/features/user/user-api'
import {
  EMPTY_USER_PASSWORD_DRAFT,
  type UserPasswordDraft,
  type UserPasswordFieldErrors,
} from '@/features/user/user-edit-types'
import {
  parseUserPasswordFieldErrors,
  validateUserPasswordDraft,
} from '@/features/user/user-validation'

export function useUserPasswordState(userId: number, options: { disabled?: boolean } = {}) {
  const { disabled = false } = options
  const [draft, setDraft] = useState<UserPasswordDraft>(EMPTY_USER_PASSWORD_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<UserPasswordFieldErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isDirty = useMemo(
    () => draft.senha.length > 0 || draft.confirmarSenha.length > 0,
    [draft.confirmarSenha, draft.senha],
  )

  const saveMutation = useMutation({
    mutationFn: (senha: string) => updateUserPassword(userId, senha),
    onSuccess: () => {
      setDraft(EMPTY_USER_PASSWORD_DRAFT)
      setFieldErrors({})
      setSaveSuccess(true)
      notify.success('Senha alterada com sucesso.')
    },
    onError: (error) => {
      setFieldErrors(parseUserPasswordFieldErrors(error))
      setSaveSuccess(false)
      const message =
        error instanceof Error ? error.message : 'Não foi possível alterar a senha.'
      notify.error(message)
    },
  })

  const updateDraft = useCallback((patch: Partial<UserPasswordDraft>) => {
    if (disabled) {
      return
    }

    setDraft((current) => ({ ...current, ...patch }))
    setFieldErrors({})
    setSaveSuccess(false)
  }, [disabled])

  const cancelPassword = useCallback(() => {
    setDraft(EMPTY_USER_PASSWORD_DRAFT)
    setFieldErrors({})
    setSaveSuccess(false)
  }, [])

  const savePassword = useCallback(async () => {
    if (disabled) {
      return
    }

    const validationErrors = validateUserPasswordDraft(draft)

    if (validationErrors.senha || validationErrors.confirmarSenha) {
      setFieldErrors(validationErrors)
      setSaveSuccess(false)
      return
    }

    await saveMutation.mutateAsync(draft.senha)
  }, [disabled, draft, saveMutation])

  return {
    draft,
    updateDraft,
    fieldErrors,
    isDirty,
    saveSuccess,
    savePassword,
    cancelPassword,
    isSaving: saveMutation.isPending,
    disabled,
  }
}
