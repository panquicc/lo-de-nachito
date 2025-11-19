'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface PortalTooltipProps {
    content: string
    children: React.ReactNode
}

export function PortalTooltip({ content, children }: PortalTooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            const scrollY = window.scrollY

            // Default to bottom
            let top = rect.bottom + scrollY + 8
            const left = rect.left + (rect.width / 2)

            // Check if it fits below, otherwise go top
            // (Simple check: if bottom is too close to viewport bottom)
            if (rect.bottom + 40 > window.innerHeight) {
                top = rect.top + scrollY - 40 // Go above
            }

            setPosition({ top, left })
        }
    }, [isVisible])

    return (
        <div
            ref={triggerRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            className="relative"
        >
            {children}
            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: position.top,
                        left: position.left,
                        // If we are going above, we might want to adjust transform or margin, 
                        // but for now simple positioning is fine.
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    )
}
