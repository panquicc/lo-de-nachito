// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OfflineProvider } from '@/context/OfflineContext'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineProvider>
        {children}
      </OfflineProvider>
    </QueryClientProvider>
  )
}