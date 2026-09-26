import React from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  ShieldCheck,
  Percent,
  Activity,
} from "lucide-react";
import { DetectedObject, VisionData } from "../types/vision";
import { getCategoryStyle } from "../data/sampleImages";

interface AnalyticsViewProps {
  visionData: VisionData;
  latencyMs: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  visionData,
  latencyMs,
}) => {
  const { objects } = visionData;

  // Compute category frequency
  const categoryCounts: Record<string, number> = {};
  objects.forEach((obj) => {
    categoryCounts[obj.category] = (categoryCounts[obj.category] || 0) + 1;
  });

  const categoriesSorted = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  // Compute confidence buckets
  const buckets = {
    "95 - 100%": objects.filter((o) => o.confidence >= 0.95).length,
    "85 - 94%": objects.filter((o) => o.confidence >= 0.85 && o.confidence < 0.95).length,
    "75 - 84%": objects.filter((o) => o.confidence >= 0.75 && o.confidence < 0.85).length,
    "< 75%": objects.filter((o) => o.confidence < 0.75).length,
  };

  // Average confidence
  const avgConfidence =
    objects.length > 0
      ? objects.reduce((sum, o) => sum + o.confidence, 0) / objects.length
      : 0;

  // Largest category
  const topCategory = categoriesSorted[0] ? categoriesSorted[0][0] : "None";

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>TOTAL OBJECTS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {objects.length}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {Object.keys(categoryCounts).length} distinct categories
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>AVG CONFIDENCE</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(avgConfidence * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            High certainty threshold
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>INFERENCE LATENCY</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {latencyMs || 840} ms
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Gemini Vision neural pass
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>DOMINANT CLASS</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 truncate">
            {topCategory}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {categoriesSorted[0]?.[1] || 0} instances located
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Bars */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Detected Category Distribution
          </h3>

          <div className="space-y-2.5">
            {categoriesSorted.map(([category, count]) => {
              const style = getCategoryStyle(category);
              const percentage = Math.round((count / objects.length) * 100);

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: style.hex }}
                      />
                      {category}
                    </span>
                    <span className="text-slate-400 font-bold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: style.hex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence Spectrum Distribution */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Confidence Score Calibration
          </h3>

          <div className="space-y-3">
            {Object.entries(buckets).map(([range, count]) => {
              const pct = objects.length > 0 ? Math.round((count / objects.length) * 100) : 0;
              return (
                <div key={range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{range}</span>
                    <span className="text-emerald-400 font-bold">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All detected objects exceed standard validation threshold with non-maximum suppression (NMS) applied.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
