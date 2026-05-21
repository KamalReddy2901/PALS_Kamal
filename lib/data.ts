// Mock data for Bengaluru wards with realistic heat metrics
// Data schema designed for easy swap-in with real API endpoints

export interface Ward {
  id: string
  name: string
  population: number
  area_km2: number
  informal_settlement_pct: number
  income_proxy_score: number // 0-100, lower = more vulnerable
}

export interface WardMetrics {
  ward_id: string
  lst_avg_c: number
  lst_peak_c: number
  ndvi: number // 0-1, vegetation index
  impervious_pct: number
  building_density: number // buildings per km2
  albedo_avg: number // 0-1
  hvs: number // Heat Vulnerability Score 0-100
  causal_breakdown: {
    albedo: number
    canopy: number
    thermal_mass: number
    density: number
    anthropogenic: number
  }
}

export interface ForecastEntry {
  timestamp: string
  predicted_temp_c: number
  confidence_low: number
  confidence_high: number
}

export interface WardForecast {
  ward_id: string
  forecast: ForecastEntry[]
}

export interface InterventionType {
  id: 'trees' | 'cool_roof' | 'permeable'
  name: string
  description: string
  unit: string
  unit_cost_inr: number
  cooling_coefficient: number // degrees C reduction per unit
  time_to_effect_months: number
}

export interface Intervention {
  id: string
  ward_id: string
  type_id: 'trees' | 'cool_roof' | 'permeable'
  quantity: number
  predicted_delta_c: number
  estimated_cost_inr: number
  roi_score: number
  status: 'proposed' | 'approved' | 'executed'
  created_at: string
  owner: string
}

export interface VulnerabilityFactors {
  ward_id: string
  population_density: number // 0-100 normalized
  outdoor_worker_density: number // 0-100
  elderly_pct: number // 0-100
  green_cover_pct: number // actual percentage
  surface_material_score: number // 0-100, higher = worse
}

// Bengaluru Wards Mock Data
export const wards: Ward[] = [
  { id: 'whitefield', name: 'Whitefield', population: 245000, area_km2: 18.5, informal_settlement_pct: 8, income_proxy_score: 72 },
  { id: 'koramangala', name: 'Koramangala', population: 198000, area_km2: 12.3, informal_settlement_pct: 5, income_proxy_score: 81 },
  { id: 'kr-market', name: 'K.R. Market', population: 312000, area_km2: 8.7, informal_settlement_pct: 28, income_proxy_score: 34 },
  { id: 'majestic', name: 'Majestic', population: 287000, area_km2: 9.2, informal_settlement_pct: 22, income_proxy_score: 38 },
  { id: 'electronic-city', name: 'Electronic City', population: 178000, area_km2: 22.1, informal_settlement_pct: 12, income_proxy_score: 68 },
  { id: 'jayanagar', name: 'Jayanagar', population: 156000, area_km2: 14.8, informal_settlement_pct: 3, income_proxy_score: 85 },
  { id: 'malleshwaram', name: 'Malleshwaram', population: 142000, area_km2: 11.2, informal_settlement_pct: 4, income_proxy_score: 78 },
  { id: 'hebbal', name: 'Hebbal', population: 167000, area_km2: 16.4, informal_settlement_pct: 15, income_proxy_score: 62 },
  { id: 'yeshwanthpur', name: 'Yeshwanthpur', population: 234000, area_km2: 13.6, informal_settlement_pct: 18, income_proxy_score: 48 },
  { id: 'btm-layout', name: 'BTM Layout', population: 189000, area_km2: 10.8, informal_settlement_pct: 9, income_proxy_score: 71 },
  { id: 'banashankari', name: 'Banashankari', population: 212000, area_km2: 17.2, informal_settlement_pct: 6, income_proxy_score: 74 },
  { id: 'jp-nagar', name: 'J.P. Nagar', population: 178000, area_km2: 15.1, informal_settlement_pct: 7, income_proxy_score: 76 },
]

