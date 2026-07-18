import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import AiAccessGate from '@/features/ai/components/AiAccessGate'
import AiChatComposer from '@/features/ai/components/AiChatComposer'
import AiChatLayout from '@/features/ai/components/AiChatLayout'
import AiEmptyState from '@/features/ai/components/AiEmptyState'
import AiMessageList from '@/features/ai/components/AiMessageList'
import AiServiceStatusIndicator from '@/features/ai/components/AiServiceStatusIndicator'
import AiThreadDeleteConfirmDialog from '@/features/ai/components/AiThreadDeleteConfirmDialog'
import AiThreadSidebar from '@/features/ai/components/AiThreadSidebar'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { useAiChatPage } from '@/features/ai/hooks/use-ai-chat-page'
import { useAiHealth } from '@/features/ai/hooks/use-ai-health'
import { useAiThreadDeleteDialog } from '@/features/ai/hooks/use-ai-thread-delete-dialog'
import { useCurrentUser } from '@/features/user/use-current-user'

export default function AiChatPage() {
  const { data: currentUser } = useCurrentUser()
  const [input, setInput] = useState('')
  const [mentions, setMentions] = useState<AiMention[]>([])
  const aiHealth = useAiHealth()
  const chat = useAiChatPage()
  const deleteDialog = useAiThreadDeleteDialog({
    activeThreadId: chat.activeThreadId,
    onActiveThreadDeleted: chat.startNewConversation,
  })

  async function handleSubmit() {
    const text = input.trim()
    if (!text || chat.isBusy || !aiHealth.isAvailable) {
      return
    }

    const mentionsToSend = mentions
    setInput('')
    setMentions([])
    await chat.sendUserMessage(text, mentionsToSend)
  }

  async function handleSuggestion(text: string) {
    if (!aiHealth.isAvailable) {
      return
    }

    setInput(text)
    setMentions([])
    await chat.sendUserMessage(text)
  }

  return (
    <AiAccessGate>
      <AiChatLayout
        header={
          <SettingsPageHeader
            title="Assistente IA"
            titleAddon={
              <AiServiceStatusIndicator
                isChecking={aiHealth.isChecking}
                isAvailable={aiHealth.isAvailable}
                error={aiHealth.health?.error}
              />
            }
            subtitle="Consulte relatórios autorizados com respostas em tempo real e histórico de conversas."
            actions={
              <Button
                type="button"
                variant="secondary"
                disabled={!aiHealth.isAvailable || chat.isCreatingThread}
                onClick={() => {
                  setMentions([])
                  void chat.startNewConversation()
                }}
              >
                Nova conversa
              </Button>
            }
          />
        }
        sidebar={
          <AiThreadSidebar
            threads={chat.threads}
            activeThreadId={chat.activeThreadId}
            isLoading={chat.threadsLoading}
            isDeleting={deleteDialog.isDeleting}
            onSelectThread={(thread) => {
              setMentions([])
              void chat.selectThread(thread)
            }}
            onDeleteThread={deleteDialog.requestDelete}
          />
        }
        composer={
          <>
            {chat.error && (
              <div className="px-3 pt-3">
                <Alert variant="error">{chat.error.message}</Alert>
              </div>
            )}
            {!aiHealth.isAvailable && !aiHealth.isLoading && (
              <div className="px-3 pt-3">
                <Alert variant="warning">
                  O serviço de IA está indisponível no momento.
                </Alert>
              </div>
            )}
            <AiChatComposer
              value={input}
              onChange={setInput}
              mentions={mentions}
              onMentionsChange={setMentions}
              onSubmit={() => void handleSubmit()}
              onStop={() => chat.stop()}
              disabled={!aiHealth.isAvailable}
              isBusy={chat.isBusy}
            />
          </>
        }
      >
        {chat.messages.length === 0 && !chat.isHydratingMessages && !chat.isBusy ? (
          <AiEmptyState
            userName={currentUser?.nome}
            disabled={!aiHealth.isAvailable}
            onSuggestionClick={(text) => void handleSuggestion(text)}
          />
        ) : (
          <AiMessageList
            messages={chat.messages}
            status={chat.status}
            isHydrating={chat.isHydratingMessages}
          />
        )}
      </AiChatLayout>

      <AiThreadDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        threadTitle={deleteDialog.deleteTarget?.titulo ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </AiAccessGate>
  )
}
