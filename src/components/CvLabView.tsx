import React, { useRef, useEffect, useState } from "react";
import {
  Sliders,
  Sparkles,
  Layers,
  Code2,
  Copy,
  Check,
  Eye,
  RefreshCw,
  BarChart,
  Split,
} from "lucide-react";
import { CvFilterType } from "../types/vision";
import { applyCvFilter, computeImageHistogram } from "../utils/cvFilters";

interface CvLabViewProps {
  imageSrc: string;
}

export const CvLabView: React.FC<CvLabViewProps> = ({ imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const histCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeFilter, setActiveFilter] = useState<CvFilterType>("sobel");
  const [thresholdVal, setThresholdVal] = useState<number>(128);
  const [blurRadius, setBlurRadius] = useState<number>(2);
  const [contrastVal, setContrastVal] = useState<number>(40);
  const [copiedCode, setCopiedCode] = useState(false);
  const [splitPosition, setSplitPosition] = useState<number>(100); // 100% means full filter

  const filtersList: { id: CvFilterType; label: string; desc: string; cvFunc: string }[] = [
    {
      id: "none",
      label: "Original RGB",
      desc: "Raw unprocessed RGB input feed",
      cvFunc: "# No transformation\nframe = cv2.imread(img_path)",
    },
    {
      id: "sobel",
      label: "Sobel Edge Detection",
      desc: "Computes spatial gradient magnitude for boundary & contour extraction",
      cvFunc: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\nsobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)\nsobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)\nedge_magnitude = cv2.magnitude(sobelx, sobely)`,
    },
    {
      id: "grayscale",
      label: "Grayscale (Luminance)",
      desc: "Weighted luminance conversion Y = 0.299R + 0.587G + 0.114B",
      cvFunc: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)`,
    },
    {
      id: "threshold",
      label: "Binarization / Threshold",
      desc: "Segmenting pixels above/below critical threshold intensity",
      cvFunc: `gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n_, binary = cv2.threshold(gray, ${thresholdVal}, 255, cv2.THRESH_BINARY)`,
    },
    {
      id: "blur",
      label: "Gaussian Blur",
      desc: "Low-pass kernel convolution to suppress sensor noise",
      cvFunc: `blurred = cv2.GaussianBlur(frame, (${blurRadius * 2 + 1}, ${blurRadius * 2 + 1}), 0)`,
    },
    {
      id: "contrast",
      label: "Contrast Stretching",
      desc: "Dynamic range histogram expansion",
      cvFunc: `alpha = ${(1 + contrastVal / 100).toFixed(2)}  # Contrast control\nadjusted = cv2.convertScaleAbs(frame, alpha=alpha, beta=0)`,
    },
    {
      id: "invert",
      label: "Color Inversion",
      desc: "Bitwise NOT photographic negative operation",
      cvFunc: `inverted = cv2.bitwise_not(frame)`,
    },
    {
      id: "rgb-red",
      label: "Red Channel Extract",
      desc: "Isolates the red electromagnetic spectrum component",
      cvFunc: `r_channel = frame.copy()\nr_channel[:, :, 0] = 0  # Blue\nr_channel[:, :, 1] = 0  # Green`,
    },
    {
      id: "rgb-green",
      label: "Green Channel Extract",
      desc: "Isolates the green spectral component (vegetation/chlorophyll)",
      cvFunc: `g_channel = frame.copy()\ng_channel[:, :, 0] = 0  # Blue\ng_channel[:, :, 2] = 0  # Red`,
    },
    {
      id: "rgb-blue",
      label: "Blue Channel Extract",
      desc: "Isolates the blue spectral component",
      cvFunc: `b_channel = frame.copy()\nb_channel[:, :, 1] = 0  # Green\nb_channel[:, :, 2] = 0  # Red`,
    },
  ];

  // Render processed canvas
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const maxWidth = 800;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const width = Math.min(maxWidth, img.naturalWidth);
      const height = width / aspectRatio;

      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Apply filter
      if (activeFilter !== "none") {
        applyCvFilter(ctx, width, height, activeFilter, {
          thresholdValue: thresholdVal,
          blurRadius,
          contrastValue: contrastVal,
        });
      }

      // Draw histogram
      drawHistogram(ctx, width, height);
    };
  }, [imageSrc, activeFilter, thresholdVal, blurRadius, contrastVal]);

  const drawHistogram = (
    srcCtx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const histCanvas = histCanvasRef.current;
    if (!histCanvas) return;
    const hCtx = histCanvas.getContext("2d");
    if (!hCtx) return;

    const hist = computeImageHistogram(srcCtx, width, height);
    if (!hist) return;

    histCanvas.width = 320;
    histCanvas.height = 120;
    hCtx.clearRect(0, 0, histCanvas.width, histCanvas.height);

    // Max frequency for normalization
    const maxFreq = Math.max(
      ...hist.red,
      ...hist.green,
      ...hist.blue,
      ...hist.lum,
      1
    );

    const barWidth = histCanvas.width / 256;

    // Draw channels
    const channels = [
      { data: hist.red, color: "rgba(239, 68, 68, 0.4)" },
      { data: hist.green, color: "rgba(34, 197, 94, 0.4)" },
      { data: hist.blue, color: "rgba(59, 130, 246, 0.4)" },
      { data: hist.lum, color: "rgba(255, 255, 255, 0.7)" },
    ];

    channels.forEach(({ data, color }) => {
      hCtx.fillStyle = color;
      hCtx.beginPath();
      hCtx.moveTo(0, histCanvas.height);
      for (let i = 0; i < 256; i++) {
        const h = (data[i] / maxFreq) * histCanvas.height;
        const x = i * barWidth;
        const y = histCanvas.height - h;
        hCtx.lineTo(x, y);
      }
      hCtx.lineTo(histCanvas.width, histCanvas.height);
      hCtx.closePath();
      hCtx.fill();
    });
  };

  const currentFilterObj =
    filtersList.find((f) => f.id === activeFilter) || filtersList[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFilterObj.cvFunc);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Info Banner */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              OpenCV Computer Vision Filter Laboratory
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital image processing pipeline executing Sobel convolution, binarization, spatial filtering, and color space transformations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            Kernel: 3x3 Conv
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            OpenCV / Canvas Engine
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Filter Controls & Parameters */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-4">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Filter Transformations
          </h3>

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {filtersList.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isActive
                      ? "bg-cyan-950/60 border-cyan-500 text-white shadow-sm"
                      : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="font-semibold font-mono flex items-center justify-between">
                    <span>{f.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {f.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Dynamic Sliders based on active filter */}
          {activeFilter === "threshold" && (
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Threshold Cutoff (T)</span>
                <span className="text-cyan-400 font-bold">{thresholdVal} / 255</span>
              </div>
              <input
                type="range"
                min="10"
                max="245"
                value={thresholdVal}
                onChange={(e) => setThresholdVal(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}

          {activeFilter === "blur" && (
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Kernel Blur Radius</span>
                <span className="text-cyan-400 font-bold">{blurRadius}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={blurRadius}
                onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}

          {activeFilter === "contrast" && (
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Contrast Multiplier</span>
                <span className="text-cyan-400 font-bold">+{contrastVal}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={contrastVal}
                onChange={(e) => setContrastVal(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}

          {/* Histogram Spectrum */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5 text-cyan-400" />
                Color & Luminance Histogram
              </span>
            </div>
            <div className="w-full h-24 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
              <canvas ref={histCanvasRef} className="w-full h-full" />
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> R
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> G
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> B
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-100" /> Lum
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Processed Image Canvas & Python Code */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 shadow-2xl flex flex-col items-center justify-center overflow-hidden min-h-[420px]">
            <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-lg" />
          </div>

          {/* OpenCV Python Implementation Snippet */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Python OpenCV (cv2) Implementation Code
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 text-xs font-mono text-cyan-300 overflow-x-auto">
              <code>{`import cv2
import numpy as np

# Load source frame
frame = cv2.imread("input.jpg")

# Transformation: ${currentFilterObj.label}
${currentFilterObj.cvFunc}

# Display results
cv2.imshow("${currentFilterObj.label}", ${
                activeFilter === "sobel"
                  ? "edge_magnitude"
                  : activeFilter === "threshold"
                  ? "binary"
                  : activeFilter === "blur"
                  ? "blurred"
                  : activeFilter === "contrast"
                  ? "adjusted"
                  : activeFilter === "grayscale"
                  ? "gray"
                  : activeFilter === "invert"
                  ? "inverted"
                  : activeFilter.startsWith("rgb-")
                  ? activeFilter.split("-")[1] + "_channel"
                  : "frame"
              })
cv2.waitKey(0)
cv2.destroyAllWindows()`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