export const wardMetrics: WardMetrics[] = [
  { ward_id: 'whitefield', lst_avg_c: 38.2, lst_peak_c: 43.2, ndvi: 0.18, impervious_pct: 78, building_density: 1240, albedo_avg: 0.22, hvs: 87, causal_breakdown: { albedo: 47, canopy: 31, thermal_mass: 14, density: 5, anthropogenic: 3 } },
  { ward_id: 'koramangala', lst_avg_c: 36.8, lst_peak_c: 41.5, ndvi: 0.28, impervious_pct: 68, building_density: 1180, albedo_avg: 0.28, hvs: 72, causal_breakdown: { albedo: 38, canopy: 28, thermal_mass: 18, density: 12, anthropogenic: 4 } },
  { ward_id: 'kr-market', lst_avg_c: 40.1, lst_peak_c: 45.8, ndvi: 0.08, impervious_pct: 92, building_density: 2450, albedo_avg: 0.15, hvs: 94, causal_breakdown: { albedo: 52, canopy: 8, thermal_mass: 22, density: 14, anthropogenic: 4 } },
  { ward_id: 'majestic', lst_avg_c: 39.4, lst_peak_c: 44.6, ndvi: 0.12, impervious_pct: 88, building_density: 2180, albedo_avg: 0.18, hvs: 91, causal_breakdown: { albedo: 48, canopy: 12, thermal_mass: 24, density: 12, anthropogenic: 4 } },
  { ward_id: 'electronic-city', lst_avg_c: 37.6, lst_peak_c: 42.3, ndvi: 0.22, impervious_pct: 72, building_density: 890, albedo_avg: 0.25, hvs: 78, causal_breakdown: { albedo: 42, canopy: 26, thermal_mass: 16, density: 8, anthropogenic: 8 } },
  { ward_id: 'jayanagar', lst_avg_c: 34.8, lst_peak_c: 39.2, ndvi: 0.42, impervious_pct: 52, building_density: 920, albedo_avg: 0.35, hvs: 48, causal_breakdown: { albedo: 28, canopy: 42, thermal_mass: 14, density: 10, anthropogenic: 6 } },
  { ward_id: 'malleshwaram', lst_avg_c: 35.2, lst_peak_c: 39.8, ndvi: 0.38, impervious_pct: 56, building_density: 980, albedo_avg: 0.32, hvs: 52, causal_breakdown: { albedo: 32, canopy: 38, thermal_mass: 16, density: 8, anthropogenic: 6 } },
  { ward_id: 'hebbal', lst_avg_c: 36.4, lst_peak_c: 41.2, ndvi: 0.32, impervious_pct: 64, building_density: 780, albedo_avg: 0.28, hvs: 68, causal_breakdown: { albedo: 36, canopy: 32, thermal_mass: 18, density: 8, anthropogenic: 6 } },
  { ward_id: 'yeshwanthpur', lst_avg_c: 38.8, lst_peak_c: 43.8, ndvi: 0.16, impervious_pct: 82, building_density: 1560, albedo_avg: 0.20, hvs: 84, causal_breakdown: { albedo: 44, canopy: 18, thermal_mass: 22, density: 12, anthropogenic: 4 } },
  { ward_id: 'btm-layout', lst_avg_c: 37.2, lst_peak_c: 42.0, ndvi: 0.24, impervious_pct: 70, building_density: 1320, albedo_avg: 0.26, hvs: 74, causal_breakdown: { albedo: 40, canopy: 24, thermal_mass: 20, density: 12, anthropogenic: 4 } },
  { ward_id: 'banashankari', lst_avg_c: 35.8, lst_peak_c: 40.4, ndvi: 0.34, impervious_pct: 58, building_density: 1080, albedo_avg: 0.30, hvs: 58, causal_breakdown: { albedo: 34, canopy: 34, thermal_mass: 16, density: 10, anthropogenic: 6 } },
  { ward_id: 'jp-nagar', lst_avg_c: 35.4, lst_peak_c: 40.0, ndvi: 0.36, impervious_pct: 54, building_density: 1020, albedo_avg: 0.32, hvs: 54, causal_breakdown: { albedo: 32, canopy: 36, thermal_mass: 16, density: 10, anthropogenic: 6 } },
]

// Generate 48-hour forecast for each ward (deterministic, no Math.random)
function generateForecast(ward_id: string, basePeak: number): WardForecast {
  const forecast: ForecastEntry[] = []
  // Use a fixed reference time for SSR consistency
  const referenceTime = new Date('2026-05-21T00:00:00Z')
  
  // Simple seeded pseudo-random based on ward_id
  const seed = ward_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const seededRandom = (i: number) => {
    const x = Math.sin(seed * 9999 + i * 7) * 10000
    return x - Math.floor(x)
  }
  
  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(referenceTime.getTime() + i * 60 * 60 * 1000)
    const hour = timestamp.getHours()
    
    // Temperature curve: peaks at 14:30, low at 5:00
    let hourFactor: number
    if (hour >= 5 && hour <= 14) {
      hourFactor = (hour - 5) / 9 // Rising
    } else if (hour > 14 && hour <= 20) {
      hourFactor = 1 - (hour - 14) / 6 * 0.4 // Gradual decline
    } else {
      hourFactor = hour > 20 ? 0.6 - (hour - 20) / 9 * 0.3 : 0.3 + hour / 5 * 0.1
    }
    
    const baseTemp = basePeak - 8 // Base is 8 degrees below peak
    const variation = (seededRandom(i) - 0.5) * 0.4
    const predicted = baseTemp + hourFactor * 8 + variation
    const confidence = 1.2 + seededRandom(i + 100) * 0.6
    
    forecast.push({
      timestamp: timestamp.toISOString(),
      predicted_temp_c: Math.round(predicted * 10) / 10,
      confidence_low: Math.round((predicted - confidence) * 10) / 10,
      confidence_high: Math.round((predicted + confidence) * 10) / 10,
    })
  }
  
  return { ward_id, forecast }
}

