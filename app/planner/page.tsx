'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/header'
import { PageLayout, SectionStamp } from '@/components/page-layout'
import { PriorityQueue } from '@/components/priority-queue'
import { MercuryTick } from '@/components/mercury-tick'
import { wardMetrics, wards } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

// Dynamic import for map (client-only)
const ChoroplethMap = dynamic(
  () => import('@/components/choropleth-map').then(mod => mod.ChoroplethMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full bg-bone border border-ink flex items-center justify-center">
        <p className="font-mono text-[13px] text-graphite">
          AWAITING TELEMETRY<span className="animate-pulse">█</span>
        </p>
      </div>
    )
  }
)

// Summary KPIs component
function SummaryKPIs() {
  const { mapLens } = useAppStore()
  
  // Calculate summary stats
  const avgLST = wardMetrics.reduce((sum, m) => sum + m.lst_avg_c, 0) / wardMetrics.length
  const hottestWard = wardMetrics.reduce((a, b) => a.lst_peak_c > b.lst_peak_c ? a : b)
  const hottestWardName = wards.find(w => w.id === hottestWard.ward_id)?.name || ''
  const wardsAboveThreshold = wardMetrics.filter(m => m.hvs >= 70).length
  
  return (
    <div className="flex items-center gap-8 py-4 border-b-2 border-ink/20">
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">AVG SURFACE TEMP</p>
        <p className="font-mono text-2xl">
          <MercuryTick value={avgLST} decimals={1} suffix="°C" />
        </p>
      </div>
      
      <div className="w-px h-10 bg-ink/30" aria-hidden="true" />
      
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">HOTTEST WARD</p>
        <p className="font-mono text-2xl text-vermillion">
          <MercuryTick value={hottestWard.lst_peak_c} decimals={1} suffix="°C" />
        </p>
        <p className="font-mono text-[10px] text-graphite mt-0.5">{hottestWardName.toUpperCase()}</p>
      </div>
      
      <div className="w-px h-10 bg-ink/30" aria-hidden="true" />
      
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">WARDS ABOVE THRESHOLD</p>
        <p className="font-mono text-2xl">
          <MercuryTick value={wardsAboveThreshold} decimals={0} />
          <span className="text-graphite text-lg">/{wardMetrics.length}</span>
        </p>
        <p className="font-mono text-[10px] text-graphite mt-0.5">HVS ≥ 70</p>
      </div>
      
      <div className="flex-1" />
      
      <div className="text-right">
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">ACTIVE LENS</p>
        <p className="font-mono text-sm uppercase tracking-wide">{mapLens}</p>
      </div>
    </div>
  )
}

// City selector (disabled for prototype)
function CitySelector() {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="city-select" className="font-mono text-[10px] uppercase text-graphite">
        CITY
      </label>
      <select
        id="city-select"
        disabled
        className="font-mono text-[13px] bg-bone border-2 border-ink/30 px-3 py-1.5 cursor-not-allowed opacity-60"
        aria-label="City selector - locked to Bengaluru"
      >
        <option>BENGALURU</option>
      </select>
      <span className="font-mono text-[9px] text-graphite uppercase border border-graphite/30 px-2 py-0.5">
        LOCKED
      </span>
    </div>
  )
}

export default function PlannerPage() {
  const router = useRouter()
  const { setSelectedWard } = useAppStore()
  
  const handleWardClick = (wardId: string) => {
    setSelectedWard(wardId)
    // Navigate to ward detail after a brief delay for the stamp animation
    setTimeout(() => {
      router.push(`/ward/${wardId}`)
    }, 250)
  }
  
  return (
    <>
      <Header />
      <PageLayout 
        marginAnnotation="CITY HEAT OVERVIEW"
        sheetNumber="01"
        revision="A"
      >
        <div className="p-6 pb-16">
          {/* Page header */}
          <header className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <SectionStamp>CITY HEAT RISK MAP</SectionStamp>
                <p className="font-accent italic text-[13px] text-graphite mt-1">
                  Ward-level heat vulnerability assessment with causal attribution
                </p>
              </div>
              <CitySelector />
            </div>
            <SummaryKPIs />
          </header>
          
          {/* Main content: Map + Priority Queue */}
          <div className="flex gap-6 h-[calc(100vh-320px)] min-h-[500px]">
            {/* Map panel - 65% */}
            <section 
              className="w-[65%] relative"
              aria-label="Heat risk choropleth map"
            >
              <ChoroplethMap 
                onWardClick={handleWardClick}
                className="h-full"
              />
            </section>
            
            {/* Priority queue panel - 35% */}
            <aside className="w-[35%] overflow-y-auto pr-2">
              <PriorityQueue 
                limit={5} 
                onWardSelect={handleWardClick}
              />
            </aside>
          </div>
          
          {/* Bottom annotation */}
          <footer className="mt-6 pt-4 border-t border-ink/20">
            <p className="font-accent italic text-[11px] text-graphite">
              Click any ward to drill into causal breakdown and intervention simulator. 
              Priority queue ranks wards by cooling ROI per rupee — the metric that matters for budget allocation.
            </p>
          </footer>
        </div>
      </PageLayout>
    </>
  )
}
