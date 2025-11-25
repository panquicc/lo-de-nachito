'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { syncPull, syncPush } from '@/lib/sync'
import { toast } from 'sonner'

interface OfflineContextType {
    isOnline: boolean
    isSyncing: boolean
    lastSyncTime: Date | null
    manualSync: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    manualSync: async () => { },
})

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Conexión restaurada. Sincronizando datos...')
            performSync()
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.warning('Sin conexión. Trabajando en modo offline.')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Initial sync on mount if online
        if (navigator.onLine) {
            performSync()
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const performSync = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        try {
            await syncPush() // Push local changes first
            await syncPull() // Then pull latest data
            setLastSyncTime(new Date())
            toast.success('Sincronización completada')
        } catch (error) {
            console.error('Sync failed:', error)
            toast.error('Error en la sincronización')
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <OfflineContext.Provider value={{ isOnline, isSyncing, lastSyncTime, manualSync: performSync }}>
            {children}
        </OfflineContext.Provider>
    )
}

export const useOffline = () => useContext(OfflineContext)
