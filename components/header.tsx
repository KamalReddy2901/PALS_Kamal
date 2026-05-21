'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

function LiveTimestamp() {
  const [time, setTime] = useState<string>('')
  
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      }).replace(',', ' ·'))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return <span className="tabular-nums">{time} IST</span>
}

function getSheetNumber(pathname: string): string {
  if (pathname === '/planner' || pathname === '/') return '01'
  if (pathname.startsWith('/ward/')) return '02'
  if (pathname === '/citizen') return '03'
  if (pathname === '/interventions') return '04'
  return '00'
}

export function Header() {
  const pathname = usePathname()
  const sheetNum = getSheetNumber(pathname)
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 h-14 bg-ink text-bone flex items-center justify-between px-4 border-b border-ink"
      role="banner"
    >
      <div className="flex items-center gap-6">
        <Link 
          href="/planner" 
          className="font-mono text-[11px] tracking-wide uppercase hover:text-vermillion transition-colors"
          aria-label="Go to Urban Heat Island Intelligence home"
        >
          URBAN HEAT ISLAND INTELLIGENCE
        </Link>
        <span className="text-graphite text-[11px] font-mono">—</span>
        <span className="font-mono text-[11px] tracking-wide uppercase text-bone/70">
          BENGALURU MUNICIPAL CORPORATION
        </span>
        <span className="text-graphite text-[11px] font-mono">/</span>
        <span className="font-mono text-[11px] tracking-wide uppercase text-bone/70">
          SHEET {sheetNum}
        </span>
      </div>
      
      <nav className="flex items-center gap-6" role="navigation" aria-label="Main navigation">
        <NavLink href="/planner" label="PLANNER" />
        <NavLink href="/citizen" label="CITIZEN" />
        <NavLink href="/interventions" label="TRACKER" />
        <span className="w-px h-4 bg-bone/30" aria-hidden="true" />
        <span className="font-mono text-[11px] text-bone/70">
          <LiveTimestamp />
        </span>
      </nav>
    </header>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href === '/planner' && pathname === '/')
  
  return (
    <Link
      href={href}
      className="relative font-mono text-[11px] tracking-wide uppercase py-1"
      aria-label={`Navigate to ${label} view`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={isActive ? 'text-bone' : 'text-bone/60 hover:text-bone transition-colors'}>
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-0.5 left-0 right-0 h-px bg-vermillion"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  )
}
