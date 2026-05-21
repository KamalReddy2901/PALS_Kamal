"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  interventionTypes,
  computeCoolingEffect,
  formatINR,
  type InterventionType,
} from "@/lib/data";
import { MercuryTick, MercuryTickCurrency } from "./mercury-tick";
import { SubsectionHeader } from "./page-layout";

interface InterventionSliderProps {
  type: InterventionType;
  value: number;
  onChange: (value: number) => void;
  max: number;
}

function InterventionSlider({
  type,
  value,
  onChange,
  max,
}: InterventionSliderProps) {
  return (
    <div className="py-4 border-b border-ink/20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-mono text-[12px] uppercase tracking-wide">
            {type.name}
          </h4>
          <p className="font-accent italic text-[11px] text-graphite mt-0.5">
            {type.description}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl tabular-nums">
            <MercuryTick value={value} decimals={0} />
          </p>
          <p className="font-mono text-[10px] text-graphite uppercase">
            {type.unit}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 cursor-pointer"
          aria-label={`${type.name} slider: ${value} ${type.unit}`}
        />
        <span className="font-mono text-[10px] text-graphite w-16 text-right">
          {formatINR(value * type.unit_cost_inr)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 font-mono text-[9px] text-graphite">
        <span>0</span>
        <span>
          COOLING: {(type.cooling_coefficient * 100).toFixed(2)}°C/
          {type.unit.replace("%", "pt")}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}

interface InterventionSimulatorProps {
  wardId: string;
  onDeltaChange?: (delta: number) => void;
  className?: string;
}

export function InterventionSimulator({
  wardId,
  onDeltaChange,
  className = "",
}: InterventionSimulatorProps) {
  const {
    simulator,
    setSimulatorValue,
    resetSimulator,
    undoSimulator,
    redoSimulator,
    canUndo,
    canRedo,
    addIntervention,
  } = useAppStore();

  const [saved, setSaved] = useState<string | null>(null);

  // Calculate current effect
  const effect = computeCoolingEffect(wardId, [
    { type_id: "trees", quantity: simulator.trees },
    { type_id: "cool_roof", quantity: simulator.cool_roof },
    { type_id: "permeable", quantity: simulator.permeable },
  ]);

  // Notify parent of delta changes
  useEffect(() => {
    onDeltaChange?.(effect.predicted_delta_c);
  }, [effect.predicted_delta_c, onDeltaChange]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canUndo()) {
        undoSimulator();
      } else if (e.key === "ArrowRight" && canRedo()) {
        redoSimulator();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoSimulator, redoSimulator, canUndo, canRedo]);

  const handleSave = useCallback(() => {
    if (effect.predicted_delta_c === 0) return;
    addIntervention({
      ward_id: wardId,
      type_id:
        simulator.trees > 0
          ? "trees"
          : simulator.cool_roof > 0
            ? "cool_roof"
            : "permeable",
      quantity: simulator.trees || simulator.cool_roof || simulator.permeable,
      predicted_delta_c: effect.predicted_delta_c,
      estimated_cost_inr: effect.total_cost_inr,
      roi_score: effect.roi_score,
      status: "proposed",
      owner: "Planner",
    });
    const id = `INT-${String(Date.now()).slice(-4)}`;
    setSaved(id);
    setTimeout(() => setSaved(null), 3000);
  }, [effect, wardId, simulator, addIntervention]);

  const sliderConfigs = [
    {
      type: interventionTypes[0],
      value: simulator.trees,
      max: 1000,
      key: "trees" as const,
    },
    {
      type: interventionTypes[1],
      value: simulator.cool_roof,
      max: 50,
      key: "cool_roof" as const,
    },
    {
      type: interventionTypes[2],
      value: simulator.permeable,
      max: 30,
      key: "permeable" as const,
    },
  ];

  return (
    <section className={className} aria-labelledby="simulator-heading">
      <SubsectionHeader className="mb-4">
        <span id="simulator-heading">INTERVENTION SIMULATOR</span>
      </SubsectionHeader>

      {/* Sliders */}
      <div className="space-y-0">
        {sliderConfigs.map((config) => (
          <InterventionSlider
            key={config.key}
            type={config.type}
            value={config.value}
            onChange={(v) => setSimulatorValue(config.key, v)}
            max={config.max}
          />
        ))}
      </div>

      {/* Results panel */}
      <motion.div
        className="mt-6 p-4 border border-ink bg-ink/[0.02]"
        animate={{
          borderColor: effect.predicted_delta_c > 0 ? "#E84E1B" : "#1A1A1A",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="grid grid-cols-3 gap-6">
          {/* Temperature reduction */}
          <div>
            <p className="font-mono text-[10px] uppercase text-graphite mb-1">
              PROJECTED COOLING
            </p>
            <p
              className={`font-mono text-3xl ${effect.predicted_delta_c > 0 ? "text-vermillion" : "text-ink"}`}
            >
              {effect.predicted_delta_c > 0 ? "−" : "−"}
              <MercuryTick
                value={effect.predicted_delta_c}
                decimals={2}
                suffix="°C"
              />
            </p>
            <p className="font-mono text-[10px] text-graphite mt-1">
              IN 24–36 MONTHS
            </p>
          </div>

          {/* Total cost */}
          <div>
            <p className="font-mono text-[10px] uppercase text-graphite mb-1">
              TOTAL COST
            </p>
            <p className="font-mono text-2xl">
              {effect.total_cost_inr > 0 ? (
                <MercuryTickCurrency value={effect.total_cost_inr} />
              ) : (
                "₹0"
              )}
            </p>
            <p className="font-mono text-[10px] text-graphite mt-1">
              ESTIMATED
            </p>
          </div>

          {/* ROI Score */}
          <div>
            <p className="font-mono text-[10px] uppercase text-graphite mb-1">
              ROI SCORE
            </p>
            <p
              className={`font-mono text-3xl ${effect.roi_score >= 7 ? "text-vermillion" : "text-ink"}`}
            >
              {effect.total_cost_inr > 0 ? (
                <MercuryTick value={effect.roi_score} decimals={1} />
              ) : (
                "—"
              )}
            </p>
            <p className="font-mono text-[10px] text-graphite mt-1">
              COOLING/₹ INDEX
            </p>
          </div>
        </div>

        {/* Diminishing returns note */}
        {effect.predicted_delta_c > 1 && (
          <motion.p
            className="mt-4 font-accent italic text-[11px] text-graphite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Note: Combined effect ({effect.predicted_delta_c.toFixed(2)}°C)
            reflects diminishing returns from stacked interventions.
          </motion.p>
        )}
      </motion.div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={undoSimulator}
            disabled={!canUndo()}
            className="px-3 py-1.5 font-mono text-[10px] uppercase border border-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink hover:text-bone transition-colors"
            aria-label="Undo last change"
          >
            ← UNDO
          </button>
          <button
            onClick={redoSimulator}
            disabled={!canRedo()}
            className="px-3 py-1.5 font-mono text-[10px] uppercase border border-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink hover:text-bone transition-colors"
            aria-label="Redo last change"
          >
            REDO →
          </button>
          <span className="font-mono text-[9px] text-graphite ml-2">
            (or use ←/→ keys)
          </span>
        </div>

        <button
          onClick={resetSimulator}
          className="px-3 py-1.5 font-mono text-[10px] uppercase border border-ink hover:bg-ink hover:text-bone transition-colors"
          aria-label="Reset all intervention values"
        >
          RESET ALL
        </button>
      </div>

      {/* Save action */}
      <div className="mt-4 flex items-center justify-between border-t border-ink/20 pt-4">
        <button
          onClick={handleSave}
          disabled={effect.predicted_delta_c === 0}
          className="px-4 py-2 font-mono text-[11px] uppercase bg-ink text-bone hover:bg-vermillion transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Save this intervention to the tracker"
        >
          SAVE TO INTERVENTIONS TRACKER →
        </button>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <span className="font-mono text-[11px] text-vermillion uppercase">
              ✓ SAVED — {saved}
            </span>
            <Link
              href="/interventions"
              className="font-mono text-[10px] uppercase text-ink border-b border-ink hover:text-vermillion hover:border-vermillion transition-colors"
              aria-label="View all interventions in the tracker"
            >
              VIEW TRACKER →
            </Link>
          </motion.div>
        )}
      </div>

      {/* Time to effect breakdown */}
      <div className="mt-6 pt-4 border-t border-ink/20">
        <p className="font-mono text-[10px] uppercase text-graphite mb-3">
          TIME TO EFFECT
        </p>
        <div className="flex gap-4">
          {interventionTypes.map((type) => (
            <div key={type.id} className="flex-1">
              <div className="h-2 bg-ink/10 mb-1">
                <div
                  className="h-full bg-vermillion"
                  style={{
                    width: `${(type.time_to_effect_months / 24) * 100}%`,
                  }}
                />
              </div>
              <p className="font-mono text-[9px] text-graphite">
                {type.name.toUpperCase()}: {type.time_to_effect_months}mo
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
