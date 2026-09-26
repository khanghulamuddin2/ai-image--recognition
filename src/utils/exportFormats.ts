import { DetectedObject, VisionData } from "../types/vision";

/**
 * Converts detected objects into YOLO annotation text format:
 * <class_id> <x_center> <y_center> <width> <height> (all normalized 0.0 - 1.0)
 */
export function generateYoloAnnotations(objects: DetectedObject[]) {
  const uniqueLabels = Array.from(new Set(objects.map((o) => o.label)));
  const classMap = new Map(uniqueLabels.map((lbl, idx) => [lbl, idx]));

  const lines = objects.map((obj) => {
    const [ymin, xmin, ymax, xmax] = obj.box_2d;
    const x1 = xmin / 1000;
    const y1 = ymin / 1000;
    const x2 = xmax / 1000;
    const y2 = ymax / 1000;

    const width = Math.max(0, x2 - x1);
    const height = Math.max(0, y2 - y1);
    const x_center = x1 + width / 2;
    const y_center = y1 + height / 2;

    const classId = classMap.get(obj.label) ?? 0;

    return `${classId} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`;
  });

  const classesText = uniqueLabels.map((lbl, idx) => `${idx}: ${lbl}`).join("\n");

  return {
    annotations: lines.join("\n"),
    classes: classesText,
    uniqueLabels,
  };
}

/**
 * Generates COCO-compliant JSON format
 */
export function generateCocoJson(visionData: VisionData, imageWidth = 1920, imageHeight = 1080) {
  const uniqueLabels = Array.from(new Set(visionData.objects.map((o) => o.label)));
  const categories = uniqueLabels.map((name, index) => ({
    id: index + 1,
    name,
    supercategory: visionData.objects.find((o) => o.label === name)?.category || "object",
  }));

  const catMap = new Map(uniqueLabels.map((lbl, idx) => [lbl, idx + 1]));

  const annotations = visionData.objects.map((obj, index) => {
    const [ymin, xmin, ymax, xmax] = obj.box_2d;
    const x = (xmin / 1000) * imageWidth;
    const y = (ymin / 1000) * imageHeight;
    const w = ((xmax - xmin) / 1000) * imageWidth;
    const h = ((ymax - ymin) / 1000) * imageHeight;
    const area = w * h;

    return {
      id: index + 1,
      image_id: 1,
      category_id: catMap.get(obj.label) ?? 1,
      bbox: [Math.round(x), Math.round(y), Math.round(w), Math.round(h)],
      area: Math.round(area),
      score: obj.confidence,
      iscrowd: 0,
    };
  });

  return JSON.stringify(
    {
      info: {
        description: "VisionPulse Computer Vision Dataset Export",
        version: "1.0",
        year: 2026,
        contributor: "VisionPulse AI Engine",
        date_created: new Date().toISOString(),
      },
      images: [
        {
          id: 1,
          width: imageWidth,
          height: imageHeight,
          file_name: "detected_frame.jpg",
        },
      ],
      annotations,
      categories,
    },
    null,
    2
  );
}

/**
 * Generates CSV dataset export
 */
export function generateCsvExport(objects: DetectedObject[]) {
  const headers = [
    "Object ID",
    "Label",
    "Category",
    "Confidence",
    "Y_Min",
    "X_Min",
    "Y_Max",
    "X_Max",
    "Description",
  ];

  const rows = objects.map((o) => [
    `"${o.id}"`,
    `"${o.label}"`,
    `"${o.category}"`,
    o.confidence.toFixed(3),
    o.box_2d[0],
    o.box_2d[1],
    o.box_2d[2],
    o.box_2d[3],
    `"${o.description.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Helper to download text/json/csv file to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
