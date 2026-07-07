import UserCreateForm from '@/features/user/components/UserCreateForm'
import UserCreateHeader from '@/features/user/components/UserCreateHeader'
import { useUserCreateState } from '@/features/user/hooks/use-user-create-state'

export default function CriarUsuarioPage() {
  const {
    draft,
    updateDraft,
    fieldErrors,
    photoPreviewUrl,
    handlePhotoChange,
    userOptions,
    isLoadingUserOptions,
    saveToList,
    saveAndEdit,
    isSaving,
    createdUserId,
  } = useUserCreateState()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <UserCreateHeader />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        <UserCreateForm
          draft={draft}
          updateDraft={updateDraft}
          fieldErrors={fieldErrors}
          photoPreviewUrl={photoPreviewUrl}
          onPhotoChange={handlePhotoChange}
          userOptions={userOptions}
          isLoadingUserOptions={isLoadingUserOptions}
          isSaving={isSaving}
          createdUserId={createdUserId}
          onSaveToList={() => void saveToList()}
          onSaveAndEdit={() => void saveAndEdit()}
        />
      </div>
    </div>
  )
}
