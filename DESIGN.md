# Urban Heat Island Intelligence System — Design Decision Document

## 0. The Inevitable Aesthetic

- **Commitment:** **Utilitarian Industrial × Government Field Report.**
- **Reference mood:** the visual language of a 1970s ISRO technical bulletin, a NOAA weather briefing, and a printed Indian municipal gazette — re-rendered for a screen. Monospaced telemetry, ruled-line grids, oversized stamped headers, marginalia annotations, and the feel of a document that exists to *be acted on*, not admired.
- **Why this is inevitable for this product:**
  - The user is a **city planner making budget decisions under heat-emergency pressure** — the design must signal *instrument*, not *app*.
  - The data is **measurement, attribution, and forecast** — three things the industrial/scientific document tradition has solved visually for 80 years. Borrow that authority instead of inventing a new dashboard chrome.
  - The problem is **lethal, slow, and local** — luxury minimalism would feel callous, brutalism would feel performative, editorial would feel detached. A field-report aesthetic says: *this is a working tool, used by people who are accountable.*
  - It directly counters the SaaS-dashboard default (rounded cards, soft shadows, friendly purple) that has made every civic-tech product look the same and trustworthy to no one.

---

## 1. Typography

### 1.1 Display — **GT Sectra**… *no, available-on-Google-Fonts substitution:* **Fraunces**

- **Display face:** **Fraunces** (Google Fonts) — variable, with `opsz` (optical size) and `SOFT` axes pushed toward the sharper, more wedge-serif end. Used at extreme sizes (96–220px) for ward numbers, peak temperatures, and section stamps.
- **Why Fraunces:** it has the heft of a 19th-century gazetteer headline but a contemporary sharpness — it reads as *official document* without becoming costume. The variable axes let us push it into something distinctly ours (high contrast, narrow optical size at large display, softer at mid-size).

### 1.2 Body / Data — **JetBrains Mono**

- **Body + all numerical data:** **JetBrains Mono** (Google Fonts), Regular 400 and Medium 500 only.
- **Why:** every number in this product is a **measurement** — temperature, hectares, rupees, hours-to-peak. Monospaced numerals make columns align without effort, and they enforce the *telemetry* feel. Also: every default civic-tech dashboard uses Inter. Choosing mono for body copy (not just for code) is the single boldest typographic move available here, and it commits to the instrument metaphor.

### 1.3 Accent / Marginalia — **Newsreader** (Italic only)

- **Tertiary face:** **Newsreader** (Google Fonts), Italic 400.
- **Used only for:** annotation copy, footnotes, "as recorded by" attributions, the running header on the Heat Action Brief, citizen-facing plain-language risk descriptions. Never for UI controls.
- **Why three faces, not two:** the tension we want is *machine readout (mono) vs. human judgment (italic newsreader) vs. stamped authority (Fraunces)*. The three faces map directly to the three things the product is: a sensor, a recommendation, and a document of record.

### 1.4 Typographic Rules

- Display is set in **ALL CAPS with negative tracking (−2%)** at sizes ≥ 64px; sentence case below.
- Body mono is set at **13px / 18px line height** — slightly tight, deliberately documentary, not cozy.
- Numerals always tabular. Temperatures always show one decimal (`41.3°C`, never `41°`). Costs always full (`₹42,00,000`, Indian comma grouping).
- Headlines may **break mid-word with a soft hyphen** when constrained — a deliberate print-typesetting move; sans-serif dashboards never do this.

---

## 2. Color Palette

Three hexes. No fourth without a fight.

| Token | Hex | Name | Role | Reason |
|---|---|---|---|---|
| Background | **`#EDE6D3`** | **Gazetteer Bone** | Dominant surface | Off-white with a warm green-yellow undertone — the color of cheap recycled paper used in Indian government print runs. Immediately reads as *document, not screen*. Refuses the "clean white SaaS" default and the "dark mode tech" default in one move. |
| Primary text + ink | **`#1A1A1A`** | **Press Black** | All text, ruled lines, frames, map base | True near-black, the color of newsprint ink that has bled slightly into fiber. Maximum contrast on the bone background; reinforces the printed-document metaphor. |
| Accent | **`#E84E1B`** | **Vermillion Siren** | Heat itself, alerts, priority, the single "do this" signal | A saturated industrial orange-red — the exact register of road-work signage, ISRO mission patches, and the Indian railway danger flag. It is the color of *heat as hazard*. Used **only** for: temperature values above the ward threshold, the #1 priority ward, simulator outputs that improve a score, and one interaction signature (see §5). Never decorative. |

