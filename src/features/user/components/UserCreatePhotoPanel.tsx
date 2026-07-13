import clsx from 'clsx'
import { useRef, type ChangeEvent } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import UserPhotoEditDialog from '@/features/user/components/UserPhotoEditDialog'
import { useUserPhotoCropState } from '@/features/user/hooks/use-user-photo-crop-state'
import { PlusIcon, TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

type UserCreatePhotoPanelProps = {
  nome: string
  sobrenome: string
  photoPreviewUrl: string | null
  onPhotoChange: (photo: Blob | null, previewUrl: string | null) => void
}

function getInitials(nome: string, sobrenome: string): string {
  const first = nome.trim().charAt(0)
  const last = sobrenome.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || 'U'
}

export default function UserCreatePhotoPanel({
  nome,
  sobrenome,
  photoPreviewUrl,
  onPhotoChange,
}: UserCreatePhotoPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cropState = useUserPhotoCropState()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    cropState.selectPhoto(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  const handleConfirmCrop = async () => {
    try {
      const croppedBlob = await cropState.getCroppedBlob()
      const previewUrl = URL.createObjectURL(croppedBlob)
      onPhotoChange(croppedBlob, previewUrl)
      cropState.clearSelection()
      cropState.setError(null)
    } catch (error) {
      cropState.setError(error instanceof Error ? error.message : 'Não foi possível processar a foto.')
    }
  }

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }
    onPhotoChange(null, null)
  }

  const displayName = [nome.trim(), sobrenome.trim()].filter(Boolean).join(' ') || 'Novo usuário'
  const initials = getInitials(nome, sobrenome)

  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
        Foto do usuário
      </span>

      <span
        className={clsx(
          'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-400/15 text-2xl font-semibold text-sky-300',
        )}
        aria-hidden="true"
      >
        <span className="absolute inset-0 flex items-center justify-center">{initials}</span>
        {photoPreviewUrl && (
          <img
            src={photoPreviewUrl}
            alt=""
            className="relative z-10 h-full w-full object-cover"
          />
        )}
      </span>

      <p className="mt-3 text-sm font-semibold text-vscode-text">{displayName}</p>

      {!photoPreviewUrl && (
        <p className="mt-1 text-xs text-vscode-text-muted">
          Foto padrão do sistema será usada.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        {photoPreviewUrl && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRemovePhoto}
            className="border-red-400/40 text-red-400"
          >
            <TrashIcon />
            Remover foto
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={cropState.isProcessing}
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon />
          {photoPreviewUrl ? 'Alterar foto' : 'Adicionar foto'}
        </Button>
      </div>

      {cropState.error && !cropState.isDialogOpen && (
        <div className="mt-3 w-full">
          <Alert variant="error">{cropState.error}</Alert>
        </div>
      )}

      <p className="mt-3 text-xs text-vscode-text-muted">
        Formatos aceitos: JPG, PNG ou WebP (até 4 MB).
      </p>

      <UserPhotoEditDialog
        isOpen={cropState.isDialogOpen}
        previewUrl={cropState.previewUrl}
        crop={cropState.crop}
        zoom={cropState.zoom}
        rotation={cropState.rotation}
        error={cropState.error}
        isSaving={cropState.isProcessing}
        onCropChange={cropState.setCrop}
        onZoomChange={cropState.setZoom}
        onRotationChange={cropState.setRotation}
        onCropComplete={cropState.onCropComplete}
        onReset={cropState.resetAdjustments}
        onCancel={cropState.cancelEdit}
        onConfirm={() => void handleConfirmCrop()}
      />
    </div>
  )
}
