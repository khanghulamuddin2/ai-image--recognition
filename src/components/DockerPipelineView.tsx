import React, { useState } from "react";
import {
  Container,
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from "lucide-react";
import { downloadFile } from "../utils/exportFormats";

export const DockerPipelineView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<
    "app.py" | "Dockerfile" | "docker-compose.yml" | "requirements.txt" | "run.sh"
  >("app.py");
  const [copied, setCopied] = useState(false);

  const STREAMLIT_APP_CODE = `"""
AI Image Recognition System
Technologies: Python, YOLO (Ultralytics), OpenCV, PyTorch, Streamlit, Vision AI / VLM
"""

import streamlit as st
import cv2
import numpy as np
from PIL import Image
import os
import time
from ultralytics import YOLO
import google.genai as genai

# Page Configuration
st.set_page_config(
    page_title="AI Image Recognition System",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main { background-color: #0b1120; color: #f8fafc; }
    .stMetric { background: #1e293b; padding: 12px; border-radius: 10px; border: 1px solid #334155; }
    h1, h2, h3 { color: #38bdf8 !important; font-family: monospace; }
</style>
""", unsafe_allow_html=True)

# Title & Header
st.title("🎯 AI Image Recognition & Computer Vision Studio")
st.caption("Powered by YOLOv8, OpenCV, PyTorch & Vision Language Models (VLM)")

# Sidebar Settings
st.sidebar.header("⚙️ Model & Detection Config")
confidence_thresh = st.sidebar.slider("Confidence Threshold", 0.25, 0.95, 0.50, 0.05)
iou_thresh = st.sidebar.slider("NMS IoU Threshold", 0.20, 0.90, 0.45, 0.05)
model_type = st.sidebar.selectbox("YOLO Model Architecture", ["yolov8n.pt", "yolov8s.pt", "yolov8m.pt"])
apply_cv_filter = st.sidebar.selectbox("OpenCV Preprocessing Filter", ["None", "Sobel Edges", "Grayscale", "Gaussian Blur"])

@st.cache_resource
def load_yolo(model_name):
    return YOLO(model_name)

yolo_model = load_yolo(model_type)

# File Uploader
uploaded_file = st.sidebar.file_uploader("Upload Image (PNG/JPG/WEBP)", type=["jpg", "jpeg", "png", "webp"])

if uploaded_file is not None:
    # Read image via Pillow & NumPy
    pil_image = Image.open(uploaded_file).convert("RGB")
    cv_image = np.array(pil_image)
    cv_image_bgr = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)

    # Apply selected OpenCV filter
    if apply_cv_filter == "Sobel Edges":
        gray = cv2.cvtColor(cv_image_bgr, cv2.COLOR_BGR2GRAY)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        processed = cv2.magnitude(sobelx, sobely)
        disp_image = np.uint8(np.clip(processed, 0, 255))
    elif apply_cv_filter == "Grayscale":
        disp_image = cv2.cvtColor(cv_image_bgr, cv2.COLOR_BGR2GRAY)
    elif apply_cv_filter == "Gaussian Blur":
        disp_image = cv2.GaussianBlur(cv_image, (11, 11), 0)
    else:
        disp_image = cv_image

    # Inference Execution
    t_start = time.time()
    results = yolo_model.predict(source=cv_image, conf=confidence_thresh, iou=iou_thresh)
    inference_time = (time.time() - t_start) * 1000

    col1, col2 = st.columns([3, 2])

    with col1:
        st.subheader("🖼️ Annotated Vision Canvas")
        res_plotted = results[0].plot()
        st.image(res_plotted, caption="YOLOv8 Detection Output", use_container_width=True)

    with col2:
        st.subheader("📊 Real-Time Detection Metrics")
        boxes = results[0].boxes
        total_objects = len(boxes)

        m1, m2 = st.columns(2)
        m1.metric("Objects Detected", total_objects)
        m2.metric("Latency", f"{inference_time:.1f} ms")

        # Object Breakdown
        if total_objects > 0:
            st.write("### 📋 Cataloged Entities")
            detected_data = []
            for box in boxes:
                cls_id = int(box.cls[0].item())
                label = yolo_model.names[cls_id]
                conf = float(box.conf[0].item())
                xyxy = [round(x, 1) for x in box.xyxy[0].tolist()]
                detected_data.append({
                    "Class": label,
                    "Confidence": f"{conf*100:.1f}%",
                    "Coordinates": str(xyxy)
                })
            st.dataframe(detected_data, use_container_width=True)
        else:
            st.warning("No entities found matching the current confidence threshold.")

else:
    st.info("👈 Upload an image or select a sample from the sidebar to start recognition.")
`;

  const DOCKERFILE_CODE = `# Production Multi-Stage Dockerfile for AI Image Recognition System
FROM python:3.10-slim

# Prevent Python from writing .pyc files & buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for OpenCV and GUI headless rendering
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libgl1-mesa-glx \\
    libglib2.0-0 \\
    libgomp1 \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

# Pre-download YOLOv8 nano model weights into cache
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# Copy application source code
COPY . .

# Expose Streamlit default port
EXPOSE 8501

# Health check to ensure service readiness
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# Launch Streamlit app
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
`;

  const DOCKER_COMPOSE_CODE = `version: '3.8'

services:
  ai-vision-system:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ai_image_recognition_system
    restart: unless-stopped
    ports:
      - "8501:8501"
    environment:
      - STREAMLIT_SERVER_HEADLESS=true
      - STREAMLIT_SERVER_PORT=8501
      - STREAMLIT_SERVER_ADDRESS=0.0.0.0
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - ./data:/app/data
      - ./models:/root/.cache/ultralytics
    # Uncomment deploy block below for NVIDIA GPU acceleration (CUDA)
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]
`;

  const REQUIREMENTS_CODE = `ultralytics>=8.3.0
streamlit>=1.39.0
opencv-python-headless>=4.10.0
torch>=2.4.0
torchvision>=0.19.0
pillow>=10.4.0
numpy>=1.26.4
pandas>=2.2.2
google-genai>=2.4.0
python-dotenv>=1.0.1
`;

  const RUN_SH_CODE = `#!/bin/bash
# AI Image Recognition System - Docker Launcher
set -e

echo "🚀 Building and Launching AI Image Recognition Container..."

# Ensure data directory exists
mkdir -p data models

# Build and start via Docker Compose
docker-compose up --build -d

echo "✅ Container is running!"
echo "🌐 Open your browser at: http://localhost:8501"
echo "📊 Check logs with: docker-compose logs -f"
`;

  const getFileContent = () => {
    switch (activeFile) {
      case "app.py":
        return STREAMLIT_APP_CODE;
      case "Dockerfile":
        return DOCKERFILE_CODE;
      case "docker-compose.yml":
        return DOCKER_COMPOSE_CODE;
      case "requirements.txt":
        return REQUIREMENTS_CODE;
      case "run.sh":
        return RUN_SH_CODE;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getFileContent();
    const mime = activeFile.endsWith(".py")
      ? "text/x-python"
      : activeFile.endsWith(".yml")
      ? "text/yaml"
      : "text/plain";
    downloadFile(content, activeFile, mime);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Container className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Docker & Python System Architecture Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production-ready containerized pipeline utilizing Python, YOLO, OpenCV, PyTorch, and Streamlit for portable deployment on cloud servers or local Docker hosts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            Docker Engine 24.0+
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            Python 3.10 / YOLOv8
          </span>
        </div>
      </div>

      {/* Architecture Flow Pipeline */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          End-to-End Processing Architecture Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-cyan-400 font-bold block mb-1">01. INGEST</span>
              <p className="text-slate-300 font-sans text-xs">
                Image upload or live webcam camera stream (PNG/JPG/WEBP).
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">NumPy & Pillow</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-emerald-400 font-bold block mb-1">02. PREPROCESS</span>
              <p className="text-slate-300 font-sans text-xs">
                Resize, normalize RGB tensors, Sobel edge filtering or noise suppression.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">OpenCV (cv2)</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-amber-400 font-bold block mb-1">03. YOLO DETECT</span>
              <p className="text-slate-300 font-sans text-xs">
                Multi-head object classification, bounding box regressions & NMS filtering.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">Ultralytics / PyTorch</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-purple-400 font-bold block mb-1">04. VLM REASONING</span>
              <p className="text-slate-300 font-sans text-xs">
                Multi-modal scene understanding, OCR text extraction, and contextual attributes.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">Vision-Language Model</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-pink-400 font-bold block mb-1">05. CONTAINER UI</span>
              <p className="text-slate-300 font-sans text-xs">
                Interactive web UI, metrics dashboards, REST endpoints, and Docker isolation.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">Streamlit & Docker</span>
          </div>
        </div>
      </div>

      {/* Code Repository Browser & File Exporter */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* File Tabs Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                "app.py",
                "Dockerfile",
                "docker-compose.yml",
                "requirements.txt",
                "run.sh",
              ] as const
            ).map((filename) => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  activeFile === filename
                    ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{filename}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/70 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-cyan-200/90 leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
            <code>{getFileContent()}</code>
          </pre>
        </div>

        {/* Quick Launch Terminal Command footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200 font-bold">Quick Start:</span>
            <span className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              docker-compose up --build
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Port 8501 exposed • Ready for local & cloud servers
          </span>
        </div>
      </div>
    </div>
  );
};
