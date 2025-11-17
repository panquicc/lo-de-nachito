// src/components/auth/RouteGuard.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { Loader2 } from 'lucide-react'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { canAccessModule, isLoading } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      const module = pathname.split('/')[2] // /dashboard/[module]
      
      if (module && !canAccessModule(module)) {
        router.push('/dashboard/unauthorized')
      }
    }
  }, [isLoading, pathname, router, canAccessModule])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}