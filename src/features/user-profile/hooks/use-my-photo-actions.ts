import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { deleteUserPhoto } from '@/features/user/user-api'
import { uploadMyPhoto } from '@/features/user-inbox/user-inbox-api'
import { useUserPhotoCropState } from '@/features/user/hooks/use-user-photo-crop-state'
import { ApiError } from '@/features/auth/auth-types'
import { bumpUserPhotoVersion, useUserPhotoVersion } from '@/features/user/use-current-user'
import { queryKeys } from '@/lib/query-keys'
function getPhotoActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível atualizar a foto do usuário.'
}

export function useMyPhotoActions(userId: number) {
  const queryClient = useQueryClient()
  const cropState = useUserPhotoCropState()
  const { data: photoVersion = 0 } = useUserPhotoVersion(userId)

  const refreshUserCaches = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
    bumpUserPhotoVersion(queryClient, userId)
  }, [queryClient, userId])
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const croppedPhoto = await cropState.getCroppedBlob()
      await uploadMyPhoto(croppedPhoto)
    },
    onSuccess: () => {
      refreshUserCaches()
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
    },
    onSuccess: () => {
      refreshUserCaches()
      cropState.setError(null)
    },
    onError: (mutationError) => {
      cropState.setError(getPhotoActionErrorMessage(mutationError))
    },
  })

  const confirmEdit = useCallback(async () => {
    try {
      await uploadMutation.mutateAsync()
    } catch {
      // handled in mutation
    }
  }, [uploadMutation])

  const deletePhoto = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync()
    } catch {
      // handled in mutation
    }
  }, [deleteMutation])

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
    setRotation: cropState.setRotation,
    onCropComplete: cropState.onCropComplete,
    resetAdjustments: cropState.resetAdjustments,
    cancelEdit: cropState.cancelEdit,
    confirmEdit,
    deletePhoto,
  }
}
