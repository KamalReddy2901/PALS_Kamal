'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  marginAnnotation?: string
  sheetNumber?: string
  revision?: string
}

export function PageLayout({
  children,
  marginAnnotation,
  sheetNumber = '01',
  revision = 'A',
}: PageLayoutProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
  
  return (
    <div className="min-h-screen pt-14 relative">
      {/* Ruled grid that draws in */}
      <motion.div
        className="fixed inset-0 top-14 pointer-events-none z-0"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full h-full ruled-grid opacity-[0.15]" />
      </motion.div>
      
      {/* Left margin with annotations */}
      <aside 
        className="fixed left-0 top-14 bottom-0 w-20 border-r border-ink/20 z-10 hidden lg:block"
        aria-hidden="true"
      >
        <div className="h-full flex flex-col justify-between py-6 px-2">
          <div className="flex justify-center">
            <p className="font-accent italic text-[11px] text-graphite writing-mode-vertical">
              {marginAnnotation || 'HEAT VULNERABILITY ASSESSMENT'}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p className="font-mono text-[9px] text-graphite uppercase">
              SHEET {sheetNumber} / 12
            </p>
            <p className="font-mono text-[9px] text-graphite uppercase">
              REV. {revision} — {today}
            </p>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="relative z-10 lg:ml-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Footer with data vintage */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-bone border-t border-ink/20 flex items-center justify-between px-4 lg:pl-24 z-30">
        <div className="flex items-center gap-4 font-mono text-[10px] text-graphite">
          <span>DATA VINTAGE: {today} 06:00 IST</span>
          <span className="text-ink/30">|</span>
          <span>MODEL: UHI-PRED v2.1.4</span>
          <span className="text-ink/30">|</span>
          <span>REFRESH: 6H</span>
        </div>
        <div className="font-mono text-[10px]">
          <span className="text-vermillion font-medium">MOCK</span>
        </div>
      </footer>
    </div>
  )
}

// Stamp-style section header
export function SectionStamp({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <h2 className={`font-serif font-black text-3xl uppercase tracking-[-0.02em] text-ink ${className}`}>
      {children}
    </h2>
  )
}

// Smaller subsection header
export function SubsectionHeader({ 
  children,
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <h3 className={`font-mono text-[11px] uppercase tracking-wide text-graphite border-b border-ink/20 pb-1 ${className}`}>
      {children}
    </h3>
  )
}

// Annotation text in Newsreader italic
export function Annotation({ 
  children,
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <p className={`font-accent italic text-[13px] text-graphite ${className}`}>
      {children}
    </p>
  )
}
