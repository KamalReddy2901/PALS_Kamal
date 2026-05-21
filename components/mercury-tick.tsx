'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MercuryTickProps {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number // base duration in ms
}

// Split-flap digit animation
function Digit({ 
  digit, 
  delay 
}: { 
  digit: string
  delay: number 
}) {
  return (
    <span className="relative inline-block w-[0.6em] h-[1.2em] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            duration: 0.15,
            delay,
            ease: [0.16, 1, 0.3, 1], // Custom easing for mechanical feel
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function MercuryTick({
  value,
  decimals = 1,
  suffix = '',
  prefix = '',
  className = '',
  duration = 180,
}: MercuryTickProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (value === prevValueRef.current) return
    
    const diff = Math.abs(value - prevValueRef.current)
    // Duration scales with magnitude of change
    const animDuration = Math.min(900, Math.max(duration, diff * 150))
    const steps = Math.ceil(animDuration / 50)
    const stepValue = (value - prevValueRef.current) / steps
    
    setIsAnimating(true)
    let currentStep = 0
    
    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayValue(value)
        setIsAnimating(false)
        clearInterval(interval)
      } else {
        setDisplayValue(prevValueRef.current + stepValue * currentStep)
      }
    }, animDuration / steps)
    
    prevValueRef.current = value
    
    return () => clearInterval(interval)
  }, [value, duration])
  
  // Format the number
  const formatted = displayValue.toFixed(decimals)
  const [intPart, decPart] = formatted.split('.')
  
  // Split into individual characters for animation
  const intDigits = intPart.split('')
  const decDigits = decPart ? decPart.split('') : []
  
  return (
    <span className={`inline-flex items-baseline tabular-nums ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex">
        {intDigits.map((digit, i) => (
          <Digit 
            key={`int-${i}-${intDigits.length}`} 
            digit={digit} 
            delay={isAnimating ? i * 0.02 : 0}
          />
        ))}
      </span>
      {decDigits.length > 0 && (
        <>
          <span className="mx-px">.</span>
          <span className="inline-flex">
            {decDigits.map((digit, i) => (
              <Digit 
                key={`dec-${i}`} 
                digit={digit} 
                delay={isAnimating ? (intDigits.length + i) * 0.02 : 0}
              />
            ))}
          </span>
        </>
      )}
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

// Simplified version for currency (no decimals, Indian notation)
export function MercuryTickCurrency({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  
  useEffect(() => {
    if (value === prevValueRef.current) return
    
    const diff = Math.abs(value - prevValueRef.current)
    const animDuration = Math.min(900, Math.max(200, diff / 10000 * 150))
    const steps = Math.ceil(animDuration / 50)
    const stepValue = (value - prevValueRef.current) / steps
    
    let currentStep = 0
    
    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.round(prevValueRef.current + stepValue * currentStep))
      }
    }, animDuration / steps)
    
    prevValueRef.current = value
    
    return () => clearInterval(interval)
  }, [value])
  
  // Format in Indian notation
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(displayValue)
  
  return (
    <span className={`tabular-nums ${className}`}>
      {formatted}
    </span>
  )
}
