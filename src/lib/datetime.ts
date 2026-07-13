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
const OFFSET_PATTERN = /[+-]\d{2}:\d{2}$/

export function getAppTimeZone(): string {
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
  /**
   * Use for PostgreSQL TIMESTAMPTZ values serialized as true UTC instants.
   * Default parsing treats TIMESTAMP (without TZ) wall-clock values from the API.
   */
  instant?: boolean
}

function stripFractionalSeconds(value: string): string {
  return value.replace(/\.\d+$/, '')
}

function parseWallClockDateTime(value: string): Date | null {
  const normalized = stripFractionalSeconds(value.replace(/Z$/, ''))
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

  if (OFFSET_PATTERN.test(trimmed)) {
    const parsed = parseISO(trimmed)
    return isValid(parsed) ? parsed : null
  }

  if (OFFSET_PATTERN.test(trimmed) || trimmed.endsWith('Z')) {
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
  return formatDateTime(value)
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
