'use client'

import { useEffect, useState } from 'react'
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import type { Layer, PathOptions } from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import { bengaluruGeoJSON } from '@/lib/geo-data'
import { wardMetrics, type WardMetrics } from '@/lib/data'
import { useAppStore, type MapLens } from '@/lib/store'
import 'leaflet/dist/leaflet.css'

// Get color based on value and lens
function getColor(wardId: string, lens: MapLens): string {
  const metrics = wardMetrics.find(m => m.ward_id === wardId)
  if (!metrics) return '#EDE6D3'
  
  let value: number
  let min: number
  let max: number
  
  switch (lens) {
    case 'hvs':
      value = metrics.hvs
      min = 40
      max = 100
      break
    case 'lst':
      value = metrics.lst_peak_c
      min = 38
      max = 46
      break
    case 'canopy':
      // Invert: more canopy = cooler = less red
      value = 100 - (metrics.ndvi * 100)
      min = 0
      max = 100
      break
    case 'vulnerability':
      // Use impervious percentage as proxy
      value = metrics.impervious_pct
      min = 50
      max = 95
      break
    default:
      value = metrics.hvs
      min = 40
      max = 100
  }
  
  // Normalize to 0-1
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)))
  
  // Vermillion ramp on bone: #EDE6D3 -> #E84E1B
  const colors = [
    '#EDE6D3', // Bone
    '#E8DFC8', 
    '#F5D4B3',
    '#F5B88A',
    '#F29560',
    '#E84E1B', // Vermillion
  ]
  
  const index = Math.min(Math.floor(normalized * (colors.length - 1)), colors.length - 2)
  const t = (normalized * (colors.length - 1)) - index
  
  // Interpolate between adjacent colors
  const c1 = colors[index]
  const c2 = colors[index + 1]
  
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 7), 16)
  
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  
  return `rgb(${r}, ${g}, ${b})`
}

// Map legend component
function MapLegend({ lens }: { lens: MapLens }) {
  const labels: Record<MapLens, { title: string; low: string; high: string }> = {
    hvs: { title: 'HEAT VULNERABILITY SCORE', low: '40', high: '100' },
    lst: { title: 'LAND SURFACE TEMP (°C)', low: '38', high: '46' },
    canopy: { title: 'CANOPY COVER', low: 'HIGH', high: 'LOW' },
    vulnerability: { title: 'IMPERVIOUS SURFACE %', low: '50', high: '95' },
  }
  
  const label = labels[lens]
  
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-bone border border-ink p-3">
      <p className="font-mono text-[9px] uppercase tracking-wide text-graphite mb-2">
        {label.title}
      </p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-graphite">{label.low}</span>
        <div 
          className="w-24 h-3 border border-ink/30"
          style={{
            background: 'linear-gradient(to right, #EDE6D3, #E8DFC8, #F5D4B3, #F5B88A, #F29560, #E84E1B)'
          }}
        />
        <span className="font-mono text-[10px] text-graphite">{label.high}</span>
      </div>
    </div>
  )
}

// Lens selector
function LensSelector() {
  const { mapLens, setMapLens } = useAppStore()
  
  const lenses: { id: MapLens; label: string }[] = [
    { id: 'hvs', label: 'HVS' },
    { id: 'lst', label: 'LST' },
    { id: 'canopy', label: 'CANOPY' },
    { id: 'vulnerability', label: 'VULN' },
  ]
  
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-bone border border-ink p-2">
      <p className="font-mono text-[9px] uppercase tracking-wide text-graphite mb-2">
        MAP LENS
      </p>
      <div className="flex gap-1">
        {lenses.map(lens => (
          <button
            key={lens.id}
            onClick={() => setMapLens(lens.id)}
            className={`px-2 py-1 font-mono text-[10px] uppercase border transition-colors ${
              mapLens === lens.id
                ? 'bg-ink text-bone border-ink'
                : 'bg-bone text-ink border-ink/30 hover:border-ink'
            }`}
            aria-label={`Switch to ${lens.label} view`}
            aria-pressed={mapLens === lens.id}
          >
            {lens.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Component to handle map interactions
function MapController({ onWardClick }: { onWardClick: (wardId: string) => void }) {
  const map = useMap()
  const { mapLens, selectedWardId } = useAppStore()
  
  // Style function for GeoJSON
  const style = (feature: Feature<Geometry, { id: string; name: string }> | undefined): PathOptions => {
    const wardId = feature?.properties?.id || ''
    const isSelected = wardId === selectedWardId
    
    return {
      fillColor: getColor(wardId, mapLens),
      weight: isSelected ? 2 : 1,
      opacity: 1,
      color: isSelected ? '#E84E1B' : '#1A1A1A',
      fillOpacity: 0.85,
    }
  }
  
  // Handle each feature
  const onEachFeature = (
    feature: Feature<Geometry, { id: string; name: string }>,
    layer: Layer
  ) => {
    const wardId = feature.properties.id
    const wardName = feature.properties.name
    const metrics = wardMetrics.find(m => m.ward_id === wardId)
    
    // Tooltip
    if (metrics && 'bindTooltip' in layer) {
      ;(layer as L.Path).bindTooltip(
        `<div class="font-mono text-[11px]">
          <strong>${wardName}</strong><br/>
          HVS: ${metrics.hvs} | Peak: ${metrics.lst_peak_c}°C
        </div>`,
        { 
          className: 'leaflet-tooltip-custom',
          direction: 'top',
          offset: [0, -10]
        }
      )
    }
    
    // Click handler with stamp animation
    if ('on' in layer) {
      ;(layer as L.Path).on({
        click: () => {
          onWardClick(wardId)
          // Stamp animation - brief scale
          if ('setStyle' in layer) {
            const path = layer as L.Path
            const originalWeight = path.options.weight || 1
            path.setStyle({ weight: 3 })
            setTimeout(() => {
              path.setStyle({ weight: originalWeight })
            }, 220)
          }
        },
        mouseover: (e) => {
          const path = e.target as L.Path
          path.setStyle({ weight: 2 })
        },
        mouseout: (e) => {
          const path = e.target as L.Path
          const isSelected = feature.properties.id === selectedWardId
          path.setStyle({ weight: isSelected ? 2 : 1 })
        }
      })
    }
  }
  
  return (
    <GeoJSON
      key={`${mapLens}-${selectedWardId}`}
      data={bengaluruGeoJSON}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}

interface ChoroplethMapProps {
  onWardClick: (wardId: string) => void
  className?: string
}

export function ChoroplethMap({ onWardClick, className = '' }: ChoroplethMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { mapLens } = useAppStore()
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return (
      <div className={`bg-bone border border-ink flex items-center justify-center ${className}`}>
        <p className="font-mono text-[13px] text-graphite">
          AWAITING TELEMETRY<span className="animate-pulse">█</span>
        </p>
      </div>
    )
  }
  
  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <MapContainer
        center={[12.95, 77.60]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
        className="border border-ink"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          className="grayscale"
        />
        <MapController onWardClick={onWardClick} />
      </MapContainer>
      <LensSelector />
      <MapLegend lens={mapLens} />
      
      {/* Custom tooltip styles */}
      <style jsx global>{`
        .leaflet-tooltip-custom {
          background: #EDE6D3 !important;
          border: 1px solid #1A1A1A !important;
          border-radius: 0 !important;
          padding: 6px 10px !important;
          box-shadow: none !important;
        }
        .leaflet-tooltip-custom::before {
          border-top-color: #1A1A1A !important;
        }
        .leaflet-container {
          font-family: 'JetBrains Mono', monospace !important;
        }
      `}</style>
    </motion.div>
  )
}
