import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { userPreferencesStore } from '@/features/settings/user-preferences-store'
import {
  loginRequest,
  logoutRequest,
  profileRequest,
  refreshRequest,
} from './auth-api'
import { authStore } from './auth-store'
import { toUserRbac } from './rbac'
import type { UserProfile } from './auth-types'
import type { UserRbac } from './rbac-types'
import {
  clearPersistedToken,
  loadPersistedToken,
  persistToken,
} from './token-storage'
import { queryClient } from '@/lib/query-client'

type AuthContextValue = {
  user: UserProfile | null
  rbac: UserRbac | null
  accessToken: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function applySession(profile: UserProfile) {
  authStore.setUser(profile)
  authStore.setRbac(toUserRbac(profile.regras, profile.permissoes))
  userPreferencesStore.hydrate(profile.preferencias_ui)
}

function clearSession() {
  authStore.reset()
  userPreferencesStore.clear()
}

async function restoreSessionFromRefresh(): Promise<UserProfile | null> {
  try {
    const refreshed = await refreshRequest()
    authStore.setAccessToken(refreshed.access_token)
    await persistToken(refreshed.access_token)
    const profile = await profileRequest()
    applySession(profile)
    return profile
  } catch {
    return null
  }
}

async function loadProfileWithToken(token: string): Promise<UserProfile | null> {
  authStore.setAccessToken(token)

  try {
    const profile = await profileRequest()
    applySession(profile)
    return profile
  } catch {
    const profile = await restoreSessionFromRefresh()
    if (profile) {
      return profile
    }

    clearSession()
    await clearPersistedToken()
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    return authStore.subscribe(() => {
      setVersion((current) => current + 1)
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      authStore.setIsBootstrapping(true)

      try {
        const persistedToken = await loadPersistedToken()

        if (persistedToken) {
          await loadProfileWithToken(persistedToken)
        } else {
          await restoreSessionFromRefresh()
        }
      } finally {
        if (!cancelled) {
          authStore.setIsBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    queryClient.clear()

    const session = await loginRequest(email, senha)
    authStore.setAccessToken(session.access_token)
    await persistToken(session.access_token)

    const profile = await profileRequest()
    applySession(profile)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // ignore network errors during logout
    } finally {
      clearSession()
      await clearPersistedToken()
      queryClient.clear()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authStore.getUser(),
      rbac: authStore.getRbac(),
      accessToken: authStore.getAccessToken(),
      isAuthenticated: authStore.isAuthenticated(),
      isBootstrapping: authStore.getIsBootstrapping(),
      login,
      logout,
    }),
    [version, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
