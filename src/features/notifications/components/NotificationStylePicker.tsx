import clsx from 'clsx'
import Button from '@/components/ui/Button'
import { notify } from '@/features/notifications/notification-api'
import { getNotificationToneLabel } from '@/features/notifications/notification-tone-utils'
import type {
  NotificationDisplayStyle,
  NotificationPlacement,
  NotificationTone,
} from '@/features/notifications/notification-types'
import { NOTIFICATION_VARIANTS } from '@/features/notifications/notification-variants-catalog'

const TONES: NotificationTone[] = ['success', 'error', 'info', 'warning']

const TONE_BUTTON_CLASSES: Record<NotificationTone, string> = {
  success: 'border-vscode-success/40 text-vscode-success hover:bg-vscode-success/10',
  error: 'border-vscode-error/40 text-vscode-error hover:bg-vscode-error/10',
  info: 'border-vscode-accent/40 text-vscode-accent hover:bg-vscode-accent/10',
  warning: 'border-vscode-warning/40 text-vscode-warning hover:bg-vscode-warning/10',
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

type NotificationStylePickerProps = {
  selectedStyle: NotificationDisplayStyle
  selectedPlacement: NotificationPlacement
  onStyleChange: (style: NotificationDisplayStyle) => void
}

function previewMessage(tone: NotificationTone): { title: string; description: string } {
  switch (tone) {
    case 'success':
      return {
        title: 'Dashboard favoritado!',
        description: 'Exemplo de notificação de sucesso.',
      }
    case 'error':
      return {
        title: 'Falha ao salvar alterações',
        description: 'Exemplo de notificação de erro.',
      }
    case 'warning':
      return {
        title: 'Atenção: revisão pendente',
        description: 'Exemplo de notificação de aviso.',
      }
    case 'info':
    default:
      return {
        title: 'Sincronização em andamento',
        description: 'Exemplo de notificação informativa.',
      }
  }
}

function firePreview(
  style: NotificationDisplayStyle,
  placement: NotificationPlacement,
  tone: NotificationTone,
) {
  const message = previewMessage(tone)
  const options = {
    displayStyle: style,
    placement,
    description: message.description,
  }

  switch (tone) {
    case 'success':
      notify.success(message.title, options)
      break
    case 'error':
      notify.error(message.title, options)
      break
    case 'warning':
      notify.warning(message.title, options)
      break
    case 'info':
    default:
      notify.info(message.title, options)
      break
  }
}

export default function NotificationStylePicker({
  selectedStyle,
  selectedPlacement,
  onStyleChange,
}: NotificationStylePickerProps) {
  const handleStressTest = (style: NotificationDisplayStyle) => {
    TONES.forEach((tone, index) => {
      window.setTimeout(() => firePreview(style, selectedPlacement, tone), index * 180)
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {NOTIFICATION_VARIANTS.map((variant) => {
        const isSelected = selectedStyle === variant.id

        return (
          <article
            key={variant.id}
            className={clsx(
              'rounded border bg-vscode-bg p-3 transition-colors',
              isSelected ? 'border-vscode-accent' : 'border-vscode-border',
            )}
          >
            <div className="mb-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-vscode-text">{variant.name}</h4>
                  <p className="mt-1 text-xs text-vscode-text-muted">{variant.description}</p>
                </div>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Selecionar estilo ${variant.name}`}
                  title={isSelected ? 'Estilo selecionado' : `Selecionar ${variant.name}`}
                  onClick={() => onStyleChange(variant.id)}
                  className={clsx(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                    isSelected
                      ? 'border-vscode-accent bg-vscode-accent text-white'
                      : 'border-vscode-border bg-vscode-bg text-transparent hover:border-vscode-accent/50',
                  )}
                >
                  <CheckIcon />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  className={clsx(
                    'rounded border px-2 py-1 text-[11px] font-medium transition-colors',
                    TONE_BUTTON_CLASSES[tone],
                  )}
                  onClick={() => firePreview(variant.id, selectedPlacement, tone)}
                >
                  {getNotificationToneLabel(tone)}
                </button>
              ))}
            </div>

            <div className="mt-3 border-t border-vscode-border pt-3">
              <Button
                size="sm"
                variant="secondary"
                fullWidth
                onClick={() => handleStressTest(variant.id)}
              >
                Todas de uma vez
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
