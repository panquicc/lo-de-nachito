// src/hooks/useCourts.ts
import { useQuery } from '@tanstack/react-query'
import { createPublicClient } from '@/lib/supabase/public-client'

export function useCourts() {
  return useQuery({
    queryKey: ['courts'],
    queryFn: async () => {
      const supabase = createPublicClient()
      
      const { data: courts, error } = await supabase
        .from('courts')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw new Error(error.message)
      }

      return courts
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}