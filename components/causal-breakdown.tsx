'use client'

import { motion } from 'framer-motion'
import type { WardMetrics } from '@/lib/data'

interface CausalBreakdownProps {
  metrics: WardMetrics
  className?: string
}

const factorLabels: Record<string, { label: string; description: string }> = {
  albedo: { 
    label: 'LOW ALBEDO', 
    description: 'Dark surfaces absorbing solar radiation' 
  },
  canopy: { 
    label: 'CANOPY DEFICIT', 
    description: 'Insufficient tree cover for shade and evapotranspiration' 
  },
  thermal_mass: { 
    label: 'THERMAL MASS', 
    description: 'Concrete and masonry storing and re-radiating heat' 
  },
  density: { 
    label: 'BUILDING DENSITY', 
    description: 'Urban canyon effect trapping heat between structures' 
  },
  anthropogenic: { 
    label: 'ANTHROPOGENIC', 
    description: 'Waste heat from vehicles, AC units, and industrial activity' 
  },
}

export function CausalBreakdown({ metrics, className = '' }: CausalBreakdownProps) {
  const breakdown = metrics.causal_breakdown
  const sortedFactors = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
  
  // Calculate cumulative positions for stacked bar
  let cumulative = 0
  const segments = sortedFactors.map(([key, value]) => {
    const start = cumulative
    cumulative += value
    return { key, value, start }
  })
  
  return (
    <div className={className}>
      {/* Horizontal stacked bar with vertical label */}
      <div className="relative mb-6">
        <div className="flex items-start gap-3">
          <div className="h-12 flex-1 flex border border-ink overflow-hidden">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.key}
                className="h-full relative flex items-center justify-center"
                style={{ 
                  backgroundColor: index === 0 ? '#E84E1B' : 
                    index === 1 ? '#F17A4D' :
                    index === 2 ? '#F5A67F' :
                    index === 3 ? '#F9D2B1' : '#EDE6D3',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${segment.value}%` }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                {segment.value >= 10 && (
                  <span className={`font-mono text-[11px] font-medium ${index < 2 ? 'text-bone' : 'text-ink'}`}>
                    {segment.value}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Vertical label beside the bar */}
          <div className="h-12 flex items-center">
            <span 
              className="font-serif font-black text-xl uppercase tracking-tight text-ink"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              CAUSE
            </span>
          </div>
        </div>
      </div>
      
      {/* Factor list with descriptions */}
      <div className="space-y-3">
        {sortedFactors.map(([key, value], index) => {
          const factor = factorLabels[key]
          return (
            <motion.div
              key={key}
              className="flex items-start gap-4 py-2 border-b border-ink/10"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              {/* Percentage indicator */}
              <div className="w-16 flex-shrink-0">
                <div 
                  className="h-1.5 bg-ink/10"
                  style={{ width: '100%' }}
                >
                  <motion.div
                    className="h-full"
                    style={{ 
                      backgroundColor: index === 0 ? '#E84E1B' : 
                        index === 1 ? '#F17A4D' :
                        index === 2 ? '#F5A67F' :
                        index === 3 ? '#F9D2B1' : '#D4CFC0',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                  />
                </div>
                <span className={`font-mono text-[13px] font-medium ${index === 0 ? 'text-vermillion' : 'text-ink'}`}>
                  {value}%
                </span>
              </div>
              
              {/* Label and description */}
              <div className="flex-1">
                <h4 className="font-mono text-[12px] uppercase tracking-wide">
                  {factor.label}
                </h4>
                <p className="font-accent italic text-[11px] text-graphite mt-0.5">
                  {factor.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
