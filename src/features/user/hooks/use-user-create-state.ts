import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import {
  copyUserAuthentication,
  copyUserDashboards,
  copyUserRelatorios,
  createUser,
  listUserIds,
} from '@/features/user/user-api'
import {
  INITIAL_USER_CREATE_DRAFT,
  type UserCreateDraft,
  type UserCreateFieldErrors,
  type UserCreateSaveMode,
} from '@/features/user/user-create-types'
import {
  parseUserCreateFieldErrors,
  validateUserCreateDraft,
} from '@/features/user/user-validation'
import { queryKeys } from '@/lib/query-keys'

const USERS_FETCH_LIMIT = 100

type CreateUserMutationInput = {
  draft: UserCreateDraft
  photo: Blob | null
  mode: UserCreateSaveMode
}

function hasValidationErrors(errors: UserCreateFieldErrors): boolean {
  return Boolean(
    errors.nome ||
      errors.sobrenome ||
      errors.email ||
      errors.senha ||
      errors.confirmarSenha ||
      errors.general,
  )
}

export function useUserCreateState() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createdUserIdRef = useRef<number | null>(null)
  const [draft, setDraft] = useState<UserCreateDraft>(INITIAL_USER_CREATE_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<UserCreateFieldErrors>({})
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)

  const userIdsQuery = useQuery({
    queryKey: queryKeys.user.ids,
    queryFn: listUserIds,
  })

  const createMutation = useMutation({
    mutationFn: async ({ draft: input, photo }: CreateUserMutationInput) => {
      const createdUser = await createUser({
        nome: input.nome.trim(),
        sobrenome: input.sobrenome.trim(),
        email: input.email.trim(),
        senha: input.senha,
        photo: photo ?? undefined,
      })

      createdUserIdRef.current = createdUser.id
      setCreatedUserId(createdUser.id)

      if (input.copyPermissionsFromId) {
        await copyUserAuthentication(createdUser.id, input.copyPermissionsFromId)
      }

      if (input.copyDashboardsFromId) {
        await copyUserDashboards(createdUser.id, input.copyDashboardsFromId)
      }

      if (input.copyRelatoriosFromId) {
        await copyUserRelatorios(createdUser.id, input.copyRelatoriosFromId)
      }

      return createdUser
    },
    onSuccess: async (createdUser, { mode }) => {
      createdUserIdRef.current = null
      setCreatedUserId(null)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.user.list({ limit: USERS_FETCH_LIMIT }),
      })

      if (mode === 'edit') {
        void navigate({
          to: '/usuarios/$userId/editar',
          params: { userId: String(createdUser.id) },
        })
        return
      }

      void navigate({ to: '/usuarios' })
    },
    onError: (error, variables) => {
      const parsedErrors = parseUserCreateFieldErrors(error)

      if (
        createdUserIdRef.current &&
        (variables.draft.copyPermissionsFromId ||
          variables.draft.copyDashboardsFromId ||
          variables.draft.copyRelatoriosFromId)
      ) {
        parsedErrors.general =
          parsedErrors.general ??
          'Usuário criado, mas falha ao copiar configurações. Edite o usuário para ajustar manualmente.'
      }

      setFieldErrors(parsedErrors)
    },
  })

  const updateDraft = useCallback((patch: Partial<UserCreateDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setFieldErrors({})
  }, [])

  const handlePhotoChange = useCallback(
    (photo: Blob | null, previewUrl: string | null) => {
      if (photoPreviewUrl && photoPreviewUrl !== previewUrl) {
        URL.revokeObjectURL(photoPreviewUrl)
      }

      setPhotoBlob(photo)
      setPhotoPreviewUrl(previewUrl)
    },
    [photoPreviewUrl],
  )

  const save = useCallback(
    async (mode: UserCreateSaveMode) => {
      const validationErrors = validateUserCreateDraft(draft)

      if (hasValidationErrors(validationErrors)) {
        setFieldErrors(validationErrors)
        return
      }

      await createMutation.mutateAsync({ draft, photo: photoBlob, mode })
    },
    [createMutation, draft, photoBlob],
  )

  const saveToList = useCallback(async () => {
    await save('list')
  }, [save])

  const saveAndEdit = useCallback(async () => {
    await save('edit')
  }, [save])

  return {
    draft,
    updateDraft,
    fieldErrors,
    photoPreviewUrl,
    handlePhotoChange,
  // GET /user/ids returns only active users (bloqueado === false) from the backend.
    userOptions: userIdsQuery.data ?? [],
    isLoadingUserOptions: userIdsQuery.isLoading,
    saveToList,
    saveAndEdit,
    isSaving: createMutation.isPending,
    createdUserId,
  }
}
