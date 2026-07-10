import type { NotificationTone } from './notification-types'

export function getNotificationToneClasses(tone: NotificationTone): {
  border: string
  background: string
  icon: string
  accentBar: string
} {
  switch (tone) {
    case 'success':
      return {
        border: 'border-vscode-success/40',
        background: 'bg-vscode-success/10',
        icon: 'text-vscode-success',
        accentBar: 'bg-vscode-success',
      }
    case 'error':
      return {
        border: 'border-vscode-error/40',
        background: 'bg-vscode-error/10',
        icon: 'text-vscode-error',
        accentBar: 'bg-vscode-error',
      }
    case 'warning':
      return {
        border: 'border-vscode-warning/40',
        background: 'bg-vscode-warning/10',
        icon: 'text-vscode-warning',
        accentBar: 'bg-vscode-warning',
      }
    case 'info':
    default:
      return {
        border: 'border-vscode-accent/40',
        background: 'bg-vscode-accent/10',
        icon: 'text-vscode-accent',
        accentBar: 'bg-vscode-accent',
      }
  }
}

export function getNotificationToneIcon(tone: NotificationTone): string {
  switch (tone) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
    default:
      return 'info'
  }
}

export function getNotificationToneLabel(tone: NotificationTone): string {
  switch (tone) {
    case 'success':
      return 'Sucesso'
    case 'error':
      return 'Erro'
    case 'warning':
      return 'Aviso'
    case 'info':
    default:
      return 'Informação'
  }
}
