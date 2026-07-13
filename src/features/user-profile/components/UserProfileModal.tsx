import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { useCurrentUser } from '@/features/user/use-current-user'
import { getUserProfileSummary } from '@/features/user-inbox/user-inbox-api'
import { useUnreadNotifications } from '@/features/user-inbox/hooks/use-unread-notifications'
import UserNotificationsPanel from '@/features/user-profile/components/UserNotificationsPanel'
import UserProfileTab from '@/features/user-profile/components/UserProfileTab'
import { useProfileModal } from '@/features/user-profile/profile-modal-context'
import { queryKeys } from '@/lib/query-keys'

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export default function UserProfileModal() {
  const { isOpen, notificationsPanelOpen, closeProfile, toggleNotificationsPanel } =
    useProfileModal()
  const { data: user, isLoading: isUserLoading } = useCurrentUser()
  const { unreadCount } = useUnreadNotifications({
    isNotificationsTabOpen: isOpen && notificationsPanelOpen,
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.userProfile.summary,
    queryFn: getUserProfileSummary,
    enabled: isOpen,
  })

  return (
    <Dialog
      isOpen={isOpen}
      title="Meu perfil"
      onClose={closeProfile}
      className="w-[70vw] max-w-[70vw]"
      bodyClassName="p-0"
      headerActions={
        <Button
          type="button"
          variant={notificationsPanelOpen ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleNotificationsPanel}
          aria-pressed={notificationsPanelOpen}
        >
          <BellIcon />
          Notificações
          {unreadCount > 0 && (
            <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      }
    >
      <div className="flex min-h-[28rem]">
        <div
          className={clsx(
            'min-w-0 overflow-y-auto p-4 transition-[width] duration-200',
            notificationsPanelOpen ? 'w-[85%]' : 'w-full',
          )}
        >
          {isUserLoading && (
            <p className="text-sm text-vscode-text-muted">Carregando perfil...</p>
          )}

          {!isUserLoading && !user && (
            <p className="text-sm text-vscode-text-muted">Não foi possível carregar o perfil.</p>
          )}

          {user && (
            <UserProfileTab
              user={user}
              summary={summaryQuery.data}
              isSummaryLoading={summaryQuery.isLoading}
            />
          )}
        </div>

        {notificationsPanelOpen && (
          <aside className="flex w-[15%] min-w-[11rem] flex-col border-l border-vscode-border bg-vscode-bg/30">
            <div className="border-b border-vscode-border px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
                Notificações
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <UserNotificationsPanel enabled={isOpen && notificationsPanelOpen} compact />
            </div>
          </aside>
        )}
      </div>
    </Dialog>
  )
}
