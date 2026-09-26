import React, { useState } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Layers,
} from "lucide-react";
import { VisionData } from "../types/vision";
import {
  generateYoloAnnotations,
  generateCocoJson,
  generateCsvExport,
  downloadFile,
} from "../utils/exportFormats";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  visionData: VisionData;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  visionData,
}) => {
  const [activeFormat, setActiveFormat] = useState<
    "yolo" | "coco" | "csv" | "fulljson"
  >("yolo");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const yoloData = generateYoloAnnotations(visionData.objects);
  const cocoJson = generateCocoJson(visionData);
  const csvData = generateCsvExport(visionData.objects);
  const fullJson = JSON.stringify(visionData, null, 2);

  const getContent = () => {
    switch (activeFormat) {
      case "yolo":
        return `# YOLO Format: <class_id> <x_center> <y_center> <width> <height>\n# Classes Map:\n${yoloData.classes}\n\n# Annotations:\n${yoloData.annotations}`;
      case "coco":
        return cocoJson;
      case "csv":
        return csvData;
      case "fulljson":
        return fullJson;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const timestamp = Date.now();
    switch (activeFormat) {
      case "yolo":
        downloadFile(
          `${yoloData.classes}\n\n${yoloData.annotations}`,
          `yolo_annotations_${timestamp}.txt`,
          "text/plain"
        );
        break;
      case "coco":
        downloadFile(cocoJson, `coco_annotations_${timestamp}.json`, "application/json");
        break;
      case "csv":
        downloadFile(csvData, `detections_${timestamp}.csv`, "text/csv");
        break;
      case "fulljson":
        downloadFile(fullJson, `vision_audit_${timestamp}.json`, "application/json");
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Export Computer Vision Dataset & Annotations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-950 border-b border-slate-800">
          <button
            onClick={() => setActiveFormat("yolo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeFormat === "yolo"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>YOLO Format (.txt)</span>
          </button>

          <button
            onClick={() => setActiveFormat("coco")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeFormat === "coco"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>COCO JSON</span>
          </button>

          <button
            onClick={() => setActiveFormat("csv")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeFormat === "csv"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Dataset</span>
          </button>

          <button
            onClick={() => setActiveFormat("fulljson")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeFormat === "fulljson"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full System Audit JSON</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-cyan-200/90 max-h-[400px]">
          <pre className="whitespace-pre-wrap selection:bg-cyan-500 selection:text-slate-950">
            <code>{getContent()}</code>
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            {visionData.objects.length} entities serialized
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