- **One conditional fourth, used sparingly:** **`#5C5C5C` Graphite** — for de-emphasized rules, axis ticks, secondary labels. Not a brand color; a typographic gray. Treated as ink-at-40%.
- **The choropleth itself** uses a **single-hue Vermillion ramp on Bone** — from `#EDE6D3` (cool/safe) through warm beiges to full `#E84E1B` (extreme). No blue-to-red rainbow. The map *is* the brand color expressing itself across the city.
- **Forbidden in this product:** any blue, any green (yes, even for "good"), any purple, any gradient with more than one hue, any semantic-color system (no green-yellow-red traffic light). Good news in this product is *less vermillion*. That's the whole color logic.

---

## 3. Layout Motif (Repeated Throughout)

### **"The Ruled Ledger"**

- Every screen is built on a **visible ruled-line grid** — thin (0.5px) Press Black horizontal rules at fixed intervals (every 32px), like an accountant's ledger or a meteorological log sheet. Lines are *always visible*, not hover-revealed.
- Each content block sits *on* the rules, not inside a card. **No rounded-corner card containers anywhere.** Boundaries are drawn by rule lines, by full-bleed color blocks, or by typography alone.
- **Marginalia column:** every primary screen reserves a **left margin (88px)** that is *not* used for content — only for **stamp-style metadata**: timestamps in Newsreader italic, sheet numbers ("SHEET 03 / 12"), revision marks ("REV. A — 21.05.26"), and the running ward identifier in vertical mono type. This empty-but-annotated margin is the signature; it is what makes every screen instantly recognizable as *this product* and not any other dashboard.
- **One intentional asymmetric break per screen:** the Causal Breakdown on the ward detail page is rendered as an **oversized horizontal stacked bar that bleeds past the right grid edge into the page margin**, with factor labels set in Fraunces vertically against the bar. The grid is broken on purpose — the way a magazine pulls a chart into the gutter. Once per screen, never twice.

---

## 4. Background Atmosphere

- **Paper grain:** a subtle, **non-tiling** procedural grain over the Bone background — ~3% opacity, monochrome noise that mimics offset-printed paper fiber. Static. Not animated. Not blurred. It is just there, the way paper is just there.
- **Registration marks** in the four corners of the viewport — small crosshair `+` marks in Graphite, 8px, exactly where a printer would place them. Quiet, but unmistakable to anyone who has ever opened a press proof.
- **Header strip:** every page is topped by a **full-bleed Press Black bar** ~56px tall containing the product mark in Bone — `URBAN HEAT ISLAND INTELLIGENCE — BENGALURU MUNICIPAL CORPORATION / SHEET ##` set in mono caps, with a live timestamp ticking on the right.
- **No navbar background blur. No drop shadows anywhere in the product.** Depth is conveyed by rule weight (0.5px → 1px → 2px), not by elevation.

---

## 5. Signature Interaction — **"The Mercury Tick"**

A single interaction motif, executed twice (minimum), tied directly to the product's subject: *heat as a measured quantity that moves*.

- **The motion:** any temperature numeral, when its value changes (forecast updates, simulator slider drag, ward switch), animates by **counting up or down digit-by-digit in monospace**, with each digit flipping vertically like a **split-flap airport board** — but rendered typographically (no chrome, no skeuomorphic flap). The decimal point stays fixed; the digits roll past it. Duration is calibrated to the magnitude of the change (a 0.2°C change takes 180ms; a 4°C change takes 900ms), so the motion *feels the size of the difference*.
- **Where it appears (required):**
  1. **City Overview** — the headline KPI "HOTTEST WARD: 43.2°C" reticks every time the user changes the date selector or switches lens.
  2. **Intervention Simulator** — the projected ΔT, cost, and ROI all tick in unison as the planner drags a slider; the 3-year projection curve simultaneously *re-draws from left to right at 1.2s* like a chart recorder pen, not a fade-in.
