import type { ResolvedTheme } from '@/features/settings/settings-types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')

  if (normalized.length !== 6) {
    return { r: 0, g: 120, b: 212 }
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => clamp(value, 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function adjustChannel(channel: number, amount: number): number {
  return clamp(Math.round(channel + amount), 0, 255)
}

export function computeAccentHover(hex: string, theme: ResolvedTheme): string {
  const { r, g, b } = hexToRgb(hex)
  const amount = theme === 'dark' ? -30 : -20

  return rgbToHex(
    adjustChannel(r, amount),
    adjustChannel(g, amount),
    adjustChannel(b, amount),
  )
}

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim()

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`
  }

  throw new Error('Cor inválida.')
}
