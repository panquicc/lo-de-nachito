// src/lib/api/clients.ts
import { db } from '@/lib/db'
import { addToSyncQueue } from '@/lib/sync'

export type Client = {
  id: string
  name: string
  phone?: string
  email?: string
  created_at: string
}

export async function getClients(search?: string): Promise<Client[]> {
  let clients = await db.clients.toArray()

  if (search) {
    const lowerSearch = search.toLowerCase()
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(lowerSearch) ||
      c.email?.toLowerCase().includes(lowerSearch)
    )
  }

  return clients
}

export async function fetchClientsFromApi(): Promise<Client[]> {
  const response = await fetch('/api/clients')
  if (!response.ok) throw new Error('Failed to fetch clients from API')
  return response.json()
}

export async function getClient(id: string): Promise<Client> {
  const client = await db.clients.get(id)
  if (!client) throw new Error('Client not found')
  return client
}

export async function createClient(clientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const newClient: Client = {
    ...clientData,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }

  await db.clients.add(newClient)
  await addToSyncQueue('clients', 'CREATE', newClient)

  return newClient
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  await db.clients.update(id, updates)
  const updatedClient = await db.clients.get(id)

  if (!updatedClient) throw new Error('Client not found')

  await addToSyncQueue('clients', 'UPDATE', { id, ...updates })

  return updatedClient
}

export async function deleteClient(id: string): Promise<void> {
  await db.clients.delete(id)
  await addToSyncQueue('clients', 'DELETE', { id })
}

export async function apiCreateClient(client: Client): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create client in API')
  }
  return response.json()
}

export async function apiUpdateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update client in API')
  }
  return response.json()
}

export async function apiDeleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete client in API')
  }
}