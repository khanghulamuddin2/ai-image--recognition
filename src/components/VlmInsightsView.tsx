import React from "react";
import {
  Sparkles,
  Compass,
  Palette,
  FileText,
  AlertCircle,
  Lightbulb,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { VisionData } from "../types/vision";

interface VlmInsightsViewProps {
  visionData: VisionData;
}

export const VlmInsightsView: React.FC<VlmInsightsViewProps> = ({ visionData }) => {
  const { sceneSummary, environment, vlmInsights, ocrText } = visionData;

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Vision-Language Intelligence & Scene Context
            </h3>
            <p className="text-xs text-slate-400">
              VLM multi-modal scene understanding & spatial reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            {environment || "General Scene"}
          </span>
        </div>
      </div>

      {/* Narrative Scene Summary */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-400">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>SYNTHESIZED SCENE NARRATIVE</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {sceneSummary}
        </p>
      </div>

      {/* Grid of Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Composition & Focal Point */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>FOCAL POINT & COMPOSITION</span>
          </div>
          <p className="text-xs font-semibold text-white">
            {vlmInsights.primaryFocus}
          </p>
          <div className="inline-block px-2 py-0.5 text-[11px] font-mono rounded bg-slate-900 text-slate-300 border border-slate-700">
            Layout: {vlmInsights.composition}
          </div>
        </div>

        {/* Dominant Visual Colors */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>DOMINANT COLOR PALETTE</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {vlmInsights.dominantColors && vlmInsights.dominantColors.length > 0 ? (
              vlmInsights.dominantColors.map((color, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-slate-900 text-slate-200 border border-slate-700/80"
                >
                  {color}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">Natural daylight spectrum</span>
            )}
          </div>
        </div>

        {/* OCR Text / Legible Signage */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>DETECTED TEXT / SIGNS (OCR)</span>
          </div>
          {ocrText && ocrText.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {ocrText.map((txt, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs font-mono rounded bg-amber-950/40 text-amber-300 border border-amber-800/50"
                >
                  "{txt}"
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-mono">
              No distinct text or legible signage detected in frame.
            </span>
          )}
        </div>
      </div>

      {/* Suggested Actions & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suggested Actions */}
        {vlmInsights.suggestedActions && vlmInsights.suggestedActions.length > 0 && (
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>AUTOMATED VISION ACTION RECOMMENDATIONS</span>
            </div>
            <ul className="space-y-1.5">
              {vlmInsights.suggestedActions.map((action, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Semantic Tags */}
        {vlmInsights.tags && vlmInsights.tags.length > 0 && (
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>SEMANTIC SCENE TAGS</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {vlmInsights.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
