# Urban Heat Island Intelligence System — Implementation Spec

## 1. Problem Restatement

- Indian cities have block-level heat variation of 8–12°C, but no actor — planner, citizen, or worker — has access to **actionable, hyper-local, causal** heat data.
- Existing tools fail in three ways:
  - **Satellite LST** is too coarse (100m+) and 1–16 days stale.
  - **GIS workflows** are static, expert-only, and produce PDFs not decisions.
  - **IoT pilots** are sparse, siloed, and have no prediction or public interface.
- We are NOT building another heat map. We are building a **decision engine** that answers three questions no current tool answers together:
  1. **Where** is it hot, down to the city block?
  2. **Why** is it hot (causal attribution: albedo, canopy, density, thermal mass)?
  3. **What single intervention** yields the highest cooling-per-rupee ROI, and what is the projected temperature curve if executed?
- Primary user: **city/ward planner** making budget allocation decisions. Secondary: **citizen / RWA / journalist** needing accountability and personal risk awareness.

---

## 2. Core User Journey (Planner — the load-bearing flow)

1. Planner lands on **City Overview** — choropleth of all wards ranked by Heat Vulnerability Score (HVS).
2. Planner sees a **Priority Queue**: "Top 5 wards by cooling-ROI-per-rupee" (the winning-angle ranking).
3. Planner clicks **Ward #1 (e.g., Whitefield)** → drills into ward detail.
4. **Causal Breakdown Card** shows the why: 47% low albedo, 31% zero canopy, 14% building thermal mass, 8% population density.
5. **48-hour Forecast Chart** shows tomorrow's predicted peak: 43.2°C at 14:30.
6. Planner opens **Intervention Simulator**:
   - Drags slider: "Add 500 trees along arterial roads" → projected −1.8°C in 2 years, ₹42L cost, ROI score 8.4
   - Toggles: "Cool-roof rollout on 200 buildings" → −1.1°C in 1 year, ₹28L, ROI 7.2
   - Stacks both → −2.6°C, ₹70L, ROI 8.9 (sub-additive)
7. Planner exports a **Heat Action Brief** (PDF) — auto-generated 1-pager for council submission with map, causal breakdown, simulation result, projected 3-year curve.
8. Action is logged into **Interventions Tracker** for later effectiveness audit.

---

## 3. Feature List

### 3.1 Must Have (MVP)

- **City Heat Risk Map** — choropleth by ward; HVS color scale; click-to-drill.
- **Heat Vulnerability Score (HVS)** composite per ward: LST + NDVI + impervious surface % + building density + population density + income proxy.
- **Causal Breakdown** per ward (donut/stacked bar) — % heat contribution by factor.
- **48-hour Block-Level Forecast** — LSTM/Prophet-style line chart per ward.
- **Intervention Simulator** — exactly 3 levers (locked): tree planting, cool roofs, permeable surfaces; before/after temperature delta, cost estimate, ROI score, 3-year projection curve.
- **Priority Queue** — top-N wards ranked by cooling-ROI-per-rupee.
- **Citizen View (read-only)** — public map + "What's the heat risk on my street right now / tomorrow at 2pm?" lookup by address/pin.
- **Mock data layer** — realistic Bengaluru ward-level seed data (since live satellite/IoT integration is out of scope for prototype).

### 3.2 Should Have

- **Interventions Tracker** — log proposed/approved/executed interventions; compare predicted vs observed (stub).
- **Vulnerability lens toggle** — overlay informal settlements, outdoor-worker density, elderly population.
- **Alert subscriptions** — citizen pin-code SMS/push stub for >40°C forecast.
- **Comparison mode** — side-by-side two wards or two intervention scenarios.

### 3.3 Won't Have (explicitly out of scope)

- **Heat Action Brief PDF export** — cut from prototype to protect demo timeline; the on-screen ward detail is designed as a printable sheet so this is a future-day addition, not a redesign.
- Live satellite ingestion (MODIS/Landsat API).
- Real IoT sensor integration.
- Authentication / multi-tenant gov accounts.
- Mobile native app (responsive web only).
- ML model training in-app — predictions are pre-computed mock outputs from a documented model spec.
- **Multi-city support — locked to Bengaluru.** City selector in the header is present but disabled, signaling architecture-readiness without scope creep.
- Additional intervention levers beyond the three locked ones (no water bodies, no shade structures, no albedo paint as separate lever — these are explicitly deferred).
- Historical observed-vs-predicted audit dashboard (stub only).

