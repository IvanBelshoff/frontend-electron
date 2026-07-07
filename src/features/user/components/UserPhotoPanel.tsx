import { useRef, type ChangeEvent } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import UserPhotoEditDialog from '@/features/user/components/UserPhotoEditDialog'
import { useUserPhotoActions } from '@/features/user/hooks/use-user-photo-actions'
import type { ManagedUser } from '@/features/user/user-list-types'
import { getUserDisplayName } from '@/features/user/user-list-types'
import UserAvatar from '@/features/user/UserAvatar'
import { PlusIcon, TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

type UserPhotoPanelProps = {
  user: ManagedUser
}

export default function UserPhotoPanel({ user }: UserPhotoPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayName = getUserDisplayName(user)
  const photoActions = useUserPhotoActions(user.id)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    photoActions.selectPhoto(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
        Foto do usuário
      </span>

      <UserAvatar
        userId={user.id}
        nome={user.nome}
        sobrenome={user.sobrenome}
        foto={user.foto}
        photoVersion={photoActions.photoVersion}
        shape="rounded-square"
        className="h-24 w-24 text-2xl"
      />

      <p className="mt-3 text-sm font-semibold text-vscode-text">{displayName}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={photoActions.isDeleting}
          disabled={photoActions.isSaving}
          onClick={() => void photoActions.deletePhoto()}
          className="border-red-400/40 text-red-400"
        >
          <TrashIcon />
          Excluir foto
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={photoActions.isDeleting || photoActions.isSaving}
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon />
          Alterar foto
        </Button>
      </div>

      {photoActions.error && !photoActions.isDialogOpen && (
        <div className="mt-3 w-full">
          <Alert variant="error">{photoActions.error}</Alert>
        </div>
      )}

      <p className="mt-3 text-xs text-vscode-text-muted">
        Formatos aceitos: JPG, PNG ou WebP (até 4 MB).
      </p>

      <UserPhotoEditDialog
        isOpen={photoActions.isDialogOpen}
        previewUrl={photoActions.previewUrl}
        crop={photoActions.crop}
        zoom={photoActions.zoom}
        rotation={photoActions.rotation}
        error={photoActions.error}
        isSaving={photoActions.isSaving}
        onCropChange={photoActions.setCrop}
        onZoomChange={photoActions.setZoom}
        onCropComplete={photoActions.onCropComplete}
        onRotate={photoActions.rotatePhoto}
        onReset={photoActions.resetAdjustments}
        onCancel={photoActions.cancelEdit}
        onConfirm={() => void photoActions.confirmEdit()}
      />
    </div>
  )
}
