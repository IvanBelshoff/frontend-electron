import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, useAuth } from '@/features/auth/use-auth'
import { NotificationProvider } from '@/features/notifications/NotificationProvider'
import { ThemeProvider } from '@/features/settings/theme/theme-provider'
import { queryClient } from '@/lib/query-client'
import AppRouter from '@/router'
import { router } from '@/router/router'
import '@/styles/globals.css'

function BootstrapGate({ children }: { children: React.ReactNode }) {
  const { isBootstrapping } = useAuth()

  useEffect(() => {
    if (!isBootstrapping) {
      void router.invalidate()
    }
  }, [isBootstrapping])

  if (isBootstrapping) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-vscode-bg">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-vscode-accent border-r-transparent" />
          <span className="text-sm text-vscode-text-muted">Carregando...</span>
        </div>
      </div>
    )
  }

  return children
}

function RootApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <BootstrapGate>
              <AppRouter />
            </BootstrapGate>
          </QueryClientProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
