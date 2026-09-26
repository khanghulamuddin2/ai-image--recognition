import React, { useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Info,
  Maximize,
  X,
  Tag,
  Crosshair,
  SlidersHorizontal,
} from "lucide-react";
import { DetectedObject, FilterSettings } from "../types/vision";
import { getCategoryStyle, CATEGORY_COLORS } from "../data/sampleImages";

interface ObjectInspectorProps {
  imageSrc: string;
  objects: DetectedObject[];
  filterSettings: FilterSettings;
  onFilterChange: (settings: FilterSettings) => void;
  selectedObject: DetectedObject | null;
  hoveredObjectId: string | null;
  onSelectObject: (obj: DetectedObject | null) => void;
  onHoverObject: (id: string | null) => void;
}

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  imageSrc,
  objects,
  filterSettings,
  onFilterChange,
  selectedObject,
  hoveredObjectId,
  onSelectObject,
  onHoverObject,
}) => {
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  // Group objects by category
  const categoriesPresent = Array.from(new Set(objects.map((o) => o.category)));

  // Filtered objects
  const filteredList = objects.filter((obj) => {
    if (obj.confidence < filterSettings.minConfidence) return false;
    if (
      filterSettings.selectedCategories.length > 0 &&
      !filterSettings.selectedCategories.includes(obj.category)
    ) {
      return false;
    }
    if (filterSettings.searchQuery) {
      const q = filterSettings.searchQuery.toLowerCase();
      const matchLabel = obj.label.toLowerCase().includes(q);
      const matchCat = obj.category.toLowerCase().includes(q);
      const matchDesc = obj.description.toLowerCase().includes(q);
      if (!matchLabel && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  // Render cropped preview of the selected object
  useEffect(() => {
    if (!selectedObject || !imageSrc) return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const [ymin, xmin, ymax, xmax] = selectedObject.box_2d;
      const sx = (xmin / 1000) * img.naturalWidth;
      const sy = (ymin / 1000) * img.naturalHeight;
      const sw = Math.max(1, ((xmax - xmin) / 1000) * img.naturalWidth);
      const sh = Math.max(1, ((ymax - ymin) / 1000) * img.naturalHeight);

      canvas.width = 240;
      canvas.height = 160;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Center and fit crop in thumbnail
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };
  }, [selectedObject, imageSrc]);

  const toggleCategory = (cat: string) => {
    const current = filterSettings.selectedCategories;
    if (current.includes(cat)) {
      onFilterChange({
        ...filterSettings,
        selectedCategories: current.filter((c) => c !== cat),
      });
    } else {
      onFilterChange({
        ...filterSettings,
        selectedCategories: [...current, cat],
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Object Inspector
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {filteredList.length} of {objects.length} visible
          </span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterSettings.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filterSettings, searchQuery: e.target.value })
            }
            placeholder="Search class, category or attributes..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {filterSettings.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filterSettings, searchQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Confidence Threshold Slider */}
        <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              Min Confidence
            </span>
            <span className="text-cyan-400 font-bold">
              {Math.round(filterSettings.minConfidence * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.99"
            step="0.02"
            value={filterSettings.minConfidence}
            onChange={(e) =>
              onFilterChange({
                ...filterSettings,
                minConfidence: parseFloat(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* View toggles */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() =>
              onFilterChange({
                ...filterSettings,
                showLabels: !filterSettings.showLabels,
              })
            }
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
              filterSettings.showLabels
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-950/50 text-slate-500 border-slate-800"
            }`}
          >
            Labels
          </button>
          <button
            onClick={() =>
              onFilterChange({
                ...filterSettings,
                showConfidence: !filterSettings.showConfidence,
              })
            }
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
              filterSettings.showConfidence
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-950/50 text-slate-500 border-slate-800"
            }`}
          >
            Scores
          </button>
          <button
            onClick={() =>
              onFilterChange({
                ...filterSettings,
                showBoxes: !filterSettings.showBoxes,
              })
            }
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
              filterSettings.showBoxes
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-950/50 text-slate-500 border-slate-800"
            }`}
          >
            Boxes
          </button>
        </div>

        {/* Category Pills */}
        {categoriesPresent.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Filter by Class Category</span>
              {filterSettings.selectedCategories.length > 0 && (
                <button
                  onClick={() =>
                    onFilterChange({ ...filterSettings, selectedCategories: [] })
                  }
                  className="text-cyan-400 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {categoriesPresent.map((cat) => {
                const isSelected = filterSettings.selectedCategories.includes(cat);
                const count = objects.filter((o) => o.category === cat).length;
                const style = getCategoryStyle(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border ${
                      isSelected
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: style.hex }}
                    />
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Object Deep Dive Card */}
      {selectedObject && (
        <div className="p-4 bg-cyan-950/30 border-b border-cyan-800/40 relative animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getCategoryStyle(selectedObject.category).hex }}
              />
              <h4 className="text-sm font-bold text-white capitalize font-mono">
                {selectedObject.label}
              </h4>
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                {selectedObject.category}
              </span>
            </div>
            <button
              onClick={() => onSelectObject(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cropped Canvas & Coordinates */}
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center h-28">
              <canvas ref={cropCanvasRef} className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col justify-between text-[11px] font-mono space-y-1">
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CONFIDENCE</span>
                <span className="text-emerald-400 font-bold text-xs">
                  {(selectedObject.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">COORDINATES</span>
                <span className="text-cyan-300 text-[10px]">
                  [{selectedObject.box_2d.join(", ")}]
                </span>
              </div>

              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">BOUNDING AREA</span>
                <span className="text-slate-300 text-[10px]">
                  {Math.round(
                    ((selectedObject.box_2d[2] - selectedObject.box_2d[0]) / 10) *
                      ((selectedObject.box_2d[3] - selectedObject.box_2d[1]) / 10)
                  ) / 100}
                  % of frame
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
            {selectedObject.description}
          </p>

          {selectedObject.attributes && selectedObject.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedObject.attributes.map((attr, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-900/40 text-cyan-300 border border-cyan-700/50"
                >
                  #{attr}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredList.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500 text-xs font-mono space-y-2">
            <Info className="w-6 h-6 mx-auto text-slate-600" />
            <p>No objects match current filter criteria.</p>
            <p className="text-[11px] text-slate-600">
              Try adjusting the confidence slider or clearing search.
            </p>
          </div>
        ) : (
          filteredList.map((obj) => {
            const isSelected = obj.id === selectedObject?.id;
            const isHovered = obj.id === hoveredObjectId;
            const style = getCategoryStyle(obj.category);

            return (
              <div
                key={obj.id}
                onClick={() => onSelectObject(isSelected ? null : obj)}
                onMouseEnter={() => onHoverObject(obj.id)}
                onMouseLeave={() => onHoverObject(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950/40"
                    : isHovered
                    ? "bg-slate-800/80 border-slate-700"
                    : "bg-slate-950/50 border-slate-800/80 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: style.hex }}
                    />
                    <span className="font-semibold text-xs text-white capitalize font-mono truncate">
                      {obj.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {obj.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                    {Math.round(obj.confidence * 100)}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(obj.confidence * 100)}%`,
                      backgroundColor: style.hex,
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {obj.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
