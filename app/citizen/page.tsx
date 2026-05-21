"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header";
import {
  PageLayout,
  SectionStamp,
  SubsectionHeader,
  Annotation,
} from "@/components/page-layout";
import { MercuryTick } from "@/components/mercury-tick";
import {
  wards,
  getWardMetrics,
  getWardForecast,
  getRiskBand,
  type Ward,
} from "@/lib/data";
import { useAppStore } from "@/lib/store";

// Dynamic import for map (client-only)
const ChoroplethMap = dynamic(
  () => import("@/components/choropleth-map").then((mod) => mod.ChoroplethMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-bone border border-ink flex items-center justify-center">
        <p className="font-mono text-[13px] text-graphite">
          AWAITING TELEMETRY<span className="animate-pulse">█</span>
        </p>
      </div>
    ),
  },
);

// Address/Ward lookup component
function WardLookup({ onSelect }: { onSelect: (wardId: string) => void }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredWards = useMemo(() => {
    if (!query.trim()) return wards;
    const q = query.toLowerCase();
    return wards.filter(
      (w) => w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = (ward: Ward) => {
    setQuery(ward.name);
    setIsOpen(false);
    onSelect(ward.id);
  };

  return (
    <div className="relative">
      <label
        htmlFor="ward-lookup"
        className="font-mono text-[10px] uppercase text-graphite block mb-2"
      >
        ENTER YOUR WARD OR AREA NAME
      </label>
      <input
        id="ward-lookup"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="e.g., Koramangala, Whitefield, JP Nagar..."
        className="w-full px-4 py-3 font-mono text-[14px] bg-bone border-2 border-ink focus:outline-none focus:border-vermillion transition-colors"
        aria-label="Search for your ward"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="ward-suggestions"
        role="combobox"
      />

      <AnimatePresence>
        {isOpen && filteredWards.length > 0 && (
          <motion.ul
            id="ward-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-bone border border-ink border-t-0 max-h-64 overflow-y-auto z-10"
            role="listbox"
          >
            {filteredWards.map((ward) => {
              const metrics = getWardMetrics(ward.id);
              return (
                <li key={ward.id}>
                  <button
                    onClick={() => handleSelect(ward)}
                    className="w-full px-4 py-3 text-left hover:bg-ink/5 transition-colors flex items-center justify-between"
                    role="option"
                    aria-label={`Select ${ward.name}`}
                  >
                    <span className="font-mono text-[13px]">{ward.name}</span>
                    {metrics && (
                      <span
                        className={`font-mono text-[11px] ${metrics.hvs >= 70 ? "text-vermillion" : "text-graphite"}`}
                      >
                        HVS {metrics.hvs}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// Risk information card for selected ward
function RiskCard({ wardId }: { wardId: string }) {
  const ward = wards.find((w) => w.id === wardId);
  const metrics = getWardMetrics(wardId);
  const forecast = getWardForecast(wardId);
  // Use store so newly-logged interventions appear here too
  const storeInterventions = useAppStore((s) => s.interventions);
  const interventions = storeInterventions.filter((i) => i.ward_id === wardId);

  if (!ward || !metrics || !forecast) return null;

  const riskBand = getRiskBand(metrics.hvs);

  // Find peak temperature in next 24 hours
  const next24h = forecast.forecast.slice(0, 24);
  const peak = next24h.reduce(
    (max, entry) =>
      entry.predicted_temp_c > max.predicted_temp_c ? entry : max,
    next24h[0],
  );
  const peakTime = new Date(peak.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  // Tomorrow's peak
  const tomorrow = forecast.forecast.slice(24, 48);
  const tomorrowPeak = tomorrow.reduce(
    (max, entry) =>
      entry.predicted_temp_c > max.predicted_temp_c ? entry : max,
    tomorrow[0],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-ink p-6"
    >
      {/* Ward name and HVS */}
      <header className="flex items-start justify-between mb-6 pb-4 border-b border-ink/20">
        <div>
          <h3 className="font-serif font-black text-3xl uppercase">
            {ward.name}
          </h3>
          <p className="font-mono text-[11px] text-graphite mt-1">
            {ward.population.toLocaleString("en-IN")} residents
          </p>
        </div>
        <div className="text-right">
          <p
            className={`font-serif font-black text-5xl ${metrics.hvs >= 70 ? "text-vermillion" : "text-ink"}`}
          >
            <MercuryTick value={metrics.hvs} decimals={0} />
          </p>
          <p className="font-mono text-[10px] uppercase text-graphite">HVS</p>
        </div>
      </header>

      {/* Risk band - prominent */}
      <div
        className={`p-4 mb-6 border-l-4 ${metrics.hvs >= 85 ? "border-vermillion bg-vermillion/5" : metrics.hvs >= 70 ? "border-vermillion bg-vermillion/5" : "border-ink/30 bg-ink/5"}`}
      >
        <p
          className={`font-mono text-[12px] uppercase font-medium mb-2 ${riskBand.class}`}
        >
          {riskBand.level} RISK
        </p>
        <p className="font-accent italic text-[14px] leading-relaxed text-ink">
          {riskBand.message}
        </p>
      </div>

      {/* Temperature info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase text-graphite mb-1">
            TODAY&apos;S PEAK
          </p>
          <p className="font-mono text-3xl text-vermillion">
            <MercuryTick
              value={peak.predicted_temp_c}
              decimals={1}
              suffix="°C"
            />
          </p>
          <p className="font-mono text-[11px] text-graphite">at {peakTime}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase text-graphite mb-1">
            TOMORROW&apos;S PEAK
          </p>
          <p className="font-mono text-3xl">
            <MercuryTick
              value={tomorrowPeak.predicted_temp_c}
              decimals={1}
              suffix="°C"
            />
          </p>
          <p className="font-mono text-[11px] text-graphite">
            {new Date(tomorrowPeak.timestamp).toLocaleDateString("en-IN", {
              weekday: "short",
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>
      </div>

      {/* Current conditions */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-ink/20">
        <div>
          <p className="font-mono text-[9px] uppercase text-graphite">
            GREEN COVER
          </p>
          <p className="font-mono text-lg">{Math.round(metrics.ndvi * 100)}%</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase text-graphite">
            CONCRETE
          </p>
          <p className="font-mono text-lg">{metrics.impervious_pct}%</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase text-graphite">
            INFORMAL
          </p>
          <p className="font-mono text-lg">{ward.informal_settlement_pct}%</p>
        </div>
      </div>

      {/* Interventions in progress */}
      {interventions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ink/20">
          <p className="font-mono text-[10px] uppercase text-graphite mb-3">
            INTERVENTIONS IN YOUR WARD
          </p>
          {interventions.map((int) => (
            <div
              key={int.id}
              className="flex items-center justify-between py-2"
            >
              <span className="font-accent italic text-[12px]">
                {int.type_id === "trees"
                  ? `${int.quantity} trees planted`
                  : int.type_id === "cool_roof"
                    ? `${int.quantity}% cool roof coverage`
                    : `${int.quantity}% permeable surfaces`}
              </span>
              <span
                className={`px-2 py-0.5 font-mono text-[9px] uppercase border ${
                  int.status === "executed"
                    ? "border-ink bg-ink text-bone"
                    : int.status === "approved"
                      ? "border-vermillion text-vermillion"
                      : "border-graphite text-graphite"
                }`}
              >
                {int.status}
              </span>
            </div>
          ))}
        </div>
      )}
      {interventions.length === 0 && (
        <div className="mt-4 pt-4 border-t border-ink/20">
          <p className="font-mono text-[10px] uppercase text-graphite mb-1">
            INTERVENTIONS IN YOUR WARD
          </p>
          <p className="font-serif font-black italic text-[16px] text-ink/30 mt-2">
            No interventions logged for this ward.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function CitizenPage() {
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const { setSelectedWard } = useAppStore();

  const handleWardSelect = (wardId: string) => {
    setSelectedWardId(wardId);
    setSelectedWard(wardId);
  };

  return (
    <>
      <Header />
      <PageLayout
        marginAnnotation="CITIZEN HEAT RISK LOOKUP"
        sheetNumber="03"
        revision="A"
      >
        <div className="p-6 pb-16">
          {/* Page header */}
          <header className="mb-8">
            <SectionStamp>HEAT RISK LOOKUP</SectionStamp>
            <Annotation className="mt-2 max-w-2xl">
              Check the heat risk for your ward. Enter your area name below to
              see current conditions, tomorrow&apos;s forecast, and what the
              city is doing to cool your neighbourhood.
            </Annotation>
          </header>

          {/* Main content */}
          <div className="flex gap-8 min-h-[calc(100vh-320px)]">
            {/* Left: Lookup + Results */}
            <div className="w-[45%] space-y-6">
              <WardLookup onSelect={handleWardSelect} />

              <AnimatePresence mode="wait">
                {selectedWardId ? (
                  <RiskCard key={selectedWardId} wardId={selectedWardId} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 pl-0 pr-8"
                  >
                    <p className="font-serif font-black italic text-2xl text-ink/30 leading-tight">
                      Select a ward to view
                      <br />
                      heat risk
                    </p>
                    <p className="font-accent italic text-[12px] text-graphite mt-3">
                      Enter an area name above or click the map.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Safety tips */}
              <div className="mt-8 pt-6 border-t border-ink/20">
                <SubsectionHeader className="mb-4">
                  HEAT SAFETY TIPS
                </SubsectionHeader>
                <ul className="space-y-3">
                  {[
                    "Drink water every 30 minutes when outdoors, even if not thirsty",
                    "Avoid outdoor work between 12:00–16:00 during extreme heat",
                    "Check on elderly neighbours and those without AC",
                    "Wear loose, light-coloured clothing and a hat",
                    "Know the nearest cooling centre or shaded public space",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[11px] text-vermillion mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-accent italic text-[13px] text-ink">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Map */}
            <div className="w-[55%]">
              <ChoroplethMap
                onWardClick={handleWardSelect}
                className="h-full min-h-[500px]"
              />
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
