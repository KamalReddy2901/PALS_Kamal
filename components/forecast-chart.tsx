"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import type { WardForecast } from "@/lib/data";

interface ForecastChartProps {
  forecast: WardForecast;
  interventionDelta?: number; // Temperature reduction from simulator
  className?: string;
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | number[]; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const date = new Date(label || "");
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="bg-bone border-2 border-ink p-3 font-mono text-[11px]">
      <p className="text-graphite mb-1">
        {dateStr} · {timeStr}
      </p>
      {payload.map((entry, i) => {
        // Skip confidence range entries (Area dataKey returns number[])
        if (Array.isArray(entry.value)) return null;
        // Guard against null/undefined/string values from Recharts payload
        if (typeof entry.value !== "number") return null;
        return (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}°C
          </p>
        );
      })}
    </div>
  );
}

export function ForecastChart({
  forecast,
  interventionDelta = 0,
  className = "",
}: ForecastChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    return forecast.forecast.map((entry) => {
      const date = new Date(entry.timestamp);
      return {
        timestamp: entry.timestamp,
        hour: date.getHours(),
        label: date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }),
        predicted: entry.predicted_temp_c,
        withIntervention: entry.predicted_temp_c - interventionDelta,
        confidenceLow: entry.confidence_low,
        confidenceHigh: entry.confidence_high,
        confidenceRange: [entry.confidence_low, entry.confidence_high],
      };
    });
  }, [forecast, interventionDelta]);

  // Find peak temperature and time
  const peak = useMemo(() => {
    return chartData.reduce(
      (max, entry) => (entry.predicted > max.predicted ? entry : max),
      chartData[0],
    );
  }, [chartData]);

  const peakTime = new Date(peak.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  // Calculate y-axis domain
  const minTemp = Math.min(...chartData.map((d) => d.confidenceLow)) - 1;
  const maxTemp = Math.max(...chartData.map((d) => d.confidenceHigh)) + 1;

  return (
    <div className={className}>
      {/* Peak indicator */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase text-graphite">
            PREDICTED PEAK
          </p>
          <p className="font-mono text-3xl text-vermillion">
            {peak.predicted.toFixed(1)}°C
          </p>
          <p className="font-mono text-[11px] text-graphite">
            at {peakTime} IST
          </p>
        </div>

        {interventionDelta > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-right"
          >
            <p className="font-mono text-[10px] uppercase text-graphite">
              WITH INTERVENTION
            </p>
            <p className="font-mono text-3xl text-ink">
              {(peak.predicted - interventionDelta).toFixed(1)}°C
            </p>
            <p className="font-mono text-[11px] text-vermillion">
              −{interventionDelta.toFixed(1)}°C
            </p>
          </motion.div>
        )}
      </div>

      {/* Chart */}
      <motion.div
        className="h-64 -ml-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#1A1A1A"
              strokeWidth={0.5}
              strokeOpacity={0.2}
              horizontal={true}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke="#5C5C5C"
              strokeWidth={0.5}
              tick={{
                fontSize: 10,
                fill: "#5C5C5C",
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              axisLine={{ strokeWidth: 1 }}
              interval={5}
            />

            <YAxis
              domain={[Math.floor(minTemp), Math.ceil(maxTemp)]}
              stroke="#5C5C5C"
              strokeWidth={0.5}
              tick={{
                fontSize: 10,
                fill: "#5C5C5C",
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              axisLine={{ strokeWidth: 1 }}
              tickFormatter={(value) => `${value}°`}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 40°C threshold line */}
            <ReferenceLine
              y={40}
              stroke="#E84E1B"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: "40°C THRESHOLD",
                position: "right",
                fill: "#E84E1B",
                fontSize: 9,
                fontFamily: "JetBrains Mono",
              }}
            />

            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="confidenceRange"
              fill="#E84E1B"
              fillOpacity={0.1}
              stroke="none"
            />

            {/* Main prediction line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#E84E1B"
              strokeWidth={2}
              dot={false}
              name="Predicted"
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* Intervention projection line */}
            {interventionDelta > 0 && (
              <Line
                type="monotone"
                dataKey="withIntervention"
                stroke="#1A1A1A"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                name="With Intervention"
                animationDuration={1200}
                animationEasing="ease-out"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-vermillion" />
          <span className="text-graphite">PREDICTED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 bg-vermillion/10 border border-vermillion/20" />
          <span className="text-graphite">CONFIDENCE BAND</span>
        </div>
        {interventionDelta > 0 && (
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-0.5 bg-ink border-dashed"
              style={{ borderTopWidth: 2, borderStyle: "dashed" }}
            />
            <span className="text-graphite">WITH INTERVENTION</span>
          </div>
        )}
      </div>
    </div>
  );
}
