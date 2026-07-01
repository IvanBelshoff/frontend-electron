export type ThemePreference = 'system' | 'dark' | 'light'

export type ResolvedTheme = 'dark' | 'light'

export type AppLanguage = 'pt-BR' | 'en-US' | 'es-ES'

export type AccentColorPreset = string

export type AccentColorOption = {
  id: string
  label: string
  value: AccentColorPreset
}

export type ValidationState =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
