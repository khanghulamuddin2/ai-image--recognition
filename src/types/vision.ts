export interface BoundingBox2D {
  // [ymin, xmin, ymax, xmax] scaled 0 to 1000
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  id: string;
  label: string;
  category: string;
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  description: string;
  attributes?: string[];
}

export interface VlmInsights {
  primaryFocus: string;
  composition: string;
  dominantColors: string[];
  suggestedActions: string[];
  tags: string[];
}

export interface VisionData {
  sceneSummary: string;
  environment: string;
  totalEstimatedEntities?: number;
  objects: DetectedObject[];
  vlmInsights: VlmInsights;
  ocrText?: string[];
}

export interface VisionDetectionResponse {
  success: boolean;
  latencyMs: number;
  timestamp: string;
  data: VisionData;
  error?: string;
}

export type VisionTab = "studio" | "cvlab" | "vqa" | "docker" | "analytics";

export type CvFilterType =
  | "none"
  | "grayscale"
  | "sobel"
  | "threshold"
  | "invert"
  | "blur"
  | "contrast"
  | "rgb-red"
  | "rgb-green"
  | "rgb-blue";

export interface FilterSettings {
  minConfidence: number;
  selectedCategories: string[];
  searchQuery: string;
  showLabels: boolean;
  showConfidence: boolean;
  showBoxes: boolean;
  fillOpacity: number;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
}
