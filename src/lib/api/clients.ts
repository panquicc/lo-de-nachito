// src/lib/api/clients.ts

export type Client = {
  id: string
  name: string
  phone?: string
  email?: string
  created_at: string
}

export async function getClients(search?: string): Promise<Client[]> {
  const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : '/api/clients'
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch clients')
  }

  return response.json()
}

export async function getClient(id: string): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch client')
  }

  return response.json()
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create client')
  }

  return response.json()
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update client')
  }

  return response.json()
}

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete client')
  }
}