- **Why this and not a card hover:** the entire product is about *watching a number that should be lower*. The interaction makes the user **feel the measurement change**, not just see a new value appear. It is also visually impossible to confuse with any other SaaS product on the market.

### Secondary motion rules (Framer Motion)

- **Page transitions:** the ruled-line grid *draws itself in from left to right* in 400ms before content lands on it — like a sheet being scored before being printed on. Used once per route change.
- **Map ward selection:** clicking a ward causes the ward polygon to **stamp** — it briefly inflates to 102% scale with a 1px Vermillion outline, then snaps back. 220ms, easeOut. No glow, no pulse, no ripple.
- **Priority Queue reordering:** when rankings change, rows physically **swap positions with a y-axis spring** (Framer `layout` prop), and the rank number itself mercury-ticks. The list reorder is the third Mercury Tick echo.
- **Loading state (replacing skeleton shimmer):** the literal text **`AWAITING TELEMETRY — WARD ##`** appears in mono, with a single character at the end (`█`) blinking at 1Hz like a teletype cursor. No shimmer. No spinner. If a forecast is computing, the chart axis draws first and the line plots itself left-to-right at the speed the data arrives.
- **Hover states:** text links underline with a **1px Press Black rule that draws from left to right in 120ms**, then on unhover *retracts to the right*, not the left — a tiny asymmetry that reads as deliberate.

---

## 6. Quality-of-Life UX Decisions (Specific, Not Generic)

- **`G` then `W` jumps to a ward by number** (vim-style leader); `?` opens a keyboard cheat sheet rendered as a printed key card. Planners look at this product all day; give them muscle memory.
- **Every numeric value is right-click-copyable as `"41.3°C (Whitefield, 21.05.26 14:30 IST)"`** — copy-with-provenance. Civic users paste into reports constantly.
- **The Heat Action Brief export preview is the same layout as the screen**, because the screen was designed as a printable sheet from the start. There is no "export mode" — the product *is* the document.
- **Undo on the simulator** is a real, scrubbable history (left arrow / right arrow steps through prior slider states), not a single ctrl+Z. Planners explore intervention combinations iteratively.
- **A persistent footer line** shows: data vintage, model version, last refresh, and a single word — **`MOCK`** in Vermillion — while we are on seed data. Honesty as a UX feature.
- **No modals.** Anything that would be a modal becomes a **sheet that slides in from the right edge as a new ruled page**, with its own SHEET ##. Closing it is `Esc` or clicking the margin.
- **Citizen view uses the same type system but at 1.4× scale and with Newsreader italic for the risk band** — the same instrument, spoken in human voice. Same product, different register.

---

## 7. What This Explicitly Refuses

- No Inter, no Roboto, no system font fallback chain ending in `sans-serif`. If Fraunces or JetBrains Mono fail to load, the page shows a Newsreader italic line: *"awaiting type — refresh"*. Type is load-bearing; we will not silently degrade.
- No card grid. No 3-column anything. The grid is a ledger, read top-to-bottom.
- No dark mode. This is a document; documents have a paper color.
- No emoji, no icon-only buttons without labels, no "✨ AI" anything. The intelligence is in the output, not the chrome.
- No charts with default Recharts styling. Axes are Press Black rules; tick labels are mono 11px Graphite; the only filled color on any chart is Vermillion, used once per chart maximum.
- No illustrated empty states with little characters. Empty states are a single Fraunces line: *"No interventions logged for this ward."* Centered on the margin column, not the content column. Off-balance on purpose.

---

## 8. One-Line Summary for the Code Agent

> Build it like a 1970s ISRO field report that learned to compute — Fraunces stamps, JetBrains Mono telemetry, Newsreader italic margins, on Gazetteer Bone paper, ruled in Press Black, with a single Vermillion Siren reserved for heat and consequence. Numbers tick like a split-flap board. Nothing is rounded. The margin is sacred.