---

## 4. Tech Stack

| Layer | Choice | Justification |
|---|---|---|
| Framework | **React + Vite + TypeScript** | Required by Figma Make runtime; component model fits dashboard. |
| Styling | **Tailwind CSS v4** + design system kit | Required by environment; speeds layout. |
| Map | **react-leaflet** + GeoJSON choropleth | Open, no API key, supports ward polygons + click handlers. Mapbox/Google ruled out (key + cost). |
| Charts | **recharts** | Designated; covers line (forecast), donut (causal), bar (vulnerability), area (projection). |
| State | **Zustand** (lightweight) | Avoids Redux ceremony; dashboard has shared selected-ward + simulator state. |
| Forecast/ROI computation | **Client-side deterministic mock model** in TS | No backend needed; pre-seeded coefficients per ward; simulator math runs locally for instant slider feedback. |
| Data | Static JSON in `/src/data/` — wards.geojson, ward_metrics.json, forecasts.json, intervention_coefficients.json | Prototype-grade; mirrors real schema so backend swap is trivial. |
| PDF export | **react-to-print** or `jspdf` | Local generation, no server. |
| Routing | **react-router** | Three top-level routes: `/planner`, `/citizen`, `/ward/:id`. |

- **No backend.** All "AI predictions" are pre-computed and shipped as JSON. The simulator runs a transparent linear/log model on the client. This is honest and demonstrable — judges can inspect inputs/outputs.

---

## 5. Page / Screen Breakdown

### 5.1 `/planner` — City Overview (default landing)

