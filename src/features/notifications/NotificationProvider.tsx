import type { ReactNode } from 'react'
import NotificationHost from '@/features/notifications/components/NotificationHost'

export function NotificationProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <NotificationHost />
    </>
  )
}
