import { useCallback, useEffect, useRef, useState } from 'react'
import type { Area, Point } from 'react-easy-crop'
import { getCroppedPhotoBlob } from '@/features/user/user-photo-crop'

export const MAX_PHOTO_SIZE = 4 * 1024 * 1024
export const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return 'A foto deve ser uma imagem JPEG, PNG ou WebP.'
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return 'A foto deve ter no máximo 4 MB.'
  }

  return null
}

export function useUserPhotoCropState() {
  const croppedAreaPixelsRef = useRef<Area | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const resetTransform = useCallback(() => {
    croppedAreaPixelsRef.current = null
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }, [])

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

  const getCroppedBlob = useCallback(async (): Promise<Blob> => {
    if (!selectedFile || !previewUrl) {
      throw new Error('Selecione uma foto antes de confirmar.')
    }

    const croppedAreaPixels = croppedAreaPixelsRef.current

    if (!croppedAreaPixels) {
      throw new Error('Aguarde o carregamento da prévia antes de confirmar.')
    }

    setIsProcessing(true)

    try {
      return await getCroppedPhotoBlob(previewUrl, croppedAreaPixels, rotation)
    } finally {
      setIsProcessing(false)
    }
  }, [previewUrl, rotation, selectedFile])

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
    isProcessing,
    selectPhoto,
    setCrop,
    setZoom: setZoomClamped,
    onCropComplete,
    rotatePhoto,
    resetAdjustments,
    cancelEdit,
    clearSelection,
    setError,
    getCroppedBlob,
  }
}
