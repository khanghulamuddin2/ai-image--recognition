import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  Layers,
  Eye,
  EyeOff,
  Crosshair,
  SlidersHorizontal,
} from "lucide-react";
import { DetectedObject, FilterSettings } from "../types/vision";
import { getCategoryStyle } from "../data/sampleImages";

interface VisionCanvasProps {
  imageSrc: string;
  objects: DetectedObject[];
  filterSettings: FilterSettings;
  selectedObjectId: string | null;
  hoveredObjectId: string | null;
  onSelectObject: (obj: DetectedObject | null) => void;
  onHoverObject: (id: string | null) => void;
  isLoading: boolean;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  imageSrc,
  objects,
  filterSettings,
  selectedObjectId,
  hoveredObjectId,
  onSelectObject,
  onHoverObject,
  isLoading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 500,
  });

  // Filter objects based on confidence, category, and search query
  const filteredObjects = objects.filter((obj) => {
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
      const matchCategory = obj.category.toLowerCase().includes(q);
      const matchDesc = obj.description.toLowerCase().includes(q);
      if (!matchLabel && !matchCategory && !matchDesc) return false;
    }
    return true;
  });

  // Load Image Object
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      drawCanvas();
    };
  }, [imageSrc]);

  // Main canvas render logic
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas resolution to parent width
    const container = containerRef.current;
    const contWidth = container?.clientWidth || 800;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const contHeight = Math.max(360, Math.min(680, contWidth / aspectRatio));

    if (canvas.width !== contWidth || canvas.height !== contHeight) {
      canvas.width = contWidth;
      canvas.height = contHeight;
      setCanvasDimensions({ width: contWidth, height: contHeight });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save transform context for pan/zoom
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw main image fitted to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // If scanning is loading, draw futuristic radar sweep
    if (isLoading) {
      ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Render bounding boxes
    if (filterSettings.showBoxes && !isLoading) {
      filteredObjects.forEach((obj) => {
        const isSelected = obj.id === selectedObjectId;
        const isHovered = obj.id === hoveredObjectId;
        const [ymin, xmin, ymax, xmax] = obj.box_2d;

        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const w = ((xmax - xmin) / 1000) * canvas.width;
        const h = ((ymax - ymin) / 1000) * canvas.height;

        const catStyle = getCategoryStyle(obj.category);
        const hexColor = catStyle.hex;

        // Bounding box fill tint
        const fillAlpha = isSelected
          ? 0.35
          : isHovered
          ? 0.25
          : filterSettings.fillOpacity;
        ctx.fillStyle = `${hexColor}${Math.round(fillAlpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fillRect(x, y, w, h);

        // Bounding box stroke
        ctx.strokeStyle = hexColor;
        ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 1.8;
        ctx.strokeRect(x, y, w, h);

        // Cyber corner tick brackets
        const cornerLen = Math.min(14, w / 3, h / 3);
        ctx.lineWidth = isSelected ? 4 : 3;
        ctx.strokeStyle = "#ffffff";

        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + w - cornerLen, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + cornerLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x, y + h - cornerLen);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + cornerLen, y + h);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + w - cornerLen, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - cornerLen);
        ctx.stroke();

        // Target center reticle for selected
        if (isSelected) {
          const cx = x + w / 2;
          const cy = y + h / 2;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy);
          ctx.lineTo(cx + 8, cy);
          ctx.moveTo(cx, cy - 8);
          ctx.lineTo(cx, cy + 8);
          ctx.stroke();
        }

        // Render Label Tag Pill
        if (filterSettings.showLabels) {
          const labelText = filterSettings.showConfidence
            ? `${obj.label} ${Math.round(obj.confidence * 100)}%`
            : obj.label;

          ctx.font = "bold 11px 'JetBrains Mono', monospace";
          const textMetrics = ctx.measureText(labelText);
          const tagPaddingX = 6;
          const tagHeight = 18;
          const tagWidth = textMetrics.width + tagPaddingX * 2;

          let tagY = y - tagHeight;
          if (tagY < 0) tagY = y; // keep inside top edge

          // Label background
          ctx.fillStyle = hexColor;
          ctx.fillRect(x, tagY, tagWidth, tagHeight);

          // Label text
          ctx.fillStyle = "#020617";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, x + tagPaddingX, tagY + tagHeight / 2);
        }
      });
    }

    ctx.restore();
  }, [
    imageSrc,
    filteredObjects,
    filterSettings,
    selectedObjectId,
    hoveredObjectId,
    zoomLevel,
    panOffset,
    isLoading,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas]);

  // Hit test helper to map mouse coordinate to object
  const getObjectAtCoord = (clientX: number, clientY: number): DetectedObject | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left - panOffset.x) / zoomLevel;
    const mouseY = (clientY - rect.top - panOffset.y) / zoomLevel;

    // Check in reverse order so topmost objects take priority
    for (let i = filteredObjects.length - 1; i >= 0; i--) {
      const obj = filteredObjects[i];
      const [ymin, xmin, ymax, xmax] = obj.box_2d;
      const x = (xmin / 1000) * canvas.width;
      const y = (ymin / 1000) * canvas.height;
      const w = ((xmax - xmin) / 1000) * canvas.width;
      const h = ((ymax - ymin) / 1000) * canvas.height;

      if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
        return obj;
      }
    }
    return null;
  };

  // Mouse move handler for hover and pan
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    const obj = getObjectAtCoord(e.clientX, e.clientY);
    onHoverObject(obj ? obj.id : null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey) {
      // Middle click or shift click starts panning
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;
    const obj = getObjectAtCoord(e.clientX, e.clientY);
    onSelectObject(obj);
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(3, Math.max(0.5, +(prev + delta).toFixed(2))));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectObject(null);
  };

  // Download high-res annotated canvas
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `vision_annotated_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-slate-950/95" : ""
      }`}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Detection telemetry badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading
                ? "bg-amber-400 animate-ping"
                : filteredObjects.length > 0
                ? "bg-emerald-400"
                : "bg-slate-500"
            }`}
          />
          <span className="text-slate-300 font-semibold">
            {isLoading
              ? "ANALYZING TENSOR FEEDS..."
              : `${filteredObjects.length} ENTITIES DETECTED`}
          </span>
          {zoomLevel !== 1 && (
            <span className="text-cyan-400 border-l border-slate-700 pl-2">
              {Math.round(zoomLevel * 100)}%
            </span>
          )}
        </div>

        {/* Canvas Toolbar Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg">
          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-0.5" />
          <button
            onClick={handleDownloadSnapshot}
            className="p-1.5 rounded-md hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Download Annotated Canvas (PNG)"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative w-full flex items-center justify-center overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="max-w-full block select-none"
        />

        {/* Radar Scanner Overlay Animation while loading */}
        {isLoading && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-between">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />
            <div className="flex items-center justify-center">
              <div className="px-5 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md shadow-2xl flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
                  IDENTIFYING VISUAL ENTITIES & BOUNDING BOXES...
                </span>
              </div>
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" />
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="w-full px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span>Click any bounding box to inspect details</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">Shift + Drag to pan</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Resolution: {canvasDimensions.width} × {canvasDimensions.height}px</span>
        </div>
      </div>
    </div>
  );
};
