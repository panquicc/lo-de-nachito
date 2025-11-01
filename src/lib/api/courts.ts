// src/lib/api/courts.ts
import { createClient } from '@/lib/supabase/client'

export type Court = {
  id: string
  name: string
  type: 'PADEL' | 'FUTBOL'
  is_active: boolean
  created_at: string
}

export async function getCourts(): Promise<Court[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createCourt(court: Omit<Court, 'id' | 'created_at'>): Promise<Court> {
  const response = await fetch('/api/courts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(court),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create court')
  }

  return response.json()
}