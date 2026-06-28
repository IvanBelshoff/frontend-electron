import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

export default function AppRouter() {
  return <RouterProvider router={router} />
}
