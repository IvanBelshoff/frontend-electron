import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_ACCENT_COLOR } from '@/features/settings/accent-colors'
import { computeAccentHover, hexToRgbChannels, normalizeHexColor } from '@/features/settings/theme/accent-utils'
import type { ResolvedTheme, ThemePreference } from '@/features/settings/settings-types'
import { scheduleUserPreferencesPersist } from '@/features/settings/user-preferences-sync'
import { useUserPreferences } from '@/features/settings/use-user-preferences'

type ThemeContextValue = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  accentColor: string
  setAccentColor: (color: string) => void
  resetAccentColor: () => void
  resetThemePreferences: () => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDocument(theme: ThemePreference, accentColor: string) {
  const resolved: ResolvedTheme =
    theme === 'system' ? getSystemTheme() : theme

  document.documentElement.dataset.theme = resolved
  document.documentElement.style.setProperty('--vscode-accent', accentColor)
  document.documentElement.style.setProperty('--vscode-accent-rgb', hexToRgbChannels(accentColor))
  document.documentElement.style.setProperty(
    '--vscode-accent-hover',
    computeAccentHover(accentColor, resolved),
  )
  document.documentElement.style.setProperty(
    '--vscode-accent-hover-rgb',
    hexToRgbChannels(computeAccentHover(accentColor, resolved)),
  )

  return resolved
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, accentColor } = useUserPreferences()
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === 'system' ? getSystemTheme() : theme,
  )

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    scheduleUserPreferencesPersist({ theme: nextTheme })
  }, [])

  const setAccentColor = useCallback((color: string) => {
    const normalized = normalizeHexColor(color)
    scheduleUserPreferencesPersist({ accentColor: normalized })
  }, [])

  const resetAccentColor = useCallback(() => {
    scheduleUserPreferencesPersist({ accentColor: DEFAULT_ACCENT_COLOR })
  }, [])

  const resetThemePreferences = useCallback(() => {
    scheduleUserPreferencesPersist({
      theme: 'system',
      accentColor: DEFAULT_ACCENT_COLOR,
    })
  }, [])

  useEffect(() => {
    const resolved = applyThemeToDocument(theme, accentColor)
    setResolvedTheme(resolved)

    if (theme !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const nextResolved = applyThemeToDocument('system', accentColor)
      setResolvedTheme(nextResolved)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, accentColor])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      accentColor,
      setAccentColor,
      resetAccentColor,
      resetThemePreferences,
      resolvedTheme,
    }),
    [theme, setTheme, accentColor, setAccentColor, resetAccentColor, resetThemePreferences, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
