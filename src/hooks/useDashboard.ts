// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/lib/api/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch cada 30 segundos
  })
}