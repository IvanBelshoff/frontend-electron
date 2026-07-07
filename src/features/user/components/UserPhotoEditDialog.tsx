import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

type UserPhotoEditDialogProps = {
  isOpen: boolean
  previewUrl: string | null
  crop: Point
  zoom: number
  rotation: number
  error: string | null
  isSaving: boolean
  onCropChange: (crop: Point) => void
  onZoomChange: (zoom: number) => void
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void
  onRotate: () => void
  onReset: () => void
  onCancel: () => void
  onConfirm: () => void
}

export default function UserPhotoEditDialog({
  isOpen,
  previewUrl,
  crop,
  zoom,
  rotation,
  error,
  isSaving,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onRotate,
  onReset,
  onCancel,
  onConfirm,
}: UserPhotoEditDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Editar foto do usuário"
      onClose={isSaving ? () => undefined : onCancel}
      className="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="relative aspect-square w-full max-h-[28rem] overflow-hidden rounded-lg bg-vscode-input-bg">
          {previewUrl ? (
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="rect"
              minZoom={1}
              maxZoom={3}
              zoomWithScroll
              restrictPosition
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  backgroundColor: 'transparent',
                },
                cropAreaStyle: {
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '1rem',
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-vscode-text-muted">
              Selecione uma imagem para editar.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:pt-2">
          <label className="block space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-vscode-text">
              <span>Zoom</span>
              <span className="text-xs text-vscode-text-muted">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              disabled={isSaving}
              className="w-full accent-vscode-accent"
            />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-vscode-text">
              <span>Girar</span>
              <span className="text-xs text-vscode-text-muted">{rotation} deg</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRotate}
              disabled={isSaving}
              className="w-full"
            >
              Girar 90 deg
            </Button>
          </div>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="-mx-4 -mb-4 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-vscode-border px-4 py-3">
        <Button type="button" variant="ghost" onClick={onReset} disabled={isSaving}>
          Restaurar
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="button" loading={isSaving} onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
