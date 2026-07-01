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
import { computeAccentHover, normalizeHexColor } from '@/features/settings/theme/accent-utils'
import type { ResolvedTheme, ThemePreference } from '@/features/settings/settings-types'

const THEME_STORAGE_KEY = 'datadash.theme'
const ACCENT_STORAGE_KEY = 'datadash.accentColor'

type ThemeContextValue = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  accentColor: string
  setAccentColor: (color: string) => void
  resetAccentColor: () => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function normalizeThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system'
  }

  return normalizeThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY))
}

function readStoredAccentColor(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCENT_COLOR
  }

  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY)

  if (!stored) {
    return DEFAULT_ACCENT_COLOR
  }

  try {
    return normalizeHexColor(stored)
  } catch {
    return DEFAULT_ACCENT_COLOR
  }
}

function applyThemeToDocument(theme: ThemePreference, accentColor: string) {
  const resolved: ResolvedTheme =
    theme === 'system' ? getSystemTheme() : theme

  document.documentElement.dataset.theme = resolved
  document.documentElement.style.setProperty('--vscode-accent', accentColor)
  document.documentElement.style.setProperty(
    '--vscode-accent-hover',
    computeAccentHover(accentColor, resolved),
  )

  return resolved
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme)
  const [accentColor, setAccentColorState] = useState<string>(readStoredAccentColor)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === 'system' ? getSystemTheme() : theme,
  )

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }, [])

  const setAccentColor = useCallback((color: string) => {
    const normalized = normalizeHexColor(color)
    setAccentColorState(normalized)
    window.localStorage.setItem(ACCENT_STORAGE_KEY, normalized)
  }, [])

  const resetAccentColor = useCallback(() => {
    setAccentColorState(DEFAULT_ACCENT_COLOR)
    window.localStorage.setItem(ACCENT_STORAGE_KEY, DEFAULT_ACCENT_COLOR)
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
      resolvedTheme,
    }),
    [theme, setTheme, accentColor, setAccentColor, resetAccentColor, resolvedTheme],
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