export const wardForecasts: WardForecast[] = wardMetrics.map(wm => 
  generateForecast(wm.ward_id, wm.lst_peak_c)
)

export const interventionTypes: InterventionType[] = [
  {
    id: 'trees',
    name: 'Tree Planting',
    description: 'Native shade trees along arterial roads and public spaces',
    unit: 'trees',
    unit_cost_inr: 8500,
    cooling_coefficient: 0.0036, // degrees per tree
    time_to_effect_months: 24,
  },
  {
    id: 'cool_roof',
    name: 'Cool Roof Coating',
    description: 'High-reflectivity coating on building rooftops',
    unit: '% coverage',
    unit_cost_inr: 14000, // per percentage point
    cooling_coefficient: 0.022, // degrees per % coverage
    time_to_effect_months: 3,
  },
  {
    id: 'permeable',
    name: 'Permeable Surfaces',
    description: 'Replacing impervious surfaces with permeable paving',
    unit: '% area',
    unit_cost_inr: 28000, // per percentage point
    cooling_coefficient: 0.018, // degrees per % area
    time_to_effect_months: 6,
  },
]

export const interventions: Intervention[] = [
  { id: 'int-001', ward_id: 'kr-market', type_id: 'cool_roof', quantity: 15, predicted_delta_c: 0.33, estimated_cost_inr: 2100000, roi_score: 7.8, status: 'approved', created_at: '2026-04-15T10:00:00Z', owner: 'Ward Commissioner' },
  { id: 'int-002', ward_id: 'majestic', type_id: 'trees', quantity: 200, predicted_delta_c: 0.72, estimated_cost_inr: 1700000, roi_score: 8.2, status: 'executed', created_at: '2026-03-01T09:00:00Z', owner: 'BBMP Horticulture' },
  { id: 'int-003', ward_id: 'whitefield', type_id: 'permeable', quantity: 8, predicted_delta_c: 0.14, estimated_cost_inr: 2240000, roi_score: 6.4, status: 'proposed', created_at: '2026-05-10T14:00:00Z', owner: 'Ward Engineer' },
  { id: 'int-004', ward_id: 'yeshwanthpur', type_id: 'cool_roof', quantity: 20, predicted_delta_c: 0.44, estimated_cost_inr: 2800000, roi_score: 7.2, status: 'proposed', created_at: '2026-05-18T11:00:00Z', owner: 'Ward Commissioner' },
]

export const vulnerabilityFactors: VulnerabilityFactors[] = [
  { ward_id: 'whitefield', population_density: 72, outdoor_worker_density: 45, elderly_pct: 8, green_cover_pct: 12, surface_material_score: 78 },
  { ward_id: 'koramangala', population_density: 65, outdoor_worker_density: 38, elderly_pct: 12, green_cover_pct: 18, surface_material_score: 68 },
  { ward_id: 'kr-market', population_density: 95, outdoor_worker_density: 82, elderly_pct: 15, green_cover_pct: 4, surface_material_score: 92 },
  { ward_id: 'majestic', population_density: 88, outdoor_worker_density: 78, elderly_pct: 14, green_cover_pct: 6, surface_material_score: 88 },
  { ward_id: 'electronic-city', population_density: 52, outdoor_worker_density: 35, elderly_pct: 6, green_cover_pct: 15, surface_material_score: 72 },
  { ward_id: 'jayanagar', population_density: 48, outdoor_worker_density: 22, elderly_pct: 18, green_cover_pct: 32, surface_material_score: 52 },
  { ward_id: 'malleshwaram', population_density: 54, outdoor_worker_density: 28, elderly_pct: 22, green_cover_pct: 28, surface_material_score: 56 },
  { ward_id: 'hebbal', population_density: 58, outdoor_worker_density: 42, elderly_pct: 10, green_cover_pct: 22, surface_material_score: 64 },
  { ward_id: 'yeshwanthpur', population_density: 78, outdoor_worker_density: 65, elderly_pct: 12, green_cover_pct: 10, surface_material_score: 82 },
  { ward_id: 'btm-layout', population_density: 68, outdoor_worker_density: 48, elderly_pct: 8, green_cover_pct: 16, surface_material_score: 70 },
  { ward_id: 'banashankari', population_density: 55, outdoor_worker_density: 32, elderly_pct: 16, green_cover_pct: 24, surface_material_score: 58 },
  { ward_id: 'jp-nagar', population_density: 52, outdoor_worker_density: 28, elderly_pct: 14, green_cover_pct: 26, surface_material_score: 54 },
]

