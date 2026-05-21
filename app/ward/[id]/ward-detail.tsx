"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import {
  PageLayout,
  SectionStamp,
  SubsectionHeader,
  Annotation,
} from "@/components/page-layout";
import { CausalBreakdown } from "@/components/causal-breakdown";
import { ForecastChart } from "@/components/forecast-chart";
import { VulnerabilityRadar } from "@/components/vulnerability-radar";
import { InterventionSimulator } from "@/components/intervention-simulator";
import { MercuryTick } from "@/components/mercury-tick";
import {
  getWardById,
  getWardMetrics,
  getWardForecast,
  getWardVulnerability,
  getWardInterventions,
  getRiskBand,
} from "@/lib/data";

interface WardPageProps {
  params: Promise<{ id: string }>;
}

export default function WardPage({ params }: WardPageProps) {
  const { id } = use(params);
  const [interventionDelta, setInterventionDelta] = useState(0);

  const ward = getWardById(id);
  const metrics = getWardMetrics(id);
  const forecast = getWardForecast(id);
  const vulnerability = getWardVulnerability(id);
  const interventions = getWardInterventions(id);

  const handleDeltaChange = useCallback((delta: number) => {
    setInterventionDelta(delta);
  }, []);

  if (!ward || !metrics || !forecast || !vulnerability) {
    return (
      <>
        <Header />
        <PageLayout sheetNumber="02">
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <p className="font-serif font-black text-2xl text-ink">
              No data available for this ward.
            </p>
          </div>
        </PageLayout>
      </>
    );
  }

  const riskBand = getRiskBand(metrics.hvs);

  return (
    <>
      <Header />
      <PageLayout
        marginAnnotation={`WARD DETAIL — ${ward.name.toUpperCase()}`}
        sheetNumber="02"
        revision="A"
      >
        <div className="p-6 pb-16">
          {/* Back navigation */}
          <nav className="mb-4">
            <Link
              href="/planner"
              className="font-mono text-[11px] uppercase text-graphite hover:text-ink transition-colors inline-flex items-center gap-2"
              aria-label="Back to city overview"
            >
              ← BACK TO CITY OVERVIEW
            </Link>
          </nav>

          {/* Ward header */}
          <header className="mb-8 border-b border-ink/20 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <SectionStamp>{ward.name}</SectionStamp>
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-mono text-[11px] text-graphite">
                    POP. {ward.population.toLocaleString("en-IN")}
                  </span>
                  <span className="text-ink/30">|</span>
                  <span className="font-mono text-[11px] text-graphite">
                    {ward.area_km2} km²
                  </span>
                  <span className="text-ink/30">|</span>
                  <span className="font-mono text-[11px] text-graphite">
                    {ward.informal_settlement_pct}% INFORMAL
                  </span>
                </div>
              </div>

              {/* HVS score - large display */}
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase text-graphite mb-1">
                  HEAT VULNERABILITY SCORE
                </p>
                <p
                  className={`font-serif font-black text-6xl ${metrics.hvs >= 70 ? "text-vermillion" : "text-ink"}`}
                >
                  <MercuryTick value={metrics.hvs} decimals={0} />
                </p>
                <p
                  className={`font-mono text-[11px] uppercase mt-1 ${riskBand.class}`}
                >
                  {riskBand.level} RISK
                </p>
              </div>
            </div>
          </header>

          {/* Main content grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left column: Causal + Forecast */}
            <div className="col-span-7 space-y-8">
              {/* Causal Breakdown */}
              <section aria-labelledby="causal-heading">
                <SubsectionHeader className="mb-4">
                  <span id="causal-heading">
                    CAUSAL BREAKDOWN — WHY IS IT HOT?
                  </span>
                </SubsectionHeader>
                <CausalBreakdown metrics={metrics} />
              </section>

              {/* 48-hour Forecast */}
              <section aria-labelledby="forecast-heading">
                <SubsectionHeader className="mb-4">
                  <span id="forecast-heading">48-HOUR FORECAST</span>
                </SubsectionHeader>
                <ForecastChart
                  forecast={forecast}
                  interventionDelta={interventionDelta}
                />
              </section>
            </div>

            {/* Right column: Vulnerability + Simulator */}
            <div className="col-span-5 space-y-8">
              {/* Vulnerability Radar */}
              <section aria-labelledby="vulnerability-heading">
                <SubsectionHeader className="mb-4">
                  <span id="vulnerability-heading">VULNERABILITY FACTORS</span>
                </SubsectionHeader>
                <VulnerabilityRadar factors={vulnerability} />
              </section>

              {/* Intervention Simulator */}
              <InterventionSimulator
                wardId={id}
                onDeltaChange={handleDeltaChange}
              />
            </div>
          </div>

          {/* Quick stats row */}
          <section className="mt-8 pt-6 border-t border-ink/20">
            <div className="grid grid-cols-6 gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-graphite">
                  AVG LST
                </p>
                <p className="font-mono text-xl">
                  <MercuryTick
                    value={metrics.lst_avg_c}
                    decimals={1}
                    suffix="°C"
                  />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-graphite">
                  PEAK LST
                </p>
                <p className="font-mono text-xl text-vermillion">
                  <MercuryTick
                    value={metrics.lst_peak_c}
                    decimals={1}
                    suffix="°C"
                  />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-graphite">
                  NDVI
                </p>
                <p className="font-mono text-xl">
                  <MercuryTick value={metrics.ndvi} decimals={2} />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-graphite">
                  IMPERVIOUS
                </p>
                <p className="font-mono text-xl">
                  <MercuryTick
                    value={metrics.impervious_pct}
                    decimals={0}
                    suffix="%"
                  />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-graphite">
                  ALBEDO
                </p>
                <p className="font-mono text-xl">
                  <MercuryTick value={metrics.albedo_avg} decimals={2} />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-graphite">
                  BLDG DENSITY
                </p>
                <p className="font-mono text-xl">
                  <MercuryTick value={metrics.building_density} decimals={0} />
                  <span className="text-[11px] text-graphite">/km²</span>
                </p>
              </div>
            </div>
          </section>

          {/* Active interventions */}
          {interventions.length > 0 && (
            <section
              className="mt-8 pt-6 border-t border-ink/20"
              aria-labelledby="active-interventions-heading"
            >
              <SubsectionHeader className="mb-4">
                <span id="active-interventions-heading">
                  ACTIVE INTERVENTIONS IN THIS WARD
                </span>
              </SubsectionHeader>
              <div className="space-y-2">
                {interventions.map((intervention) => (
                  <motion.div
                    key={intervention.id}
                    className="flex items-center justify-between py-2 border-b border-ink/10"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-0.5 font-mono text-[9px] uppercase border ${
                          intervention.status === "executed"
                            ? "border-ink bg-ink text-bone"
                            : intervention.status === "approved"
                              ? "border-vermillion text-vermillion"
                              : "border-graphite text-graphite"
                        }`}
                      >
                        {intervention.status}
                      </span>
                      <span className="font-mono text-[12px]">
                        {intervention.quantity}{" "}
                        {intervention.type_id === "trees"
                          ? "TREES"
                          : intervention.type_id === "cool_roof"
                            ? "% COOL ROOF"
                            : "% PERMEABLE"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[11px] text-graphite">
                        −{intervention.predicted_delta_c.toFixed(2)}°C
                      </span>
                      <span className="font-mono text-[11px]">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(intervention.estimated_cost_inr)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Footer annotation */}
          <footer className="mt-8 pt-4 border-t border-ink/20">
            <Annotation>
              Simulator projections use a diminishing-returns model calibrated
              to Bengaluru conditions. Actual results may vary based on
              implementation quality, maintenance, and adjacent ward
              interventions. Use ←/→ arrow keys to step through simulator
              history.
            </Annotation>
          </footer>
        </div>
      </PageLayout>
    </>
  );
}
