// src/components/ui/input-moneda.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InputMonedaProps {
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function InputMoneda({ 
  label, 
  value, 
  onChange, 
  placeholder = "0.00", 
  required = false,
  disabled = false,
  className = ""
}: InputMonedaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Actualizar displayValue cuando el valor cambia externamente
  useEffect(() => {
    if (!isEditing) {
      if (value === 0) {
        setDisplayValue('')
      } else {
        setDisplayValue(value.toFixed(2))
      }
    }
  }, [value, isEditing])

  const parseValue = (inputValue: string): number => {
    if (inputValue === '' || inputValue === '0') return 0
    
    // Remover todo excepto números y punto decimal
    const cleaned = inputValue.replace(/[^\d.]/g, '')
    
    if (cleaned === '') return 0
    
    // Permitir solo un punto decimal
    const parts = cleaned.split('.')
    let numericValue: number
    
    if (parts.length > 2) {
      numericValue = parseFloat(parts[0] + '.' + parts[1])
    } else if (parts.length === 2) {
      const decimalPart = parts[1].slice(0, 2)
      numericValue = parseFloat(parts[0] + '.' + decimalPart)
    } else {
      numericValue = parseFloat(parts[0])
    }
    
    return isNaN(numericValue) ? 0 : Math.max(0, numericValue)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setDisplayValue(rawValue)
    
    // Parsear y enviar el nuevo valor
    const newValue = parseValue(rawValue)
    onChange(newValue)
  }

  const handleFocus = () => {
    setIsEditing(true)
    // Si el valor actual es 0, empezar con campo vacío
    if (value === 0) {
      setDisplayValue('')
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    // Al perder el foco, formatear el valor
    if (value === 0) {
      setDisplayValue('')
    } else {
      setDisplayValue(value.toFixed(2))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault()
    }
    
    // Permitir navegación con flechas y teclas de edición
    if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab'].includes(e.key)) {
      return
    }
    
    // Validar que sea un carácter numérico o punto
    if (!/[\d.]/.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault()
    }
  }

  return (
    <div className={className}>
      <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>
        {label} {required && '*'}
      </Label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          ref={inputRef}
          id={label.replace(/\s+/g, '-').toLowerCase()}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pl-8 pr-4"
          aria-describedby={`${label.replace(/\s+/g, '-').toLowerCase()}-help`}
        />
      </div>
      <p 
        id={`${label.replace(/\s+/g, '-').toLowerCase()}-help`} 
        className="text-xs text-gray-500 mt-1"
      >
        {isEditing ? 'Escriba el monto' : 'Ingrese el monto sin símbolos'}
      </p>
    </div>
  )
}