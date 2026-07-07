function appendQueryParams(parsedUrl: URL, rawQuery: string): void {
  const normalizedQuery = rawQuery.startsWith('?') ? rawQuery.slice(1) : rawQuery

  if (!normalizedQuery) {
    return
  }

  const params = new URLSearchParams(normalizedQuery)
  params.forEach((value, key) => {
    parsedUrl.searchParams.set(key, value)
  })
}

export function buildDashboardPreviewUrl(
  rawUrl: string,
  rawQuery?: string | null,
): string {
  const trimmedUrl = rawUrl.trim()

  if (!trimmedUrl) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedUrl)
    const extraQuery = rawQuery?.trim()

    if (extraQuery) {
      appendQueryParams(parsedUrl, extraQuery)
    }

    if (parsedUrl.hostname.includes('powerbi.com')) {
      parsedUrl.searchParams.set('pageView', 'fitToWidth')
      parsedUrl.searchParams.set('chromeless', '1')
    }

    return parsedUrl.toString()
  } catch {
    return trimmedUrl
  }
}
