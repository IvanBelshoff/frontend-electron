import type { UIMessage } from 'ai'
import type { AiExploreCard } from './ai-dashboard-explore-types'

function isExploreCard(value: unknown): value is AiExploreCard {
  if (!value || typeof value !== 'object') {
    return false
  }
  const kind = (value as { kind?: unknown }).kind
  return (
    kind === 'start_discovery' ||
    kind === 'discovery_running' ||
    kind === 'discovery_ready' ||
    kind === 'confirm_analysis' ||
    kind === 'analysis_running' ||
    kind === 'analysis_ready'
  )
}

export function getExploreCardFromMessage(message: UIMessage): AiExploreCard | null {
  const metadata = message.metadata as { exploreCard?: unknown } | undefined
  if (isExploreCard(metadata?.exploreCard)) {
    return metadata.exploreCard
  }

  for (const part of message.parts) {
    if (!part || typeof part !== 'object') {
      continue
    }

    const typed = part as {
      type?: string
      output?: unknown
      result?: unknown
      state?: string
    }

    const candidate = typed.output ?? typed.result
    if (candidate && typeof candidate === 'object') {
      const exploreCard = (candidate as { exploreCard?: unknown }).exploreCard
      if (isExploreCard(exploreCard)) {
        return exploreCard
      }
    }
  }

  return null
}

export function getOptionChipsFromExploreCard(card: AiExploreCard): string[] {
  if (card.kind !== 'discovery_ready' || !card.mapa) {
    return []
  }

  const chips: string[] = []
  const ano = card.mapa.filtros.find((f) => /ano/i.test(f.nome))
  const anos = ano?.valores ?? ano?.valoresAmostra ?? []
  for (const value of anos.slice(0, 8)) {
    chips.push(value)
  }

  for (const aba of card.mapa.abas.slice(0, 6)) {
    if (!chips.includes(aba)) {
      chips.push(aba)
    }
  }

  return chips
}
