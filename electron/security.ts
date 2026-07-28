import type { BrowserWindow, Session } from 'electron'
import { shell } from 'electron'

const FRAME_SRC_ALLOWLIST = [
  'https://app.powerbi.com',
  'https://*.powerbi.com',
]

const EXTERNAL_OPEN_ALLOWLIST = [
  'https://app.powerbi.com',
  'https://login.microsoftonline.com',
  'https://*.powerbi.com',
]

function parseOrigin(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null
  }

  try {
    return new URL(value.trim()).origin
  } catch {
    return null
  }
}

function getAppNavigationOrigins(isDev: boolean): string[] {
  const origins = new Set<string>()

  if (isDev) {
    const devServerOrigin = parseOrigin(process.env.VITE_DEV_SERVER_URL)
    if (devServerOrigin) {
      origins.add(devServerOrigin)
    }
  }

  return [...origins]
}

function getConnectSrcOrigins(isDev: boolean): string[] {
  const origins = new Set<string>(getAppNavigationOrigins(isDev))

  const apiOrigin = parseOrigin(process.env.VITE_API_URL)
  if (apiOrigin) {
    origins.add(apiOrigin)
  }

  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL
    if (devServerUrl) {
      try {
        const parsed = new URL(devServerUrl)
        origins.add(`ws://${parsed.host}`)
        origins.add(`wss://${parsed.host}`)
      } catch {
        // ignore invalid dev server URL
      }
    }

    origins.add('ws://localhost:*')
    origins.add('ws://127.0.0.1:*')
    origins.add('http://localhost:*')
    origins.add('http://127.0.0.1:*')
  }

  return [...origins]
}

function urlMatchesAllowlist(url: string, allowlist: string[]): boolean {
  try {
    const parsed = new URL(url)

    return allowlist.some((entry) => {
      const wildcardMatch = entry.match(/^https?:\/\/\*\.(.+)$/)
      if (wildcardMatch) {
        const suffix = wildcardMatch[1]
        return parsed.hostname === suffix || parsed.hostname.endsWith(`.${suffix}`)
      }

      try {
        const allowed = new URL(entry)
        return (
          parsed.protocol === allowed.protocol &&
          parsed.hostname === allowed.hostname &&
          parsed.port === allowed.port
        )
      } catch {
        return parsed.hostname === entry
      }
    })
  } catch {
    return false
  }
}

export function isAllowedAppNavigation(url: string, isDev: boolean): boolean {
  try {
    const parsed = new URL(url)

    if (parsed.protocol === 'file:') {
      return true
    }

    if (!isDev) {
      return parsed.protocol === 'file:'
    }

    return getAppNavigationOrigins(isDev).includes(parsed.origin)
  } catch {
    return false
  }
}

export function isAllowedExternalOpen(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) {
    return false
  }

  return urlMatchesAllowlist(url, EXTERNAL_OPEN_ALLOWLIST)
}

function buildContentSecurityPolicy(isDev: boolean): string {
  const connectSrc = isDev
    ? ["'self'", 'blob:', 'data:', ...getConnectSrcOrigins(isDev)]
    : ["'self'", 'blob:', 'data:', 'http:', 'https:']
  const scriptSrc = isDev
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    : ["'self'"]
  const frameSrc = ["'self'", ...FRAME_SRC_ALLOWLIST]

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSrc.join(' ')}`,
    `frame-src ${frameSrc.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export function registerContentSecurityPolicy(session: Session, isDev: boolean): void {
  const policy = buildContentSecurityPolicy(isDev)

  session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = {
      ...details.responseHeaders,
      'Content-Security-Policy': [policy],
    }

    callback({ responseHeaders })
  })
}

export function attachWindowNavigationGuards(
  window: BrowserWindow,
  isDev: boolean,
): void {
  const { webContents } = window

  webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalOpen(url)) {
      void shell.openExternal(url)
    }

    return { action: 'deny' }
  })

  const blockUnexpectedNavigation = (
    event: Electron.Event,
    url: string,
  ): void => {
    if (!isAllowedAppNavigation(url, isDev)) {
      event.preventDefault()
    }
  }

  webContents.on('will-navigate', blockUnexpectedNavigation)
  webContents.on('will-redirect', blockUnexpectedNavigation)
}
