// src/lib/api/dashboard.ts
export type DashboardStats = {
  todayBookings: number
  activeClients: number
  todayRevenue: number
  lowStockCount: number
  totalProducts: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch dashboard stats')
  }

  return response.json()
}