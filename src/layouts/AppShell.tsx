import { Outlet } from '@tanstack/react-router'
import PageContainer from '@/components/layout/PageContainer'
import Sidebar from '@/components/layout/Sidebar'

export default function AppShell() {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-vscode-bg p-6">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </div>
  )
}
