// src/hooks/useSales.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSales, createSale } from '@/lib/api/sales'

export function useSales(date?: string) {
  return useQuery({
    queryKey: ['sales', date],
    queryFn: () => getSales(date),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}