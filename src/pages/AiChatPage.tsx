import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import AiAccessGate from '@/features/ai/components/AiAccessGate'
import AiChatComposer from '@/features/ai/components/AiChatComposer'
import AiChatLayout from '@/features/ai/components/AiChatLayout'
import AiEmptyState from '@/features/ai/components/AiEmptyState'
import AiMessageList from '@/features/ai/components/AiMessageList'
import AiThreadDeleteConfirmDialog from '@/features/ai/components/AiThreadDeleteConfirmDialog'
import AiThreadSidebar from '@/features/ai/components/AiThreadSidebar'
import { useAiChatPage } from '@/features/ai/hooks/use-ai-chat-page'
import { useAiThreadDeleteDialog } from '@/features/ai/hooks/use-ai-thread-delete-dialog'
import { useCurrentUser } from '@/features/user/use-current-user'

export default function AiChatPage() {
  const { data: currentUser } = useCurrentUser()
  const [input, setInput] = useState('')
  const chat = useAiChatPage()
  const deleteDialog = useAiThreadDeleteDialog({
    activeThreadId: chat.activeThreadId,
    onActiveThreadDeleted: chat.startNewConversation,
  })

  async function handleSubmit() {
    const text = input.trim()
    if (!text || chat.isBusy) {
      return
    }

    setInput('')
    await chat.sendUserMessage(text)
  }

  async function handleSuggestion(text: string) {
    setInput(text)
    await chat.sendUserMessage(text)
  }

  return (
    <AiAccessGate>
      <AiChatLayout
        header={
          <SettingsPageHeader
            title="Assistente IA"
            subtitle="Consulte relatórios autorizados com respostas em tempo real e histórico de conversas."
            actions={
              <Button
                type="button"
                variant="secondary"
                disabled={chat.isCreatingThread}
                onClick={() => void chat.startNewConversation()}
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
            onSelectThread={(thread) => void chat.selectThread(thread)}
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
            <AiChatComposer
              value={input}
              onChange={setInput}
              onSubmit={() => void handleSubmit()}
              onStop={() => chat.stop()}
              isBusy={chat.isBusy}
            />
          </>
        }
      >
        {chat.messages.length === 0 && !chat.isHydratingMessages && !chat.isBusy ? (
          <AiEmptyState
            userName={currentUser?.nome}
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
