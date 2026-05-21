'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getPriorityQueue, type WardMetrics } from '@/lib/data'
import { MercuryTick } from './mercury-tick'
import { SubsectionHeader } from './page-layout'
import { useAppStore } from '@/lib/store'

// Mini sparkline for temperature trend
function MiniSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 60
      const y = 16 - ((v - min) / range) * 14
      return `${x},${y}`
    })
    .join(' ')
  
  return (
    <svg 
      width="60" 
      height="20" 
      className="inline-block"
      aria-label="Temperature trend sparkline"
      role="img"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#E84E1B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Format causal factor name
function formatFactor(factor: string): string {
  const labels: Record<string, string> = {
    albedo: 'LOW ALBEDO',
    canopy: 'ZERO CANOPY',
    thermal_mass: 'THERMAL MASS',
    density: 'HIGH DENSITY',
    anthropogenic: 'ANTHROPOGENIC',
  }
  return labels[factor] || factor.toUpperCase()
}

interface PriorityCardProps {
  rank: number
  wardName: string
  wardId: string
  hvs: number
  peakTemp: number
  topFactor: string
  roiPotential: number
  isSelected: boolean
  onSelect: () => void
}

function PriorityCard({
  rank,
  wardName,
  wardId,
  hvs,
  peakTemp,
  topFactor,
  roiPotential,
  isSelected,
  onSelect,
}: PriorityCardProps) {
  // Generate deterministic sparkline data based on ward name (no Math.random for SSR)
  const sparklineData = Array.from({ length: 12 }, (_, i) => {
    const base = peakTemp - 4
    const hour = i * 2
    const factor = hour >= 6 && hour <= 14 
      ? (hour - 6) / 8 
      : hour > 14 
        ? 1 - (hour - 14) / 10 
        : 0.3
    // Use deterministic variation based on index and ward name
    const seed = (wardId.charCodeAt(0) * 31 + i * 17) % 100 / 100
    return base + factor * 8 + (seed - 0.5) * 0.5
  })
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        layout: { type: 'spring', stiffness: 500, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      className={`border-b border-ink/20 py-4 cursor-pointer transition-colors ${
        isSelected ? 'bg-ink/5' : 'hover:bg-ink/[0.02]'
      }`}
      onClick={onSelect}
      role="button"
      aria-label={`Select ${wardName} ward, rank ${rank}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex items-start gap-4">
        {/* Rank number - large stamp style */}
        <div className="flex-shrink-0 w-12">
          <motion.span
            key={rank}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`font-serif font-black text-4xl leading-none ${
              rank === 1 ? 'text-vermillion' : 'text-ink'
            }`}
          >
            {String(rank).padStart(2, '0')}
          </motion.span>
        </div>
        
        {/* Ward info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h4 className="font-mono text-[13px] font-medium uppercase truncate">
              {wardName}
            </h4>
            <span className="font-mono text-[11px] text-graphite flex-shrink-0">
              HVS <MercuryTick value={hvs} decimals={0} className="text-ink" />
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-graphite">
                PEAK <span className="text-vermillion"><MercuryTick value={peakTemp} decimals={1} suffix="°C" /></span>
              </span>
              <span className="text-ink/20">|</span>
              <span className="font-mono text-[10px] text-graphite uppercase">
                {formatFactor(topFactor)}
              </span>
            </div>
            <MiniSparkline values={sparklineData} />
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="font-accent italic text-[11px] text-graphite">
              ROI potential: {roiPotential.toFixed(1)}
            </span>
            <Link
              href={`/ward/${wardId}`}
              className="font-mono text-[10px] uppercase text-ink border-b border-ink hover:text-vermillion hover:border-vermillion transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${wardName} ward detail page`}
            >
              OPEN →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface PriorityQueueProps {
  limit?: number
  onWardSelect?: (wardId: string) => void
}

export function PriorityQueue({ limit = 5, onWardSelect }: PriorityQueueProps) {
  const { selectedWardId, setSelectedWard } = useAppStore()
  const priorityWards = getPriorityQueue(limit)
  
  const handleSelect = (wardId: string) => {
    setSelectedWard(wardId)
    onWardSelect?.(wardId)
  }
  
  return (
    <section aria-labelledby="priority-queue-heading">
      <SubsectionHeader className="mb-4">
        <span id="priority-queue-heading">PRIORITY QUEUE — TOP {limit} BY COOLING ROI/₹</span>
      </SubsectionHeader>
      
      <div className="space-y-0">
        <AnimatePresence mode="popLayout">
          {priorityWards.map((item, index) => (
            <PriorityCard
              key={item.ward.id}
              rank={index + 1}
              wardName={item.ward.name}
              wardId={item.ward.id}
              hvs={item.metrics.hvs}
              peakTemp={item.metrics.lst_peak_c}
              topFactor={item.topFactor}
              roiPotential={item.roiPotential}
              isSelected={selectedWardId === item.ward.id}
              onSelect={() => handleSelect(item.ward.id)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      <p className="mt-4 font-accent italic text-[11px] text-graphite">
        Rankings update with each forecast cycle. Priority reflects vulnerability-weighted cooling potential per rupee invested.
      </p>
    </section>
  )
}
