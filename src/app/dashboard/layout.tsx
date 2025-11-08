// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import MobileSidebar from '@/components/layout/MobileSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar para desktop - oculto en móvil */}
      <div className="hidden lg:flex">
        <DashboardSidebar user={user} />
      </div>
      
      {/* Sidebar móvil */}
      <div className="lg:hidden">
        <MobileSidebar user={user} />
      </div>
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}