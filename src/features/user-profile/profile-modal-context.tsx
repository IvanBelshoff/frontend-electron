import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type OpenProfileOptions = {
  notifications?: boolean
}

type ProfileModalContextValue = {
  isOpen: boolean
  notificationsPanelOpen: boolean
  openProfile: (options?: OpenProfileOptions) => void
  closeProfile: () => void
  toggleNotificationsPanel: () => void
}

const ProfileModalContext = createContext<ProfileModalContextValue | null>(null)

export function ProfileModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)

  const openProfile = useCallback((options?: OpenProfileOptions) => {
    setNotificationsPanelOpen(options?.notifications ?? false)
    setIsOpen(true)
  }, [])

  const closeProfile = useCallback(() => {
    setIsOpen(false)
    setNotificationsPanelOpen(false)
  }, [])

  const toggleNotificationsPanel = useCallback(() => {
    setNotificationsPanelOpen((current) => !current)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      notificationsPanelOpen,
      openProfile,
      closeProfile,
      toggleNotificationsPanel,
    }),
    [closeProfile, isOpen, notificationsPanelOpen, openProfile, toggleNotificationsPanel],
  )

  return (
    <ProfileModalContext.Provider value={value}>{children}</ProfileModalContext.Provider>
  )
}

export function useProfileModal() {
  const context = useContext(ProfileModalContext)

  if (!context) {
    throw new Error('useProfileModal must be used within ProfileModalProvider')
  }

  return context
}
