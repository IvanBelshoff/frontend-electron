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
      className="w-full max-w-[min(70vw,calc(100vw-2rem))]"
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
      sidePanelHeader={
        notificationsPanelOpen ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
            Notificações
          </p>
        ) : undefined
      }
      sidePanel={
        notificationsPanelOpen ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            <UserNotificationsPanel enabled={isOpen && notificationsPanelOpen} compact />
          </div>
        ) : undefined
      }
    >
      <div className="min-w-0 p-4">
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
    </Dialog>
  )
}
