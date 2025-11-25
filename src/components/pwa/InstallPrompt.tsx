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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Download className="w-8 h-8 text-blue-600" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {isIOS ? "Instalar App en iPhone" : "¿Instalar App de Turnos?"}
                            </h3>

                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {isIOS
                                    ? "Para una mejor experiencia, toca el botón compartir y selecciona 'Agregar a inicio'"
                                    : "Instala nuestra aplicación para reservar tus turnos más rápido y tenerlos siempre a mano."
                                }
                            </p>

                            {!isIOS ? (
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleInstall}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-blue-200"
                                    >
                                        Sí, instalar ahora
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDismiss}
                                        className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    >
                                        No, gracias
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleDismiss}
                                    className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-6"
                                >
                                    Entendido
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
