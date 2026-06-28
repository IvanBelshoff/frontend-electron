import { Outlet } from '@tanstack/react-router'
import Sidebar from '@/components/layout/Sidebar'

export default function AppShell() {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-auto bg-vscode-bg p-6">
        <Outlet />
      </main>
    </div>
  )
}