- **Purpose:** Give a planner the city-wide heat picture and the priority queue in one glance.
- **Key components:**
  - Map panel (left, 65%): Bengaluru ward choropleth colored by HVS; legend; lens toggle (HVS / LST / canopy / vulnerability).
  - Priority Queue panel (right, 35%): ranked card list — top 5 wards with mini-sparkline, HVS, top causal factor, "Open" button.
  - Top bar: city selector (Bengaluru only, disabled others), date selector, summary KPIs (avg LST, hottest ward, # wards above threshold).
- **Data:** wards.geojson, ward_metrics.json (HVS, LST, factors per ward).

### 5.2 `/ward/:id` — Ward Detail + Simulator

- **Purpose:** Diagnose one ward and design an intervention.
- **Key components:**
  - Ward mini-map with block-level heat overlay.
  - **Causal Breakdown** donut + factor list with explanations.
  - **48-hour Forecast** line chart with peak-time markers.
  - **Vulnerability Radar** — population, surface material, green cover, income proxy, outdoor-worker density.
  - **Intervention Simulator** — three sliders only: trees added (count), cool-roof coverage (%), permeable surface (%). Live updates: ΔTemp, cost ₹, ROI score, 3-year projected curve overlay on forecast chart.
  - **Action footer:** "Save to Interventions Tracker" + scrubbable simulator history (left/right arrow).
- **Data:** ward detail JSON, intervention_coefficients.json, forecasts.json.

### 5.3 `/citizen` — Public View

- **Purpose:** Let a resident/worker check their street's risk and see what the city is doing.
- **Key components:**
  - Address/pin lookup → returns current HVS, forecast peak today + tomorrow, plain-language risk band ("High — avoid outdoor exposure 13:00–16:00").
  - Same choropleth (read-only, simplified legend).
  - "Interventions in your ward" list — pulled from tracker.
- **Data:** ward_metrics.json, forecasts.json, interventions.json.

### 5.4 `/interventions` — Tracker (Should Have)

- **Purpose:** Log + compare interventions.
- **Components:** table (ward, type, cost, predicted ΔT, status, owner), filter by status.

---

## 6. Data Model

### Entities

- **Ward**
  - `id`, `name`, `geometry` (GeoJSON polygon), `population`, `area_km2`, `informal_settlement_pct`, `income_proxy_score`
- **WardMetrics** (one per ward, current snapshot)
  - `ward_id`, `lst_avg_c`, `lst_peak_c`, `ndvi`, `impervious_pct`, `building_density`, `albedo_avg`, `hvs` (0–100), `causal_breakdown` { albedo, canopy, thermal_mass, density, anthropogenic } (sums to 100)
- **Forecast**
  - `ward_id`, `timestamp`, `predicted_temp_c`, `confidence_band` [low, high]
  - 48 hourly entries per ward
- **InterventionType** (catalog)
  - `id` ∈ { `trees`, `cool_roof`, `permeable` } — closed set, exactly three. Fields: `unit`, `unit_cost_inr`, `cooling_coefficient` (per-unit ΔT), `time_to_effect_months`.
- **Intervention** (instance, in tracker)
  - `id`, `ward_id`, `type_id`, `quantity`, `predicted_delta_c`, `estimated_cost_inr`, `roi_score`, `status` (proposed | approved | executed), `created_at`, `owner`
- **VulnerabilityFactors** (radar)
  - `ward_id`, `population_density`, `outdoor_worker_density`, `elderly_pct`, `green_cover_pct`, `surface_material_score`

### Relationships

- Ward 1—1 WardMetrics
- Ward 1—N Forecast (48)
- Ward 1—N Intervention
- Intervention N—1 InterventionType
- Ward 1—1 VulnerabilityFactors

### ROI computation (client model, documented)

- `predicted_delta_c = Σ (intervention.quantity × type.cooling_coefficient × ward.sensitivity_factor)` with diminishing returns: `actual = predicted × (1 − e^(−k·predicted))`.
- `roi_score = (predicted_delta_c × population_exposed) / (cost_inr / 1e5)`, normalized 0–10.

---

## 7. API / Integration Requirements

- **MVP:** none — all data is local JSON.
- **Schema is designed for swap-in of real endpoints:**
  - `GET /wards` → GeoJSON FeatureCollection
  - `GET /wards/:id/metrics`
  - `GET /wards/:id/forecast?hours=48`
  - `GET /intervention-types`
  - `POST /interventions` (tracker)
  - `POST /simulate` (body: `{ward_id, interventions: [{type_id, quantity}]}`) → ΔT, cost, ROI, 3-year curve
- **Future real integrations (documented, not built):**
  - MODIS/Landsat LST via Google Earth Engine REST.
  - OpenWeatherMap for ambient temperature ground-truth.
  - Bhuvan/ISRO land-cover for NDVI.
  - Census of India for population/vulnerability layers.

---

## 8. Key UX Decisions

- **Priority Queue is first-class, not the map.** Most "heat dashboards" lead with a map and stop. We lead with **ranked actions** — the map is the evidence, the queue is the product.
- **Causal Breakdown before Forecast.** Planners ask "why" before "when". Forecasts without causes drive panic, not decisions.
- **Simulator updates live on the forecast chart**, not in a separate modal. The whole point is feeling the cooling effect over time — context-switching kills that intuition.
- **Citizen view is a separate route, not a toggle.** The two audiences have orthogonal information needs; mixing them creates a worse experience for both.
- **Costs in ₹, temperatures in °C, units localized to India.** Non-negotiable for credibility with target users.
- **No login wall in prototype.** Friction kills demos; auth is a known commodity and out of scope.
- **Explicit confidence bands on forecasts.** Showing uncertainty is a trust signal vs. tools that show false-precision single lines.
- **Plain-language risk bands for citizens** ("High — avoid 13–16h"), not raw °C, because behavioral nudges require interpretation.
- **Mock data is labeled as such** in a small banner. Honesty beats fake credibility with judges.

---

## 9. What Makes This Novel

- **Causal + Prescriptive, not just Descriptive.** Every other tool stops at "here is a hot map." We answer *why* and *what to do*, ranked by ROI per rupee. This is the single insight from the brief.
- **Cooling ROI per rupee** as the headline metric — directly maps to the constraint planners actually have (budget), not the metric academics use (°C reduction in isolation).
- **Simulator with diminishing returns + stacking interactions** — not a linear "trees × coefficient" toy. Reflects real-world sub-additivity (canopy + cool-roof don't perfectly stack).
- **Two-audience product on one data spine.** Planner decision engine and citizen risk lookup share the same HVS + forecast layer. Most projects pick one audience; we serve both without splitting the data model.
- **Vulnerability-weighted scoring**, not just temperature. A 41°C ward of outdoor workers in informal housing scores higher priority than a 43°C ward of air-conditioned offices — directly addresses the equity gap the research flagged.
- **Transparent client-side model.** Judges and users can inspect coefficients in `intervention_coefficients.json`. Beats opaque "AI" black-boxes that lose trust on first wrong prediction.
- **Heat Action Brief export** — bridges the dashboard-to-government-decision gap that kills most civic-tech prototypes. The output is a deliverable, not a dashboard screenshot.
