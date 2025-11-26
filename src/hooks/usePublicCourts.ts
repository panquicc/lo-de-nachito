import { useQuery } from '@tanstack/react-query'
import { fetchCourtsFromApi } from '@/lib/api/courts'

export function usePublicCourts() {
    return useQuery({
        queryKey: ['public-courts'],
        queryFn: fetchCourtsFromApi,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
