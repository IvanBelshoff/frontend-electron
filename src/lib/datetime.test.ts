import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  EMPTY_DATE_LABEL,
  formatDateOnly,
  formatDateTime,
  formatDateTimeInstant,
  formatTimeOnly,
  setAppTimeZoneOverrideForTests,
} from './datetime'

describe('datetime', () => {
  beforeEach(() => {
    setAppTimeZoneOverrideForTests('America/Sao_Paulo')
  })

  afterEach(() => {
    setAppTimeZoneOverrideForTests(null)
  })

  describe('formatDateTime (API ISO instants)', () => {
    it('converts Z-suffixed UTC ISO to app timezone', () => {
      expect(formatDateTime('2024-01-15T12:00:00.000Z')).toBe('15/01/2024, 09:00')
    })

    it('converts offset ISO to app timezone', () => {
      expect(formatDateTime('2024-01-15T12:00:00+00:00')).toBe('15/01/2024, 09:00')
    })

    it('parses timezone-less strings as wall-clock in app timezone', () => {
      expect(formatDateTime('2024-01-15T09:30:00')).toBe('15/01/2024, 09:30')
    })

    it('returns empty label for null values', () => {
      expect(formatDateTime(null)).toBe(EMPTY_DATE_LABEL)
      expect(formatDateTime(undefined)).toBe(EMPTY_DATE_LABEL)
    })
  })

  describe('formatDateTimeInstant (TIMESTAMPTZ)', () => {
    it('converts UTC instant to app timezone', () => {
      expect(formatDateTimeInstant('2024-01-15T12:00:00.000Z')).toBe('15/01/2024, 09:00')
    })
  })

  describe('formatDateOnly', () => {
    it('formats date-only strings', () => {
      expect(formatDateOnly('2024-01-15')).toBe('15/01/2024')
    })

    it('returns empty label for null values', () => {
      expect(formatDateOnly(null)).toBe(EMPTY_DATE_LABEL)
    })
  })

  describe('formatTimeOnly', () => {
    it('formats UTC ISO instants in app timezone', () => {
      expect(formatTimeOnly('2024-01-15T12:00:00.000Z')).toBe('09:00')
    })
  })
})
