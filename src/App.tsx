import React, { useState, useEffect, useCallback } from "react";
import {
  Scan,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  Upload,
  RefreshCw,
} from "lucide-react";
import {
  VisionTab,
  VisionData,
  DetectedObject,
  FilterSettings,
  SampleImage,
} from "./types/vision";
import { SAMPLE_IMAGES } from "./data/sampleImages";
import { Navbar } from "./components/Navbar";
import { VisionCanvas } from "./components/VisionCanvas";
import { ObjectInspector } from "./components/ObjectInspector";
import { VlmInsightsView } from "./components/VlmInsightsView";
import { CvLabView } from "./components/CvLabView";
import { VisualQaView } from "./components/VisualQaView";
import { DockerPipelineView } from "./components/DockerPipelineView";
import { AnalyticsView } from "./components/AnalyticsView";
import { ExportModal } from "./components/ExportModal";
import { CameraCaptureModal } from "./components/CameraCaptureModal";

export default function App() {
  const [currentTab, setCurrentTab] = useState<VisionTab>("studio");
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [activeSampleTitle, setActiveSampleTitle] = useState<string>(SAMPLE_IMAGES[0].title);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(780);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Vision detection results
  const [visionData, setVisionData] = useState<VisionData>({
    sceneSummary:
      "Urban intersection scene featuring multiple moving vehicles, roadway infrastructure, pedestrian crossings, and street signaling.",
    environment: "Urban Street",
    totalEstimatedEntities: 6,
    objects: [
      {
        id: "obj_car_1",
        label: "car",
        category: "Vehicle",
        confidence: 0.96,
        box_2d: [480, 220, 780, 480],
        description: "Silver modern passenger sedan traveling in central traffic lane.",
        attributes: ["silver", "moving", "sedan"],
      },
      {
        id: "obj_car_2",
        label: "suv",
        category: "Vehicle",
        confidence: 0.93,
        box_2d: [510, 520, 810, 780],
        description: "Dark compact crossover vehicle traveling in parallel lane.",
        attributes: ["dark metallic", "moving"],
      },
      {
        id: "obj_traffic_light",
        label: "traffic light",
        category: "Architecture",
        confidence: 0.91,
        box_2d: [120, 180, 320, 260],
        description: "Overhead intersection signal pole with green phase illumination.",
        attributes: ["overhead", "signal", "green"],
      },
      {
        id: "obj_car_3",
        label: "car",
        category: "Vehicle",
        confidence: 0.88,
        box_2d: [540, 70, 720, 210],
        description: "Distant passenger vehicle navigating outer turn lane.",
        attributes: ["white", "distant"],
      },
      {
        id: "obj_sign",
        label: "traffic sign",
        category: "Architecture",
        confidence: 0.87,
        box_2d: [280, 840, 410, 920],
        description: "Street regulation sign mounted on curb barrier.",
        attributes: ["metal", "reflective"],
      },
    ],
    vlmInsights: {
      primaryFocus: "Traffic flow along multi-lane urban arterial roadway",
      composition: "Eye-level perspective looking toward intersection vanishing point",
      dominantColors: ["Slate Gray", "Asphalt Black", "Metallic Silver", "Sky Blue"],
      suggestedActions: [
        "Vehicle count tracking within normal daytime parameters",
        "No lane obstructions or collisions detected",
        "Signal compliance verified",
      ],
      tags: ["traffic", "vehicles", "urban", "transportation", "roads", "daylight"],
    },
    ocrText: ["MAIN ST", "SPEED 35"],
  });

  // Filters & selection state
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    minConfidence: 0.7,
    selectedCategories: [],
    searchQuery: "",
    showLabels: true,
    showConfidence: true,
    showBoxes: true,
    fillOpacity: 0.12,
  });

  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Convert image URL or File to base64 and run detection
  const runVisionAnalysis = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedObject(null);

    try {
      const response = await fetch("/api/vision/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType: "image/jpeg",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Vision analysis request failed");
      }

      setVisionData(result.data);
      setLatencyMs(result.latencyMs);
      if (result.warning) {
        setWarningMessage(result.warning);
      } else {
        setWarningMessage(null);
      }
    } catch (err: any) {
      console.error("Detection error:", err);
      const is503 = err?.message?.includes("503") || err?.message?.includes("high demand");
      if (is503) {
        setErrorMessage("High demand spike on primary cloud model. Please click 'Re-Run Vision AI' to retry with automatic backoff.");
      } else {
        setErrorMessage(
          err.message || "Failed to analyze image. Please check network connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to load image into Base64 from URL
  const loadAndAnalyzeUrl = useCallback(
    async (url: string, title?: string) => {
      setImageSrc(url);
      if (title) setActiveSampleTitle(title);

      try {
        setIsLoading(true);
        // Fetch image as blob and convert to Base64
        const resp = await fetch(url);
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          runVisionAnalysis(base64data);
        };
        reader.readAsDataURL(blob);
      } catch (err: any) {
        console.warn("Could not pre-fetch image blob directly (CORS), analyzing fallback.");
        setIsLoading(false);
      }
    },
    [runVisionAnalysis]
  );

  // Handle uploaded custom file
  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageSrc(base64);
      setActiveSampleTitle(file.name);
      runVisionAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle live camera snapshot
  const handleCameraCapture = (base64: string) => {
    setImageSrc(base64);
    setActiveSampleTitle("Live Camera Snapshot");
    runVisionAnalysis(base64);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col radar-grid"
    >
      {/* Drag & drop overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-cyan-950/80 backdrop-blur-sm border-4 border-dashed border-cyan-400 flex flex-col items-center justify-center pointer-events-none">
          <Upload className="w-16 h-16 text-cyan-400 animate-bounce mb-4" />
          <h2 className="text-xl font-bold font-mono text-white">
            DROP IMAGE FILE TO ANALYZE
          </h2>
          <p className="text-sm font-mono text-cyan-300 mt-1">
            Supports PNG, JPEG, and WebP format
          </p>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onSelectSample={(sample) => loadAndAnalyzeUrl(sample.url, sample.title)}
        onUploadImage={handleUploadFile}
        onOpenCamera={() => setIsCameraOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onReset={() => loadAndAnalyzeUrl(SAMPLE_IMAGES[0].url, SAMPLE_IMAGES[0].title)}
        isLoading={isLoading}
        totalDetected={visionData.objects.length}
      />

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Warning / stabilization banner */}
      {warningMessage && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{warningMessage}</span>
          </div>
          <button
            onClick={() => setWarningMessage(null)}
            className="text-amber-400 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: DETECTION STUDIO */}
        {currentTab === "studio" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Upper Workspace: Interactive Canvas + Object Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Canvas Main Viewport (7 or 8 columns on large screens) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                <VisionCanvas
                  imageSrc={imageSrc}
                  objects={visionData.objects}
                  filterSettings={filterSettings}
                  selectedObjectId={selectedObject?.id || null}
                  hoveredObjectId={hoveredObjectId}
                  onSelectObject={setSelectedObject}
                  onHoverObject={setHoveredObjectId}
                  isLoading={isLoading}
                />

                {/* Quick Re-run / Detection Trigger Banner */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Target Scenario:</span>
                    <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {activeSampleTitle}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400">
                      {visionData.objects.length} Objects Mapped
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runVisionAnalysis(imageSrc)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                      />
                      <span>Re-Run Vision AI</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inspector Sidebar (5 or 4 columns) */}
              <div className="lg:col-span-5 xl:col-span-4 h-[650px]">
                <ObjectInspector
                  imageSrc={imageSrc}
                  objects={visionData.objects}
                  filterSettings={filterSettings}
                  onFilterChange={setFilterSettings}
                  selectedObject={selectedObject}
                  hoveredObjectId={hoveredObjectId}
                  onSelectObject={setSelectedObject}
                  onHoverObject={setHoveredObjectId}
                />
              </div>
            </div>

            {/* Lower Section: VLM Insights & Scene Context */}
            <VlmInsightsView visionData={visionData} />
          </div>
        )}

        {/* TAB 2: OPENCV LAB */}
        {currentTab === "cvlab" && (
          <div className="animate-in fade-in duration-150">
            <CvLabView imageSrc={imageSrc} />
          </div>
        )}

        {/* TAB 3: VISUAL QA */}
        {currentTab === "vqa" && (
          <div className="animate-in fade-in duration-150">
            <VisualQaView
              imageSrc={imageSrc}
              detectedObjects={visionData.objects}
            />
          </div>
        )}

        {/* TAB 4: DOCKER & PYTHON PIPELINE */}
        {currentTab === "docker" && (
          <div className="animate-in fade-in duration-150">
            <DockerPipelineView />
          </div>
        )}

        {/* TAB 5: ANALYTICS & METRICS */}
        {currentTab === "analytics" && (
          <div className="animate-in fade-in duration-150">
            <AnalyticsView visionData={visionData} latencyMs={latencyMs} />
          </div>
        )}
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        visionData={visionData}
      />

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI Image Recognition System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>YOLO Architecture</span>
            <span>•</span>
            <span>OpenCV 4.10</span>
            <span>•</span>
            <span>Docker Containerized</span>
            <span>•</span>
            <span>Gemini Vision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
