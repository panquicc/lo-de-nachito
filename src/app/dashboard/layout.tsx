// src/app/dashboard/layout.tsx 
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import MobileSidebar from '@/components/layout/MobileSidebar' 
import { RouteGuard } from '@/components/auth/RouteGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard>
      <div className="flex h-screen">
        {/* Sidebar para desktop - oculto en móvil */}
        <div className="hidden lg:flex">
          <DashboardSidebar />
        </div>

        {/* Sidebar móvil */}
        <div className="lg:hidden">
          <MobileSidebar />
        </div>

        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </RouteGuard>
  )
}