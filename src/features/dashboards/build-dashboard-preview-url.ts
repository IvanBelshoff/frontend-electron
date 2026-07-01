export function buildDashboardPreviewUrl(rawUrl: string): string {
  const trimmedUrl = rawUrl.trim()

  if (!trimmedUrl) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedUrl)

    if (parsedUrl.hostname.includes('powerbi.com')) {
      parsedUrl.searchParams.set('pageView', 'fitToWidth')
      parsedUrl.searchParams.set('chromeless', '1')
    }

    return parsedUrl.toString()
  } catch {
    return trimmedUrl
  }
}
