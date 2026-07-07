import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Area, Point } from 'react-easy-crop'
import {
  deleteUserPhoto,
  getManagedUserById,
  updateUserPhoto,
} from '@/features/user/user-api'
import { mergeManagedUserAfterUpdate } from '@/features/user/user-mapper'
import { getCroppedPhotoBlob } from '@/features/user/user-photo-crop'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'
import { queryKeys } from '@/lib/query-keys'

const USERS_FETCH_LIMIT = 100
const MAX_PHOTO_SIZE = 4 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function getPhotoActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível atualizar a foto do usuário.'
}

function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return 'A foto deve ser uma imagem JPEG, PNG ou WebP.'
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return 'A foto deve ter no máximo 4 MB.'
  }

  return null
}

export function useUserPhotoActions(userId: number) {
  const queryClient = useQueryClient()
  const croppedAreaPixelsRef = useRef<Area | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [photoVersion, setPhotoVersion] = useState(() => Date.now())

  const resetTransform = useCallback(() => {
    croppedAreaPixelsRef.current = null
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }, [])

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

  const clearSelection = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current)
      }

      return null
    })
    resetTransform()
  }, [resetTransform])

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !previewUrl) {
        throw new Error('Selecione uma foto antes de confirmar.')
      }

      const croppedAreaPixels = croppedAreaPixelsRef.current

      if (!croppedAreaPixels) {
        throw new Error('Aguarde o carregamento da prévia antes de confirmar.')
      }

      const croppedPhoto = await getCroppedPhotoBlob(previewUrl, croppedAreaPixels, rotation)
      return updateUserPhoto(userId, croppedPhoto)
    },
    onSuccess: (updatedUser) => {
      updateDetailCache(updatedUser)
      setError(null)
      clearSelection()
    },
    onError: (mutationError) => {
      setError(getPhotoActionErrorMessage(mutationError))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteUserPhoto(userId)
      return getManagedUserById(userId)
    },
    onSuccess: (updatedUser) => {
      updateDetailCache(updatedUser)
      setError(null)
    },
    onError: (mutationError) => {
      setError(getPhotoActionErrorMessage(mutationError))
    },
  })

  const selectPhoto = useCallback(
    (file: File | null) => {
      if (!file) {
        return
      }

      const validationError = validatePhotoFile(file)

      if (validationError) {
        clearSelection()
        setError(validationError)
        return
      }

      clearSelection()
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    },
    [clearSelection],
  )

  const setZoomClamped = useCallback((nextZoom: number) => {
    setZoom(Math.min(3, Math.max(1, nextZoom)))
  }, [])

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels
  }, [])

  const rotatePhoto = useCallback(() => {
    setRotation((current) => (current + 90) % 360)
  }, [])

  const resetAdjustments = useCallback(() => {
    resetTransform()
    setError(null)
  }, [resetTransform])

  const cancelEdit = useCallback(() => {
    clearSelection()
    setError(null)
  }, [clearSelection])

  const confirmEdit = useCallback(async () => {
    try {
      await uploadMutation.mutateAsync()
    } catch {
      // Error state is handled by the mutation onError callback.
    }
  }, [uploadMutation])

  const deletePhoto = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync()
    } catch {
      // Error state is handled by the mutation onError callback.
    }
  }, [deleteMutation])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return {
    isDialogOpen: Boolean(selectedFile && previewUrl),
    previewUrl,
    crop,
    zoom,
    rotation,
    error,
    photoVersion,
    isSaving: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    selectPhoto,
    setCrop,
    setZoom: setZoomClamped,
    onCropComplete,
    rotatePhoto,
    resetAdjustments,
    cancelEdit,
    confirmEdit,
    deletePhoto,
  }
}
