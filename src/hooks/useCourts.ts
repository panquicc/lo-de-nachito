// src/hooks/useCourts.ts
import { useQuery } from '@tanstack/react-query'
import { getCourts } from '@/lib/api/courts'

export function useCourts() {
  return useQuery({
    queryKey: ['courts'],
    queryFn: getCourts,
  })
}