# Urban Heat Island Intelligence — A decision engine for Bengaluru ward planners that maps block-level heat vulnerability, diagnoses its causes, and ranks cooling interventions by cost-effectiveness in rupees.

---

## The Problem

Indian cities experience 8–12°C temperature variation at the city-block level, but no planner has access to actionable, hyper-local heat data. Existing tools (satellite LST, GIS workflows, IoT pilots) all answer the same limited question — *where is it hot?* — and stop there. A ward commissioner with ₹50 lakhs to spend on cooling has no tool that tells them which intervention in which ward saves the most lives per rupee, why that ward is hot in the first place, or what the temperature curve looks like if they act.

---

## The Solution

Urban Heat Island Intelligence answers three questions no current tool answers together: **where** (ward-level choropleth ranked by Heat Vulnerability Score), **why** (causal attribution — albedo, canopy deficit, thermal mass, density, anthropogenic heat), and **what to do** (an intervention simulator that computes ΔT, cost, and ROI for tree planting, cool-roof coating, or permeable paving — live, as you drag sliders). Planners start on a Priority Queue ranked by cooling ROI per rupee, drill into any ward to see the causal breakdown and 48-hour forecast, simulate interventions, save them to a tracker, and hand off a decision with numbers attached. Citizens get a separate view: enter a ward name, get a plain-language risk rating and tomorrow's peak temperature.

---

## Live Demo

**https://pals-kamal.pages.dev**

