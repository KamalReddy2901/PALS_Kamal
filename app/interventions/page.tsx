"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header";
import {
  PageLayout,
  SectionStamp,
  SubsectionHeader,
  Annotation,
} from "@/components/page-layout";
import { MercuryTick, MercuryTickCurrency } from "@/components/mercury-tick";
import { useAppStore } from "@/lib/store";
import {
  wards,
  interventionTypes,
  computeCoolingEffect,
  formatINR,
  type Intervention,
} from "@/lib/data";

type StatusFilter = "all" | "proposed" | "approved" | "executed";

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Intervention["status"] }) {
  const styles: Record<Intervention["status"], string> = {
    proposed: "border-graphite text-graphite",
    approved: "border-vermillion text-vermillion",
    executed: "border-ink bg-ink text-bone",
  };
  return (
    <span
      className={`px-3 py-1 font-mono text-[10px] uppercase border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ─── Intervention row ──────────────────────────────────────────────────────────
function InterventionRow({
  intervention,
  index,
}: {
  intervention: Intervention;
  index: number;
}) {
  const ward = wards.find((w) => w.id === intervention.ward_id);
  const type = interventionTypes.find((t) => t.id === intervention.type_id);
  const createdDate = new Date(intervention.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    },
  );

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        layout: { type: "spring", stiffness: 500, damping: 30 },
        delay: index * 0.05,
      }}
      className="border-b border-ink/20 hover:bg-ink/[0.02] transition-colors"
    >
      <td className="py-4 pr-4">
        <span className="font-mono text-[11px] text-graphite">
          {intervention.id.toUpperCase()}
        </span>
      </td>
      <td className="py-4 pr-4">
        <span className="font-mono text-[13px] uppercase">
          {ward?.name || intervention.ward_id}
        </span>
      </td>
      <td className="py-4 pr-4">
        <span className="font-mono text-[12px]">
          {type?.name || intervention.type_id}
        </span>
        <span className="font-mono text-[11px] text-graphite ml-2">
          ({intervention.quantity} {type?.unit})
        </span>
      </td>
      <td className="py-4 pr-4 text-right">
        <span className="font-mono text-[13px] text-vermillion">
          −
          <MercuryTick
            value={intervention.predicted_delta_c}
            decimals={2}
            suffix="°C"
          />
        </span>
      </td>
      <td className="py-4 pr-4 text-right">
        <span className="font-mono text-[13px]">
          <MercuryTickCurrency value={intervention.estimated_cost_inr} />
        </span>
      </td>
      <td className="py-4 pr-4 text-right">
        <span
          className={`font-mono text-[13px] ${intervention.roi_score >= 7 ? "text-vermillion" : "text-ink"}`}
        >
          <MercuryTick value={intervention.roi_score} decimals={1} />
        </span>
      </td>
      <td className="py-4 pr-4">
        <StatusBadge status={intervention.status} />
      </td>
      <td className="py-4 pr-4">
        <span className="font-mono text-[11px] text-graphite">
          {createdDate}
        </span>
      </td>
      <td className="py-4">
        <span className="font-accent italic text-[11px] text-graphite truncate block max-w-[120px]">
          {intervention.owner}
        </span>
      </td>
    </motion.tr>
  );
}

// ─── Summary stats ─────────────────────────────────────────────────────────────
function SummaryStats({ filtered }: { filtered: Intervention[] }) {
  const totalCost = filtered.reduce((s, i) => s + i.estimated_cost_inr, 0);
  const totalCooling = filtered.reduce((s, i) => s + i.predicted_delta_c, 0);
  const avgRoi =
    filtered.length > 0
      ? filtered.reduce((s, i) => s + i.roi_score, 0) / filtered.length
      : 0;
  const byStatus = {
    proposed: filtered.filter((i) => i.status === "proposed").length,
    approved: filtered.filter((i) => i.status === "approved").length,
    executed: filtered.filter((i) => i.status === "executed").length,
  };

  return (
    <div className="grid grid-cols-6 gap-6 py-4 border-b border-ink/20 mb-6">
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">
          TOTAL
        </p>
        <p className="font-mono text-2xl">
          <MercuryTick value={filtered.length} decimals={0} />
        </p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">
          INVESTMENT
        </p>
        <p className="font-mono text-2xl">
          <MercuryTickCurrency value={totalCost} />
        </p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">
          PROJ. COOLING
        </p>
        <p className="font-mono text-2xl text-vermillion">
          −<MercuryTick value={totalCooling} decimals={2} suffix="°C" />
        </p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">
          AVG ROI
        </p>
        <p className="font-mono text-2xl">
          <MercuryTick value={avgRoi} decimals={1} />
        </p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">
          BY STATUS
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-graphite">{byStatus.proposed}P</span>
          <span className="text-vermillion">{byStatus.approved}A</span>
          <span className="text-ink">{byStatus.executed}E</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase text-graphite mb-1">
          WARDS
        </p>
        <p className="font-mono text-2xl">
          {new Set(filtered.map((i) => i.ward_id)).size}
        </p>
      </div>
    </div>
  );
}

// ─── New Intervention sheet ────────────────────────────────────────────────────
const TYPE_MAXES: Record<"trees" | "cool_roof" | "permeable", number> = {
  trees: 1000,
  cool_roof: 50,
  permeable: 30,
};

interface NewInterventionSheetProps {
  onClose: () => void;
  onSave: (intervention: Omit<Intervention, "id" | "created_at">) => void;
  sheetNum: number;
}

function NewInterventionSheet({
  onClose,
  onSave,
  sheetNum,
}: NewInterventionSheetProps) {
  const [wardId, setWardId] = useState(wards[0].id);
  const [typeId, setTypeId] = useState<"trees" | "cool_roof" | "permeable">(
    "trees",
  );
  const [quantity, setQuantity] = useState(0);
  const [owner, setOwner] = useState("");
  const [saved, setSaved] = useState(false);

  const type = interventionTypes.find((t) => t.id === typeId)!;
  const liveEffect = computeCoolingEffect(wardId, [
    { type_id: typeId, quantity },
  ]);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const handleSubmit = useCallback(() => {
    if (quantity === 0) return;
    onSave({
      ward_id: wardId,
      type_id: typeId,
      quantity,
      predicted_delta_c: liveEffect.predicted_delta_c,
      estimated_cost_inr: liveEffect.total_cost_inr,
      roi_score: liveEffect.roi_score,
      status: "proposed",
      owner: owner.trim() || "Planner",
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  }, [wardId, typeId, quantity, owner, liveEffect, onSave, onClose]);

  // Close on Escape
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-ink/20 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <motion.aside
        className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-bone border-l border-ink z-50 flex flex-col overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 40 }}
        onKeyDown={handleKey}
        role="dialog"
        aria-modal="true"
        aria-label="New intervention form"
      >
        {/* Sheet header */}
        <div className="flex-shrink-0 h-14 bg-ink text-bone flex items-center justify-between px-4 border-b border-ink">
          <span className="font-mono text-[11px] uppercase tracking-wide">
            NEW INTERVENTION / SHEET {String(sheetNum).padStart(2, "0")}
          </span>
          <button
            onClick={onClose}
            className="font-mono text-[11px] uppercase text-bone/60 hover:text-bone transition-colors"
            aria-label="Close sheet"
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Sheet margin annotation */}
        <div className="flex-shrink-0 px-4 pt-2 pb-1 border-b border-ink/20">
          <p className="font-accent italic text-[10px] text-graphite">
            REV. A — {today} &nbsp;·&nbsp; PROPOSED INTERVENTION LOG
          </p>
        </div>

        {/* Form body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Ward selector */}
          <fieldset>
            <legend className="font-mono text-[10px] uppercase text-graphite mb-2">
              WARD
            </legend>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="w-full px-3 py-2 font-mono text-[13px] bg-bone border border-ink focus:outline-none focus:border-vermillion transition-colors"
              aria-label="Select ward"
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </fieldset>

          {/* Type selector */}
          <fieldset>
            <legend className="font-mono text-[10px] uppercase text-graphite mb-2">
              INTERVENTION TYPE
            </legend>
            <div className="flex gap-2" role="radiogroup">
              {interventionTypes.map((t) => (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={typeId === t.id}
                  onClick={() => {
                    setTypeId(t.id);
                    setQuantity(0);
                  }}
                  className={`flex-1 py-2 px-2 font-mono text-[10px] uppercase border transition-colors ${
                    typeId === t.id
                      ? "bg-ink text-bone border-ink"
                      : "bg-bone text-ink border-ink/40 hover:border-ink"
                  }`}
                >
                  {t.id === "trees"
                    ? "TREES"
                    : t.id === "cool_roof"
                      ? "COOL ROOF"
                      : "PERMEABLE"}
                </button>
              ))}
            </div>
            <p className="font-accent italic text-[11px] text-graphite mt-2">
              {type.description}
            </p>
          </fieldset>

          {/* Quantity slider */}
          <fieldset>
            <legend className="font-mono text-[10px] uppercase text-graphite mb-2">
              QUANTITY —{" "}
              <span className="text-ink">
                {quantity} {type.unit}
              </span>
            </legend>
            <input
              type="range"
              min={0}
              max={TYPE_MAXES[typeId]}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full cursor-pointer"
              aria-label={`Quantity: ${quantity} ${type.unit}`}
            />
            <div className="flex justify-between font-mono text-[9px] text-graphite mt-1">
              <span>0</span>
              <span>{formatINR(quantity * type.unit_cost_inr)} est. cost</span>
              <span>{TYPE_MAXES[typeId]}</span>
            </div>
          </fieldset>

          {/* Owner */}
          <fieldset>
            <legend className="font-mono text-[10px] uppercase text-graphite mb-2">
              OWNER / RESPONSIBLE OFFICER
            </legend>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Ward Commissioner"
              className="w-full px-3 py-2 font-mono text-[13px] bg-bone border border-ink focus:outline-none focus:border-vermillion transition-colors placeholder:text-graphite/50"
              aria-label="Responsible officer name"
            />
          </fieldset>

          {/* Live projection */}
          <div
            className="border border-ink p-4 bg-ink/[0.02]"
            aria-live="polite"
          >
            <p className="font-mono text-[10px] uppercase text-graphite mb-3">
              PROJECTED EFFECT — LIVE
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-[9px] text-graphite uppercase mb-0.5">
                  ΔT
                </p>
                <p
                  className={`font-mono text-xl ${liveEffect.predicted_delta_c > 0 ? "text-vermillion" : "text-ink/30"}`}
                >
                  {liveEffect.predicted_delta_c > 0
                    ? `−${liveEffect.predicted_delta_c.toFixed(2)}°C`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-graphite uppercase mb-0.5">
                  COST
                </p>
                <p className="font-mono text-xl">
                  {liveEffect.total_cost_inr > 0
                    ? formatINR(liveEffect.total_cost_inr)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-graphite uppercase mb-0.5">
                  ROI
                </p>
                <p
                  className={`font-mono text-xl ${liveEffect.roi_score >= 7 ? "text-vermillion" : "text-ink"}`}
                >
                  {liveEffect.roi_score > 0
                    ? liveEffect.roi_score.toFixed(1)
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex-shrink-0 p-6 border-t border-ink/20">
          {saved ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[12px] text-vermillion uppercase text-center py-2"
              aria-live="polite"
            >
              ✓ INTERVENTION LOGGED
            </motion.p>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={quantity === 0}
              className="w-full py-3 font-mono text-[12px] uppercase bg-ink text-bone hover:bg-vermillion transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Log this intervention to the tracker"
            >
              LOG INTERVENTION →
            </button>
          )}
          <p className="font-mono text-[9px] text-graphite text-center mt-3 uppercase">
            Status will be set to PROPOSED · Owner: {owner.trim() || "Planner"}
          </p>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function InterventionsPage() {
  const { interventions, addIntervention, sheetNumber } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"date" | "roi" | "cost">("date");
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = useMemo(() => {
    let result = [...interventions];
    if (statusFilter !== "all")
      result = result.filter((i) => i.status === statusFilter);
    switch (sortBy) {
      case "roi":
        result.sort((a, b) => b.roi_score - a.roi_score);
        break;
      case "cost":
        result.sort((a, b) => b.estimated_cost_inr - a.estimated_cost_inr);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return result;
  }, [interventions, statusFilter, sortBy]);

  const statusFilters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "proposed", label: "PROPOSED" },
    { id: "approved", label: "APPROVED" },
    { id: "executed", label: "EXECUTED" },
  ];

  const handleSave = useCallback(
    (intervention: Omit<Intervention, "id" | "created_at">) => {
      addIntervention(intervention);
    },
    [addIntervention],
  );

  return (
    <>
      <Header />
      <PageLayout
        marginAnnotation="INTERVENTIONS TRACKER"
        sheetNumber="04"
        revision="A"
      >
        <div className="p-6 pb-16">
          {/* Page header */}
          <header className="mb-6">
            <SectionStamp>INTERVENTIONS TRACKER</SectionStamp>
            <Annotation className="mt-2 max-w-2xl">
              Log and track all proposed, approved, and executed heat mitigation
              interventions. Compare predicted vs observed effectiveness once
              interventions mature.
            </Annotation>
          </header>

          <SummaryStats filtered={filtered} />

          {/* Filters + controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-graphite">
                  STATUS:
                </span>
                <div
                  className="flex gap-1"
                  role="group"
                  aria-label="Filter by status"
                >
                  {statusFilters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      aria-pressed={statusFilter === f.id}
                      className={`px-3 py-1.5 font-mono text-[10px] uppercase border transition-colors ${
                        statusFilter === f.id
                          ? "bg-ink text-bone border-ink"
                          : "bg-bone text-ink border-ink/30 hover:border-ink"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-graphite">
                  SORT:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-1.5 font-mono text-[11px] bg-bone border border-ink/30 focus:outline-none focus:border-ink"
                  aria-label="Sort interventions by"
                >
                  <option value="date">DATE (NEWEST)</option>
                  <option value="roi">ROI SCORE</option>
                  <option value="cost">COST</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowNewForm(true)}
              className="px-4 py-2 font-mono text-[11px] uppercase bg-ink text-bone hover:bg-vermillion transition-colors"
              aria-label="Log a new intervention"
            >
              + NEW INTERVENTION
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-ink">
                  {[
                    "ID",
                    "WARD",
                    "TYPE",
                    "ΔT",
                    "COST",
                    "ROI",
                    "STATUS",
                    "DATE",
                    "OWNER",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`py-3 pr-4 font-mono text-[10px] uppercase text-graphite ${
                        ["ΔT", "COST", "ROI"].includes(h)
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((intervention, index) => (
                    <InterventionRow
                      key={intervention.id}
                      intervention={intervention}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 pl-0">
              <p className="font-serif font-black italic text-2xl text-ink/30 leading-tight">
                No interventions
                <br />
                match this filter.
              </p>
              <p className="font-accent italic text-[12px] text-graphite mt-3">
                Try selecting a different status or logging a new intervention
                above.
              </p>
            </div>
          )}

          <footer className="mt-8 pt-4 border-t border-ink/20">
            <Annotation>
              Predicted ΔT values are model estimates. Observed effectiveness
              will be tracked once interventions have matured (24–36 months for
              tree planting, 3–6 months for cool roofs and permeable surfaces).
            </Annotation>
          </footer>
        </div>
      </PageLayout>

      {/* New intervention sheet */}
      <AnimatePresence>
        {showNewForm && (
          <NewInterventionSheet
            onClose={() => setShowNewForm(false)}
            onSave={handleSave}
            sheetNum={sheetNumber + 4}
          />
        )}
      </AnimatePresence>
    </>
  );
}