// Utility functions
export function getWardById(id: string): Ward | undefined {
  return wards.find(w => w.id === id)
}

export function getWardMetrics(wardId: string): WardMetrics | undefined {
  return wardMetrics.find(wm => wm.ward_id === wardId)
}

export function getWardForecast(wardId: string): WardForecast | undefined {
  return wardForecasts.find(wf => wf.ward_id === wardId)
}

export function getWardVulnerability(wardId: string): VulnerabilityFactors | undefined {
  return vulnerabilityFactors.find(vf => vf.ward_id === wardId)
}

export function getWardInterventions(wardId: string): Intervention[] {
  return interventions.filter(i => i.ward_id === wardId)
}

// Compute cooling ROI with diminishing returns
export function computeCoolingEffect(
  wardId: string,
  interventionInputs: { type_id: 'trees' | 'cool_roof' | 'permeable'; quantity: number }[]
): { predicted_delta_c: number; total_cost_inr: number; roi_score: number } {
  const ward = getWardById(wardId)
  const metrics = getWardMetrics(wardId)
  if (!ward || !metrics) return { predicted_delta_c: 0, total_cost_inr: 0, roi_score: 0 }
  
  // Sensitivity factor based on current HVS (higher HVS = more room for improvement)
  const sensitivityFactor = 0.8 + (metrics.hvs / 100) * 0.4
  
  let totalLinearDelta = 0
  let totalCost = 0
  
  for (const input of interventionInputs) {
    const type = interventionTypes.find(t => t.id === input.type_id)
    if (!type) continue
    
    totalLinearDelta += input.quantity * type.cooling_coefficient
    totalCost += input.quantity * type.unit_cost_inr
  }
  
  // Apply diminishing returns: actual = predicted × (1 − e^(−k·predicted))
  const k = 0.8
  const actualDelta = totalLinearDelta * sensitivityFactor * (1 - Math.exp(-k * totalLinearDelta))
  
  // ROI = (delta × population_exposed) / (cost / 1e5), normalized 0-10
  // Handle zero cost case
  if (totalCost === 0) {
    return {
      predicted_delta_c: 0,
      total_cost_inr: 0,
      roi_score: 0,
    }
  }
  
  const populationExposed = ward.population * (ward.informal_settlement_pct / 100 + 0.3)
  const rawRoi = (actualDelta * populationExposed) / (totalCost / 100000)
  const roiScore = Math.min(10, Math.max(0, rawRoi / 1000))
  
  return {
    predicted_delta_c: Math.round(actualDelta * 100) / 100,
    total_cost_inr: totalCost,
    roi_score: Math.round(roiScore * 10) / 10,
  }
}

// Get priority queue - top wards by cooling ROI per rupee
export function getPriorityQueue(limit: number = 5): Array<{
  ward: Ward
  metrics: WardMetrics
  topFactor: string
  roiPotential: number
}> {
  const wardData = wards.map(ward => {
    const metrics = getWardMetrics(ward.id)!
    const causal = metrics.causal_breakdown
    const topFactor = Object.entries(causal).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    
    // Estimate ROI potential based on HVS and vulnerability
    const roiPotential = (metrics.hvs / 10) * (1 + ward.informal_settlement_pct / 50)
    
    return { ward, metrics, topFactor, roiPotential }
  })
  
  return wardData
    .sort((a, b) => b.roiPotential - a.roiPotential)
    .slice(0, limit)
}

// Format currency in Indian notation
export function formatINR(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

// Get risk band for citizens
export function getRiskBand(hvs: number): { level: string; message: string; class: string } {
  if (hvs >= 85) return { 
    level: 'EXTREME', 
    message: 'Avoid all outdoor exposure 11:00–17:00. Seek air-conditioned shelter.',
    class: 'text-vermillion font-medium'
  }
  if (hvs >= 70) return { 
    level: 'HIGH', 
    message: 'Limit outdoor activity 13:00–16:00. Stay hydrated. Check on elderly neighbours.',
    class: 'text-vermillion'
  }
  if (hvs >= 55) return { 
    level: 'MODERATE', 
    message: 'Take precautions during peak afternoon hours. Avoid strenuous outdoor work.',
    class: 'text-ink'
  }
  return { 
    level: 'LOW', 
    message: 'Normal precautions recommended. Stay hydrated.',
    class: 'text-graphite'
  }
}
