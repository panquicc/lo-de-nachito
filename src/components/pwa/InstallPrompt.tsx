'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if already in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        setIsStandalone(isStandaloneMode)

        if (isStandaloneMode) return

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsVisible(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Show prompt immediately for iOS since it doesn't support beforeinstallprompt
        if (isIOSDevice) {
            setIsVisible(true)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) {
            if (isIOS) {
                // Show iOS instructions
                return
            }
            return
        }

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setIsVisible(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setIsVisible(false)
    }

    if (isStandalone || !isVisible) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border p-4 z-50"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">Instala la App</h3>
                            <p className="text-sm text-slate-600 mb-3">
                                {isIOS
                                    ? "Para instalar en iOS: toca el botón compartir y selecciona 'Agregar a inicio'"
                                    : "Descarga la aplicación para tener siempre la disponibilidad a mano y reservar más rápido."
                                }
                            </p>
                            {!isIOS && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleInstall}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        size="sm"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Instalar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDismiss}
                                        size="sm"
                                    >
                                        Ahora no
                                    </Button>
                                </div>
                            )}
                            {isIOS && (
                                <Button
                                    variant="ghost"
                                    onClick={handleDismiss}
                                    size="sm"
                                    className="mt-2"
                                >
                                    Entendido
                                </Button>
                            )}
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
