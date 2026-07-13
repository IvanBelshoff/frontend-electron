import { useMutation } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { notify } from '@/features/notifications/notification-api'
import {
  changeMyPassword,
  type ChangeMyPasswordInput,
} from '@/features/user-inbox/user-inbox-api'
import {
  EMPTY_MY_PASSWORD_DRAFT,
  type MyPasswordDraft,
  type MyPasswordFieldErrors,
} from '@/features/user/user-edit-types'
import {
  parseMyPasswordFieldErrors,
  validateMyPasswordDraft,
} from '@/features/user/user-validation'

export function useMyPasswordActions(options: { disabled?: boolean } = {}) {
  const { disabled = false } = options
  const [draft, setDraft] = useState<MyPasswordDraft>(EMPTY_MY_PASSWORD_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<MyPasswordFieldErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isDirty = useMemo(
    () =>
      draft.senhaAtual.length > 0 ||
      draft.senha.length > 0 ||
      draft.confirmarSenha.length > 0,
    [draft.confirmarSenha, draft.senha, draft.senhaAtual],
  )

  const saveMutation = useMutation({
    mutationFn: (input: ChangeMyPasswordInput) => changeMyPassword(input),
    onSuccess: () => {
      setDraft(EMPTY_MY_PASSWORD_DRAFT)
      setFieldErrors({})
      setSaveSuccess(true)
      notify.success('Senha alterada com sucesso.')
    },
    onError: (error) => {
      setFieldErrors(parseMyPasswordFieldErrors(error))
      setSaveSuccess(false)
      const message =
        error instanceof Error ? error.message : 'Não foi possível alterar a senha.'
      notify.error(message)
    },
  })

  const updateDraft = useCallback(
    (patch: Partial<MyPasswordDraft>) => {
      if (disabled) {
        return
      }

      setDraft((current) => ({ ...current, ...patch }))
      setFieldErrors({})
      setSaveSuccess(false)
    },
    [disabled],
  )

  const cancelPassword = useCallback(() => {
    setDraft(EMPTY_MY_PASSWORD_DRAFT)
    setFieldErrors({})
    setSaveSuccess(false)
  }, [])

  const savePassword = useCallback(async (): Promise<boolean> => {
    if (disabled) {
      return false
    }

    const validationErrors = validateMyPasswordDraft(draft)

    if (
      validationErrors.senhaAtual ||
      validationErrors.senha ||
      validationErrors.confirmarSenha
    ) {
      setFieldErrors(validationErrors)
      setSaveSuccess(false)
      return false
    }

    try {
      await saveMutation.mutateAsync({
        senhaAtual: draft.senhaAtual,
        senha: draft.senha,
      })
      return true
    } catch {
      return false
    }
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
