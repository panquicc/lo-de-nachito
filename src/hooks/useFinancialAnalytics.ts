// hooks/analytics/useFinancialAnalytics.ts
import useSWR from 'swr'

export function useFinancialAnalytics(params: {
  startDate: string
  endDate: string
  courtType?: string
  paymentMethod?: string
}) {
  const { data, error, isLoading } = useSWR(
    params.startDate && params.endDate 
      ? `/api/analytics/financial?${new URLSearchParams(params as any)}`
      : null,
    (url) => fetch(url).then(res => res.json())
  )
  
  return { data, error, isLoading }
}