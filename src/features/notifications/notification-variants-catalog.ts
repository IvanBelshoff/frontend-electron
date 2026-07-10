import type {
  NotificationDisplayStyle,
  NotificationPosition,
} from './notification-types'

export type NotificationVariantDefinition = {
  id: NotificationDisplayStyle
  name: string
  description: string
  position: NotificationPosition
  enterClass: string
  exitClass: string
  containerClass: string
  showProgressBar: boolean
  showIcon: boolean
  showCircularProgress: boolean
}

export const NOTIFICATION_VARIANTS: NotificationVariantDefinition[] = [
  {
    id: 'slideUpBar',
    name: 'Slide Up + Barra',
    description: 'Canto inferior direito com subida suave e barra de progresso VS Code.',
    position: 'bottom-right',
    enterClass: 'notification-enter-slide-up',
    exitClass: 'notification-exit-slide-down',
    containerClass: 'w-[min(100vw-2rem,22rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'fadeTopRight',
    name: 'Fade Superior',
    description: 'Topo direito discreto com fade e leve deslocamento horizontal.',
    position: 'top-right',
    enterClass: 'notification-enter-fade-right',
    exitClass: 'notification-exit-fade-right',
    containerClass: 'w-[min(100vw-2rem,20rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'scaleCenter',
    name: 'Scale Center',
    description: 'Centro inferior com escala de destaque.',
    position: 'bottom-center',
    enterClass: 'notification-enter-scale',
    exitClass: 'notification-exit-scale',
    containerClass: 'w-[min(100vw-2rem,24rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'slideFromLeft',
    name: 'Slide Esquerda',
    description: 'Entra pela esquerda lembrando um painel lateral.',
    position: 'bottom-left',
    enterClass: 'notification-enter-slide-left',
    exitClass: 'notification-exit-slide-left',
    containerClass: 'w-[min(100vw-2rem,22rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'compactPill',
    name: 'Pill Compacto',
    description: 'Faixa pill no topo com expansão horizontal.',
    position: 'top-center',
    enterClass: 'notification-enter-pill-expand',
    exitClass: 'notification-exit-pill-collapse',
    containerClass: 'w-[min(100vw-2rem,18rem)] rounded-full',
    showProgressBar: true,
    showIcon: false,
    showCircularProgress: false,
  },
  {
    id: 'accentBorderCard',
    name: 'Card com Borda',
    description: 'Card com borda esquerda na cor primária do usuário.',
    position: 'bottom-right',
    enterClass: 'notification-enter-border-grow',
    exitClass: 'notification-exit-shrink-width',
    containerClass: 'w-[min(100vw-2rem,22rem)] border-l-[3px] border-l-vscode-accent',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'stackShrink',
    name: 'Stack Shrink',
    description: 'Empilhamento com encolhimento ao fechar.',
    position: 'bottom-right',
    enterClass: 'notification-enter-stack',
    exitClass: 'notification-exit-stack-shrink',
    containerClass: 'w-[min(100vw-2rem,22rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'bounceIn',
    name: 'Bounce In',
    description: 'Entrada com bounce expressivo.',
    position: 'bottom-right',
    enterClass: 'notification-enter-bounce',
    exitClass: 'notification-exit-bounce',
    containerClass: 'w-[min(100vw-2rem,22rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'flipIn',
    name: 'Flip 3D',
    description: 'Flip leve no eixo X no canto superior direito.',
    position: 'top-right',
    enterClass: 'notification-enter-flip',
    exitClass: 'notification-exit-flip',
    containerClass: 'w-[min(100vw-2rem,20rem)] [perspective:800px]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'blurMiniPanel',
    name: 'Mini Painel',
    description: 'Painel central com blur e anel de destaque.',
    position: 'center',
    enterClass: 'notification-enter-blur-panel',
    exitClass: 'notification-exit-blur-panel',
    containerClass: 'w-[min(100vw-2rem,24rem)] ring-1 ring-vscode-accent/30 backdrop-blur-sm',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'topBanner',
    name: 'Banner Superior',
    description: 'Faixa horizontal ocupando o topo da tela.',
    position: 'top-full',
    enterClass: 'notification-enter-banner-down',
    exitClass: 'notification-exit-banner-up',
    containerClass: 'w-full max-w-none rounded-none border-x-0',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'circularProgress',
    name: 'Progresso Circular',
    description: 'Timer circular ao redor do ícone em vez da barra inferior.',
    position: 'bottom-right',
    enterClass: 'notification-enter-fade',
    exitClass: 'notification-exit-fade',
    containerClass: 'w-[min(100vw-2rem,22rem)]',
    showProgressBar: false,
    showIcon: true,
    showCircularProgress: true,
  },
  {
    id: 'splitReveal',
    name: 'Split Reveal',
    description: 'Ícone e texto entram em sequência.',
    position: 'bottom-right',
    enterClass: 'notification-enter-split',
    exitClass: 'notification-exit-split',
    containerClass: 'w-[min(100vw-2rem,22rem)]',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
  {
    id: 'minimalStrip',
    name: 'Strip Minimal',
    description: 'Faixa minimalista apenas com texto e barra.',
    position: 'bottom-right',
    enterClass: 'notification-enter-fade',
    exitClass: 'notification-exit-fade',
    containerClass: 'w-[min(100vw-2rem,20rem)] px-3 py-2',
    showProgressBar: true,
    showIcon: false,
    showCircularProgress: false,
  },
  {
    id: 'timelineStack',
    name: 'Timeline Stack',
    description: 'Empilhamento com conector visual entre notificações.',
    position: 'bottom-right',
    enterClass: 'notification-enter-timeline',
    exitClass: 'notification-exit-timeline',
    containerClass: 'w-[min(100vw-2rem,22rem)] notification-timeline-item',
    showProgressBar: true,
    showIcon: true,
    showCircularProgress: false,
  },
]

export function getNotificationVariant(
  style: NotificationDisplayStyle,
): NotificationVariantDefinition {
  return (
    NOTIFICATION_VARIANTS.find((variant) => variant.id === style) ??
    NOTIFICATION_VARIANTS[0]
  )
}

export const NOTIFICATION_POSITION_CLASSES: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-full': 'top-0 left-0 right-0 items-stretch px-0',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
}
