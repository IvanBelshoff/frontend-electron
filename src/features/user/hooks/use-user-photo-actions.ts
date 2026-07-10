import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  deleteUserPhoto,
  getManagedUserById,
  updateUserPhoto,
} from '@/features/user/user-api'
import { useUserPhotoCropState } from '@/features/user/hooks/use-user-photo-crop-state'
import { mergeManagedUserAfterUpdate } from '@/features/user/user-mapper'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const USERS_FETCH_LIMIT = 100

function getPhotoActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível atualizar a foto do usuário.'
}

export function useUserPhotoActions(
  userId: number,
  options: { disabled?: boolean } = {},
) {
  const { disabled = false } = options
  const queryClient = useQueryClient()
  const cropState = useUserPhotoCropState()
  const [photoVersion, setPhotoVersion] = useState(() => Date.now())

  const updateDetailCache = useCallback(
    (updatedUser: ManagedUser) => {
      queryClient.setQueryData<ManagedUser>(queryKeys.user.detail(userId), (previous) => {
        if (!previous) {
          return updatedUser
        }

        return mergeManagedUserAfterUpdate(previous, updatedUser)
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.user.list({ limit: USERS_FETCH_LIMIT }),
      })
      setPhotoVersion(Date.now())
    },
    [queryClient, userId],
  )

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const croppedPhoto = await cropState.getCroppedBlob()
      return updateUserPhoto(userId, croppedPhoto)
    },
    onSuccess: (updatedUser) => {
      updateDetailCache(updatedUser)
      cropState.setError(null)
      cropState.clearSelection()
    },
    onError: (mutationError) => {
      cropState.setError(getPhotoActionErrorMessage(mutationError))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteUserPhoto(userId)
      return getManagedUserById(userId)
    },
    onSuccess: (updatedUser) => {
      updateDetailCache(updatedUser)
      cropState.setError(null)
    },
    onError: (mutationError) => {
      cropState.setError(getPhotoActionErrorMessage(mutationError))
    },
  })

  const confirmEdit = useCallback(async () => {
    if (disabled) {
      return
    }

    try {
      await uploadMutation.mutateAsync()
    } catch {
      // Error state is handled by the mutation onError callback.
    }
  }, [disabled, uploadMutation])

  const deletePhoto = useCallback(async () => {
    if (disabled) {
      return
    }

    try {
      await deleteMutation.mutateAsync()
    } catch {
      // Error state is handled by the mutation onError callback.
    }
  }, [deleteMutation, disabled])

  return {
    isDialogOpen: cropState.isDialogOpen,
    previewUrl: cropState.previewUrl,
    crop: cropState.crop,
    zoom: cropState.zoom,
    rotation: cropState.rotation,
    error: cropState.error,
    photoVersion,
    isSaving: uploadMutation.isPending || cropState.isProcessing,
    isDeleting: deleteMutation.isPending,
    selectPhoto: cropState.selectPhoto,
    setCrop: cropState.setCrop,
    setZoom: cropState.setZoom,
    onCropComplete: cropState.onCropComplete,
    rotatePhoto: cropState.rotatePhoto,
    resetAdjustments: cropState.resetAdjustments,
    cancelEdit: cropState.cancelEdit,
    confirmEdit,
    deletePhoto,
  }
}
