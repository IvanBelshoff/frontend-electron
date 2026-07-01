import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { validateBackendConnection } from '@/features/settings/backend-api'
import type { ValidationState } from '@/features/settings/settings-types'
import {
  clearApiUrlOverride,
  getApiUrl,
  getDefaultApiUrl,
  normalizeBaseUrl,
  saveApiUrl,
} from '@/lib/config'

export function useBackendUrlSettings() {
  const [baseUrl, setBaseUrl] = useState(getApiUrl)
  const [draftUrl, setDraftUrl] = useState(baseUrl)
  const [isEditing, setIsEditing] = useState(false)
  const [validationState, setValidationState] = useState<ValidationState>({ status: 'idle' })
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null)

  const normalizedDraftUrl = useMemo(() => {
    try {
      return normalizeBaseUrl(draftUrl)
    } catch {
      return draftUrl.trim()
    }
  }, [draftUrl])

  const canSave =
    validationState.status === 'success' &&
    validatedUrl === normalizedDraftUrl &&
    normalizedDraftUrl !== baseUrl

  const validationMutation = useMutation({
    mutationFn: async () => {
      await validateBackendConnection(normalizedDraftUrl)
    },
    onMutate: () => {
      setValidationState({ status: 'loading' })
      setValidatedUrl(null)
    },
    onSuccess: () => {
      setValidatedUrl(normalizedDraftUrl)
      setValidationState({
        status: 'success',
        message: 'Conexão válida. O backend respondeu na rota raiz (/).',
      })
    },
    onError: (error) => {
      setValidationState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível validar a URL informada.',
      })
    },
  })

  useEffect(() => {
    setValidationState({ status: 'idle' })
    setValidatedUrl(null)
    validationMutation.reset()
  }, [draftUrl])

  function startEdit() {
    setDraftUrl(baseUrl)
    setIsEditing(true)
    setValidatedUrl(null)
    setValidationState({ status: 'idle' })
  }

  function cancelEdit() {
    setDraftUrl(baseUrl)
    setIsEditing(false)
    setValidatedUrl(null)
    setValidationState({ status: 'idle' })
  }

  function validate() {
    try {
      normalizeBaseUrl(draftUrl)
      validationMutation.mutate()
    } catch {
      setValidationState({
        status: 'error',
        message: 'URL inválida. Use http:// ou https://.',
      })
    }
  }

  function save() {
    if (!canSave) {
      return
    }

    const saved = saveApiUrl(normalizedDraftUrl)
    setBaseUrl(saved)
    setDraftUrl(saved)
    setIsEditing(false)
    setValidatedUrl(null)
    setValidationState({ status: 'idle' })
  }

  function restoreDefault() {
    clearApiUrlOverride()
    const restored = getDefaultApiUrl()
    setBaseUrl(restored)
    setDraftUrl(restored)
    setIsEditing(false)
    setValidatedUrl(restored)
    setValidationState({ status: 'success', message: 'URL padrão restaurada.' })
  }

  return {
    baseUrl,
    draftUrl,
    setDraftUrl,
    isEditing,
    validationState,
    canSave,
    isValidating: validationMutation.isPending,
    startEdit,
    cancelEdit,
    validate,
    save,
    restoreDefault,
  }
}