Open it and click **K.R. Market** in the Priority Queue (rank #1) — then drag the Tree Planting slider to 500 trees in the Intervention Simulator and watch the forecast chart update and the ROI score tick up in real time.

---

## Key Features

- **Ranks all 12 Bengaluru wards by cooling ROI per rupee**, not just by temperature — the metric that maps directly to how planners actually allocate budgets
- **Attributes each ward's heat to five causal factors** (albedo, canopy deficit, thermal mass, building density, anthropogenic) with an animated stacked bar and percentage breakdown
- **Simulates stacked cooling interventions** using a diminishing-returns model: combined tree planting + cool roofs deliberately under-add, reflecting real-world sub-additivity
- **Saves simulations to an Interventions Tracker** with a one-click "VIEW TRACKER →" link in the post-save confirmation — the complete planner journey from map to logged decision requires zero manual navigation
- **Gives citizens a plain-language heat risk lookup** — type a ward name, get "EXTREME — avoid outdoor exposure 11:00–17:00" with today's and tomorrow's peak temperatures in °C
- **Animates every temperature reading with a split-flap digit effect** — magnitude-scaled duration so a 0.2°C change feels different from a 4°C change

---

## How It Works

The entire application runs as a static site — `next build` with `output: 'export'` pre-renders all 18 pages (including all 12 ward detail routes via `generateStaticParams`) to plain HTML/JS, deployed to Cloudflare Pages CDN with zero server infrastructure.

All "AI predictions" are pre-computed mock data in `lib/data.ts`: 48-hour forecasts generated from a seeded deterministic function (`Math.sin(seed × 9999 + i × 7)`) so SSR and client render identical HTML. The intervention simulator runs a transparent client-side model — `actual_delta = linear_delta × sensitivity_factor × (1 − e^(−k×linear_delta))` — where every coefficient is inspectable in source. ROI is `(delta × population_exposed) / (cost_INR / 1e5)` with vulnerability weighting (informal settlement %) baked in, normalized 0–10.

`Zustand` manages a 50-state undo/redo history for the simulator and is the single source of truth for interventions across all three views that display them: the ward detail page, the citizen `RiskCard`, and the `/interventions` tracker all read from `useAppStore((s) => s.interventions)` — so a save from the simulator propagates instantly everywhere without a re-fetch or page reload. The choropleth uses `react-leaflet` with approximate 10-point polygons for each ward at real BBMP geographic coordinates, colored with a single-hue Vermillion ramp interpolated across six stops.

The design system is fully custom: three typefaces (Fraunces display, JetBrains Mono telemetry, Newsreader italic annotations), three brand colors (`#EDE6D3` Gazetteer Bone / `#1A1A1A` Press Black / `#E84E1B` Vermillion Siren), zero border-radius, no card shadows — every boundary drawn by rule lines. The `MercuryTick` component animates numerals digit-by-digit with `framer-motion`'s `AnimatePresence`, duration proportional to the magnitude of the value change.

---

## Built With

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom design tokens |
| Animation | Framer Motion |
| Charts | Recharts (line, area, composed) |
| Map | react-leaflet + Leaflet + custom GeoJSON |
| State | Zustand (with undo/redo history) |
| Fonts | Google Fonts — Fraunces, JetBrains Mono, Newsreader |
| Deployment | Cloudflare Pages (static CDN) |

---

## Design System — 1970s ISRO Field Report Aesthetic

The entire UI follows a strict **1970s ISRO field report aesthetic** — designed to look like technical documentation from India's early space program, not a modern SaaS dashboard.

### Typography (Three-Typeface System)
- **Fraunces** (font-serif font-black) — Section stamps, empty states, vertical labels, large display numerals
- **JetBrains Mono** (font-mono) — All body text, data, labels, telemetry readouts
- **Newsreader** (font-accent italic) — Annotations, descriptions, margin notes

### Color Palette (Three Brand Colors Only)
- **Gazetteer Bone** `#EDE6D3` — Background, paper texture
- **Press Black** `#1A1A1A` — Primary text, borders, ruled lines
- **Vermillion Siren** `#E84E1B` — Heat accent, alerts, hover states

### Visual Language
- **Zero border radius** — All elements are sharp rectangles
- **No card shadows** — Every boundary drawn by rule lines (`border-2`)
- **Ruled ledger grid** — Horizontal lines every 32px (`.ruled-grid` background)
- **Paper grain texture** — Subtle SVG noise overlay (`.paper-grain::before`)
- **Registration marks** — Corner `+` symbols on every page
- **Industrial borders** — All major UI elements use `border-2` (2px) not `border` (1px)
- **Mercury Tick animations** — All numerals animate digit-by-digit with magnitude-scaled duration
- **Bleeding elements** — Causal breakdown bar deliberately extends past grid edge with `-mr-12`
- **Off-balance empty states** — Fraunces italic with asymmetric `pl-8` positioning

### Interactive States
- **Buttons**: `border-2` + `hover:bg-vermillion` or `hover:bg-ink` + `transition-all`
- **Inputs**: `border-2` + `focus:border-vermillion` + `transition-all`
- **Table rows**: `hover:bg-vermillion/[0.03]` + `transition-colors`
- **Map controls**: `border-2` + `hover:border-ink hover:bg-ink/5`
- **Priority queue cards**: `border-b-2` + `hover:border-vermillion` on selection

Every screen was audited to ensure zero generic Tailwind/shadcn styling remains — the goal was for every page to look like it was designed by a boutique studio, not generated by an AI tool.

---

## Running Locally

```bash
git clone https://github.com/KamalReddy2901/PALS_Kamal.git
cd PALS_Kamal
pnpm install
pnpm dev
```

App runs at **http://localhost:3000** and redirects to `/planner`.

To build and preview the production static export:

```bash
pnpm build       # outputs to ./out
pnpm start       # or: npx serve out
```

No environment variables required. All data is local JSON — no API keys, no backend.

---

## What We'd Build Next

1. **Real BBMP ward GeoJSON** — replace the 10-point approximations with the 198 official BBMP ward boundaries from Karnataka's open data portal. The choropleth infrastructure, color logic, and click handlers are already in place; this is a data swap.

2. **PDF Heat Action Brief export** — the ward detail page is already laid out as a printable A4 sheet (designed that way from the start, per spec). Adding `react-to-print` gives planners a one-click document for council budget submissions with map, causal breakdown, and simulation results.

3. **Live LST ingestion via Google Earth Engine REST** — `lib/data.ts` exports `WardMetrics` with a schema that directly mirrors the real API response shape. Swapping the static JSON for a `GET /wards/:id/metrics` endpoint would give planners 1-hour-fresh satellite surface temperature data with no frontend changes.

---

## Challenge Requirements Coverage

| Requirement | How We Addressed It | Location in Codebase |
|---|---|---|
| City Heat Risk Map — choropleth by ward, HVS color scale, click-to-drill | Interactive Leaflet choropleth with Vermillion ramp on Bone, single-hue HVS/LST/Canopy/Vulnerability lens toggle, ward click navigates to detail page | `components/choropleth-map.tsx`, `lib/geo-data.ts` |
| Heat Vulnerability Score (HVS) composite per ward | HVS 0–100 per ward seeded in mock data; displayed as large stamped numeral with EXTREME/HIGH/MODERATE/LOW risk band | `lib/data.ts` (wardMetrics), `app/ward/[id]/ward-detail.tsx` |
| Causal Breakdown per ward — % heat contribution by factor | Animated horizontal stacked bar (albedo, canopy, thermal mass, density, anthropogenic) with Fraunces factor labels and percentages | `components/causal-breakdown.tsx` |
| 48-hour Block-Level Forecast — line chart per ward | Recharts ComposedChart with prediction line, confidence band area, 40°C reference threshold, peak time indicator | `components/forecast-chart.tsx`, `lib/data.ts` (generateForecast) |
| Intervention Simulator — exactly 3 levers locked (trees, cool roofs, permeable); ΔT, cost, ROI, 3-year projection | Three sliders with live ΔT/cost/ROI; diminishing-returns model; intervention overlay on forecast chart; undo/redo history | `components/intervention-simulator.tsx`, `lib/data.ts` (computeCoolingEffect) |
| Priority Queue — top-N wards ranked by cooling-ROI-per-rupee | First-class right panel on `/planner` showing top 5 wards with HVS, peak temp, top causal factor, sparkline, and ROI potential score | `components/priority-queue.tsx`, `lib/data.ts` (getPriorityQueue) |
| Citizen View — public map + heat risk lookup + plain-language risk band | Separate `/citizen` route with ward name search (`role="combobox"`, `aria-haspopup="listbox"`, blur-to-close), today/tomorrow peak temp, EXTREME/HIGH/MODERATE/LOW risk message, interventions list synced live from store | `app/citizen/page.tsx` |
| Mock data layer — realistic Bengaluru ward-level seed data | 12 Bengaluru wards with population, area, income proxy, LST, NDVI, causal breakdowns, 48h forecasts, vulnerability factors | `lib/data.ts`, `lib/geo-data.ts` |
| Costs in ₹, temperatures in °C, units localized to India | Indian Rupee formatting via `Intl.NumberFormat('en-IN')`, IST timezone on all date display, °C throughout | `lib/data.ts` (formatINR), `components/forecast-chart.tsx` |
| No login wall in prototype | All routes fully public; no auth gates anywhere in the routing layer | `app/` — all routes |
| Explicit confidence bands on forecasts | confidence_low / confidence_high per hourly entry rendered as filled Area on the forecast chart | `components/forecast-chart.tsx` (confidenceRange Area) |
| Plain-language risk bands for citizens | getRiskBand() maps HVS to human-readable advisory with specific hours to avoid | `lib/data.ts` (getRiskBand), `app/citizen/page.tsx` |
| Mock data labeled as such | Persistent footer on every page shows `MOCK` in Vermillion — cannot be missed | `components/page-layout.tsx` (footer) |
| City selector present but disabled — signals architecture-readiness | Bengaluru selector with `disabled` attribute and "(LOCKED)" label present on `/planner` | `app/planner/page.tsx` (CitySelector) |
| Interventions Tracker — log proposed/approved/executed interventions | Full `/interventions` page with table, status filter, sort, summary stats; "Save to Tracker" from simulator posts to Zustand store and shows inline "VIEW TRACKER →" link; "+ New Intervention" sheet; ward detail and citizen view also read live from store | `app/interventions/page.tsx`, `lib/store.ts` (addIntervention), `components/intervention-simulator.tsx` |
| Semantic HTML, no broken links | `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `aria-label`, `aria-current`, `role` throughout; citizen lookup uses correct `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` ARIA pattern; all internal links verified in static build | All page and component files |
| Zero console errors | Tooltip value type guard; sidebar `Math.random` hydration fix; IST timezone on all date renders; Vercel Analytics removed; unused `useRouter` + `interventions` imports removed from simulator; `<Suspense>` boundary added around `use(params)` in ward page to prevent React Suspense console error | `components/forecast-chart.tsx`, `components/ui/sidebar.tsx`, `app/layout.tsx`, `app/ward/[id]/page.tsx` |
| Deployable — no broken build | Static export verified: `pnpm build` produces 18 pre-rendered routes, zero errors | `next.config.mjs`, `app/ward/[id]/page.tsx` |
