/**
 * Date/time formatting for API values.
 *
 * - API JSON dates (ISO with Z or offset): UTC instants from NestJS Date serialization.
 *   Parsed with parseISO and displayed in getAppTimeZone().
 * - Timezone-less datetimes: wall-clock in getAppTimeZone() (rare raw API values).
 * - TIMESTAMPTZ: same as Z-suffixed ISO — use formatDateTimeInstant.
 * - DATE: date-only fields — use formatDateOnly.
 */
import {
  endOfDay,
  isValid,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

export const FALLBACK_TIMEZONE = 'America/Sao_Paulo'
export const EMPTY_DATE_LABEL = 'Não informado'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIMEZONE_SUFFIX_PATTERN = /(Z|[+-]\d{2}:\d{2})$/

let appTimeZoneOverride: string | null = null

/** @internal Overrides getAppTimeZone in unit tests only. */
export function setAppTimeZoneOverrideForTests(timeZone: string | null): void {
  appTimeZoneOverride = timeZone
}

export function getAppTimeZone(): string {
  if (appTimeZoneOverride) {
    return appTimeZoneOverride
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timeZone && timeZone !== 'UTC' && timeZone.length > 0) {
      return timeZone
    }
  } catch {
    // Electron or restricted environments may not expose a timezone.
  }

  return FALLBACK_TIMEZONE
}

type ParseApiDateTimeOptions = {
  /** Force UTC instant parsing (TIMESTAMPTZ). Z/offset strings already use parseISO by default. */
  instant?: boolean
}

function stripFractionalSeconds(value: string): string {
  return value.replace(/\.\d+$/, '')
}

function parseWallClockDateTime(value: string): Date | null {
  const normalized = stripFractionalSeconds(value.replace(TIMEZONE_SUFFIX_PATTERN, ''))
  const parsed = fromZonedTime(parseISO(normalized), getAppTimeZone())
  return isValid(parsed) ? parsed : null
}

export function coerceApiDateString(value: unknown): string | undefined {
  if (value == null) {
    return undefined
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }

  return undefined
}

export function parseApiDateTime(
  value?: string | Date | null,
  options: ParseApiDateTimeOptions = {},
): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  const trimmed = String(value).trim()
  if (!trimmed) {
    return null
  }

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    const parsed = parse(trimmed, 'yyyy-MM-dd', new Date())
    return isValid(parsed) ? parsed : null
  }

  if (options.instant || TIMEZONE_SUFFIX_PATTERN.test(trimmed)) {
    const parsed = parseISO(trimmed)
    return isValid(parsed) ? parsed : null
  }

  return parseWallClockDateTime(trimmed)
}

export function parseApiDateTimeInstant(value?: string | Date | null): Date | null {
  return parseApiDateTime(value, { instant: true })
}

function formatWithAppTimeZone(
  value: Date | null,
  pattern: string,
  emptyLabel = EMPTY_DATE_LABEL,
): string {
  if (!value) {
    return emptyLabel
  }

  return formatInTimeZone(value, getAppTimeZone(), pattern, { locale: ptBR })
}

export function formatDateTime(value?: string | Date | null): string {
  const parsed = parseApiDateTime(value)
  return formatWithAppTimeZone(parsed, 'dd/MM/yyyy, HH:mm')
}

export function formatDateTimeInstant(value?: string | Date | null): string {
  const parsed = parseApiDateTime(value, { instant: true })
  return formatWithAppTimeZone(parsed, 'dd/MM/yyyy, HH:mm')
}

export function formatDateOnly(value?: string | Date | null): string {
  if (!value) {
    return EMPTY_DATE_LABEL
  }

  const trimmed = String(value).trim()
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    const parsed = parse(trimmed, 'yyyy-MM-dd', new Date())
    return isValid(parsed)
      ? formatInTimeZone(parsed, getAppTimeZone(), 'dd/MM/yyyy', { locale: ptBR })
      : EMPTY_DATE_LABEL
  }

  const parsed = parseApiDateTime(value)
  return formatWithAppTimeZone(parsed, 'dd/MM/yyyy')
}

export function formatTimeOnly(value?: string | Date | null): string {
  const parsed = parseApiDateTime(value)
  return formatWithAppTimeZone(parsed, 'HH:mm')
}

export function toDateInputValue(value?: string | Date | null): string {
  if (!value) {
    return ''
  }

  const trimmed = String(value).trim()
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return trimmed
  }

  const parsed = parseApiDateTime(value)
  if (!parsed) {
    return ''
  }

  return formatInTimeZone(parsed, getAppTimeZone(), 'yyyy-MM-dd')
}

export function dayStartIso(dateStr: string): string {
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
  const start = startOfDay(parsed)
  return fromZonedTime(start, getAppTimeZone()).toISOString()
}

export function dayEndIso(dateStr: string): string {
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
  const end = endOfDay(parsed)
  return fromZonedTime(end, getAppTimeZone()).toISOString()
}
