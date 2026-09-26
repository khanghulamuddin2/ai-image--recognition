import React from "react";
import {
  Scan,
  Sparkles,
  Sliders,
  MessageSquareCode,
  Container,
  BarChart3,
  Camera,
  Upload,
  Download,
  RotateCcw,
  Layers,
  ChevronDown,
} from "lucide-react";
import { VisionTab, SampleImage } from "../types/vision";
import { SAMPLE_IMAGES } from "../data/sampleImages";

interface NavbarProps {
  currentTab: VisionTab;
  onTabChange: (tab: VisionTab) => void;
  onSelectSample: (sample: SampleImage) => void;
  onUploadImage: (file: File) => void;
  onOpenCamera: () => void;
  onOpenExport: () => void;
  onReset: () => void;
  isLoading: boolean;
  totalDetected: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onSelectSample,
  onUploadImage,
  onOpenCamera,
  onOpenExport,
  onReset,
  isLoading,
  totalDetected,
}) => {
  const [showSamplesMenu, setShowSamplesMenu] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  VISION<span className="text-cyan-400">PULSE</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  AI v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Computer Vision & Object Recognition System
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange("studio")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "studio"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Detection Studio</span>
              {totalDetected > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                  {totalDetected}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("cvlab")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "cvlab"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>OpenCV Lab</span>
            </button>

            <button
              onClick={() => onTabChange("vqa")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "vqa"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>Visual Q&A</span>
            </button>

            <button
              onClick={() => onTabChange("docker")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "docker"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <Container className="w-3.5 h-3.5" />
              <span>Docker & Python</span>
            </button>

            <button
              onClick={() => onTabChange("analytics")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "analytics"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Samples Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSamplesMenu(!showSamplesMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Sample Images</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSamplesMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowSamplesMenu(false)}
                >
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 mb-1">
                    Select Test Scenario
                  </div>
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => onSelectSample(sample)}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 hover:text-cyan-300 transition-colors"
                    >
                      <span className="truncate">{sample.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">
                        {sample.category.split("/")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Upload custom image (PNG/JPG/WEBP)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* Live Camera Button */}
            <button
              onClick={onOpenCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Capture from Webcam"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Live Camera</span>
            </button>

            {/* Export Report */}
            <button
              onClick={onOpenExport}
              disabled={totalDetected === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 rounded-lg border border-cyan-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Export YOLO, COCO JSON, CSV or Annotated Image"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-2">
          <button
            onClick={() => onTabChange("studio")}
            className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
              currentTab === "studio" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => onTabChange("cvlab")}
            className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
              currentTab === "cvlab" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
            }`}
          >
            OpenCV Lab
          </button>
          <button
            onClick={() => onTabChange("vqa")}
            className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
              currentTab === "vqa" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
            }`}
          >
            Visual Q&A
          </button>
          <button
            onClick={() => onTabChange("docker")}
            className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
              currentTab === "docker" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
            }`}
          >
            Docker
          </button>
          <button
            onClick={() => onTabChange("analytics")}
            className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 ${
              currentTab === "analytics" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
            }`}
          >
            Metrics
          </button>
        </div>
      </div>
    </header>
  );
};
