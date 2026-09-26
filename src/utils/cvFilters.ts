import { CvFilterType } from "../types/vision";

/**
 * Applies computer vision transformations directly to canvas ImageData
 */
export function applyCvFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterType: CvFilterType,
  options: {
    thresholdValue?: number;
    blurRadius?: number;
    contrastValue?: number;
  } = {}
) {
  if (filterType === "none" || width <= 0 || height <= 0) return;

  const { thresholdValue = 128, blurRadius = 2, contrastValue = 30 } = options;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  switch (filterType) {
    case "grayscale": {
      for (let i = 0; i < len; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      break;
    }

    case "threshold": {
      for (let i = 0; i < len; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = gray >= thresholdValue ? 255 : 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      break;
    }

    case "invert": {
      for (let i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    }

    case "contrast": {
      const factor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      }
      break;
    }

    case "rgb-red": {
      for (let i = 0; i < len; i += 4) {
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
      break;
    }

    case "rgb-green": {
      for (let i = 0; i < len; i += 4) {
        data[i] = 0;
        data[i + 2] = 0;
      }
      break;
    }

    case "rgb-blue": {
      for (let i = 0; i < len; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
      }
      break;
    }

    case "sobel": {
      // 3x3 Sobel Edge Detection kernel
      const grayBuffer = new Float32Array(width * height);
      for (let i = 0, p = 0; i < len; i += 4, p++) {
        grayBuffer[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      const output = new Uint8ClampedArray(len);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;

          // Sobel horizontal gradient Gx
          const gx =
            -1 * grayBuffer[idx - width - 1] +
            1 * grayBuffer[idx - width + 1] +
            -2 * grayBuffer[idx - 1] +
            2 * grayBuffer[idx + 1] +
            -1 * grayBuffer[idx + width - 1] +
            1 * grayBuffer[idx + width + 1];

          // Sobel vertical gradient Gy
          const gy =
            -1 * grayBuffer[idx - width - 1] +
            -2 * grayBuffer[idx - width] +
            -1 * grayBuffer[idx - width + 1] +
            1 * grayBuffer[idx + width - 1] +
            2 * grayBuffer[idx + width] +
            1 * grayBuffer[idx + width + 1];

          const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
          const outIdx = (y * width + x) * 4;

          output[outIdx] = mag;
          output[outIdx + 1] = mag;
          output[outIdx + 2] = mag;
          output[outIdx + 3] = 255;
        }
      }

      for (let i = 0; i < len; i++) {
        data[i] = output[i];
      }
      break;
    }

    case "blur": {
      // Simple box blur approximation
      const rad = Math.max(1, Math.min(blurRadius, 5));
      const copy = new Uint8ClampedArray(data);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0,
            g = 0,
            b = 0,
            count = 0;

          for (let dy = -rad; dy <= rad; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -rad; dx <= rad; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;

              const idx = (ny * width + nx) * 4;
              r += copy[idx];
              g += copy[idx + 1];
              b += copy[idx + 2];
              count++;
            }
          }

          const outIdx = (y * width + x) * 4;
          data[outIdx] = r / count;
          data[outIdx + 1] = g / count;
          data[outIdx + 2] = b / count;
        }
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Computes 256-bin histogram for Red, Green, Blue channels and Luminance
 */
export function computeImageHistogram(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (width <= 0 || height <= 0) return null;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const red = new Array(256).fill(0);
  const green = new Array(256).fill(0);
  const blue = new Array(256).fill(0);
  const lum = new Array(256).fill(0);

  const step = Math.max(1, Math.floor(data.length / (4 * 10000))); // sample up to 10k pixels for speed
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    red[r]++;
    green[g]++;
    blue[b]++;
    lum[l]++;
  }

  return { red, green, blue, lum };
}
