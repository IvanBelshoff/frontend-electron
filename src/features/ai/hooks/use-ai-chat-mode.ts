import { useCallback, useMemo, useState } from 'react'
import type { AiChatMode } from '@/features/ai/ai-chat-types'

const STORAGE_KEY = 'datadash:ai-chat-mode'

type PersistedState = {
  mode: AiChatMode
  thinkingPreference: boolean
}

const DEFAULT_STATE: PersistedState = {
  mode: 'normal',
  thinkingPreference: false,
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return DEFAULT_STATE
    }

    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      mode: parsed.mode === 'analitico' ? 'analitico' : 'normal',
      thinkingPreference: parsed.thinkingPreference === true,
    }
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Estado do seletor de modo do chat.
 *
 * O modo analítico sempre roda com raciocínio ligado, então `thinking` é forçado
 * para true e o controle fica travado. A preferência do usuário é preservada
 * separadamente para ser restaurada ao voltar para o modo normal.
 */
export function useAiChatMode() {
  const [state, setState] = useState<PersistedState>(loadState)

  const update = useCallback((next: PersistedState) => {
    setState(next)
    saveState(next)
  }, [])

  const setMode = useCallback(
    (mode: AiChatMode) => {
      update({ ...state, mode })
    },
    [state, update],
  )

  const toggleThinking = useCallback(() => {
    if (state.mode === 'analitico') {
      return
    }

    update({ ...state, thinkingPreference: !state.thinkingPreference })
  }, [state, update])

  const isThinkingLocked = state.mode === 'analitico'

  return useMemo(
    () => ({
      mode: state.mode,
      thinking: isThinkingLocked ? true : state.thinkingPreference,
      isThinkingLocked,
      setMode,
      toggleThinking,
    }),
    [isThinkingLocked, setMode, state.mode, state.thinkingPreference, toggleThinking],
  )
}
