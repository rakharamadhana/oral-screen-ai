// On-device ResNeSt-50 oral-referral inference.
//
// This module holds the verified ONNX math extracted from the original
// OralDiseaseDetector component. The model ends in global average pooling + a
// single linear layer, so for the positive class (PERLU RUJUKAN) the Grad-CAM
// weights reduce exactly to the fc weights -- no backward pass is needed.
//
// Everything runs offline in WASM. The decision threshold, input size, and
// normalisation stats come from model_config.json and must never be hardcoded.

import * as ort from 'onnxruntime-web';

export interface ModelConfig {
  classNames: [string, string];
  positiveClass: string;
  decisionThreshold: number;
  imgSize: number;
  mean: [number, number, number];
  std: [number, number, number];
  architecture: string;
  testAuc: number;
}

export interface InferenceOutput {
  /** P(PERLU RUJUKAN) in [0, 1]. */
  prob: number;
  logit: number;
  /** Real class activation map (H x W, min-max normalised) or null if unavailable. */
  heatmap: number[][] | null;
  /** Normalised centre (0..1) of the hottest CAM cell. */
  peak: { x: number; y: number };
}

export interface LoadedModel {
  session: ort.InferenceSession;
  config: ModelConfig;
  fcWeights: Float32Array | null;
}

const MODELS_BASE = 'assets/models';

/**
 * Loads the config, CAM weights, and quantized ONNX session once.
 * Configures the offline WASM path for ONNX Runtime Web.
 */
export async function loadModel(): Promise<LoadedModel> {
  ort.env.wasm.wasmPaths = '/assets/';

  const config: ModelConfig = await fetch(`${MODELS_BASE}/model_config.json`).then((r) => {
    if (!r.ok) throw new Error(`model_config.json missing (HTTP ${r.status})`);
    return r.json();
  });

  // CAM weights are optional -- without them the overlay is skipped, never faked.
  let fcWeights: Float32Array | null = null;
  try {
    const fc = await fetch(`${MODELS_BASE}/fc_weights.json`).then((r) => r.json());
    fcWeights = new Float32Array(fc.weights);
  } catch {
    fcWeights = null;
  }

  const modelUrl = `${MODELS_BASE}/oral_referral_${config.architecture}_quant.onnx`;
  const session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ['wasm'],
  });

  return { session, config, fcWeights };
}

/**
 * Builds the ImageNet-normalised planar [1, 3, S, S] tensor from RGBA canvas
 * pixels of a square image drawn at the model's input size.
 */
export function buildInputTensor(pixels: Uint8ClampedArray, size: number, config: ModelConfig) {
  const { mean, std } = config;
  const plane = size * size;
  const floatData = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    floatData[i] = (pixels[i * 4] / 255.0 - mean[0]) / std[0];
    floatData[plane + i] = (pixels[i * 4 + 1] / 255.0 - mean[1]) / std[1];
    floatData[2 * plane + i] = (pixels[i * 4 + 2] / 255.0 - mean[2]) / std[2];
  }
  return new ort.Tensor('float32', floatData, [1, 3, size, size]);
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * CAM[y][x] = ReLU( sum_c fcWeights[c] * features[c][y][x] ), then min-max
 * normalise. Reduces exactly to Grad-CAM for the positive class.
 */
export function computeCAM(featureTensor: ort.Tensor, fcWeights: Float32Array): number[][] {
  const [, channels, height, width] = featureTensor.dims as number[];
  const data = featureTensor.data as Float32Array;

  const cam: number[][] = [];
  let lo = Infinity;
  let hi = -Infinity;

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let c = 0; c < channels; c++) {
        sum += fcWeights[c] * data[c * height * width + y * width + x];
      }
      sum = Math.max(0, sum);
      row.push(sum);
      if (sum < lo) lo = sum;
      if (sum > hi) hi = sum;
    }
    cam.push(row);
  }

  const span = hi - lo;
  return span > 0
    ? cam.map((r) => r.map((v) => (v - lo) / span))
    : cam.map((r) => r.map(() => 0));
}

/** Normalised centre (x, y in [0,1]) of the hottest cell in an activation grid. */
export function findCamPeakNormalized(heatmap: number[][]): { x: number; y: number } {
  const rows = heatmap.length;
  const cols = heatmap[0].length;
  let best = -Infinity;
  let br = 0;
  let bc = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (heatmap[r][c] > best) {
        best = heatmap[r][c];
        br = r;
        bc = c;
      }
    }
  }
  return { x: (bc + 0.5) / cols, y: (br + 0.5) / rows };
}

/** Jet colormap: maps a [0,1] value to an [R,G,B] triple. */
export function getJetColor(v: number): [number, number, number] {
  const r = Math.round(Math.max(0, Math.min(255, 255 * (1.5 - 4 * Math.abs(v - 0.75)))));
  const g = Math.round(Math.max(0, Math.min(255, 255 * (1.5 - 4 * Math.abs(v - 0.5)))));
  const b = Math.round(Math.max(0, Math.min(255, 255 * (1.5 - 4 * Math.abs(v - 0.25)))));
  return [r, g, b];
}

/**
 * Runs a full forward pass on any canvas-drawable source (image OR video frame).
 * Full square resize to config.imgSize (no centre crop, matching training).
 */
export async function runInferenceOnSource(
  model: LoadedModel,
  source: CanvasImageSource,
): Promise<InferenceOutput> {
  const { session, config, fcWeights } = model;
  const S = config.imgSize;

  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, S, S);
  const pixels = ctx.getImageData(0, 0, S, S).data;

  const inputTensor = buildInputTensor(pixels, S, config);
  const results = await session.run({ input_image: inputTensor });

  const logit = results.logits.data[0] as number;
  const prob = sigmoid(logit);

  let heatmap: number[][] | null = null;
  let peak = { x: 0.5, y: 0.5 };
  if (results.features && fcWeights) {
    heatmap = computeCAM(results.features, fcWeights);
    peak = findCamPeakNormalized(heatmap);
  }

  return { prob, logit, heatmap, peak };
}

/** Runs a forward pass on a decoded image element. */
export function runInference(model: LoadedModel, img: HTMLImageElement): Promise<InferenceOutput> {
  return runInferenceOnSource(model, img);
}

/**
 * Renders a source image with an optional Grad-CAM overlay onto a target canvas.
 * Fades out low activations rather than tinting the whole image.
 */
/**
 * Draws the CAM heatmap tint (and an optional bounding box around the most
 * activated region) onto an existing 2D context of the given size. Works for
 * both still images and the live video canvas.
 */
export function drawCAMOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  heatmap: number[][],
  drawBox = true,
): void {
  const rows = heatmap.length;
  const cols = heatmap[0].length;

  const temp = document.createElement('canvas');
  temp.width = cols;
  temp.height = rows;
  const tctx = temp.getContext('2d')!;
  const tdata = tctx.createImageData(cols, rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = heatmap[r][c];
      const idx = (r * cols + c) * 4;
      const [rr, gg, bb] = getJetColor(val);
      tdata.data[idx] = rr;
      tdata.data[idx + 1] = gg;
      tdata.data[idx + 2] = bb;
      tdata.data[idx + 3] = Math.round(255 * Math.min(1, val * 1.4));
    }
  }
  tctx.putImageData(tdata, 0, 0);

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(temp, 0, 0, width, height);
  ctx.restore();

  // Bounding box around the most-activated region (cells >= 50% of peak) so the
  // area of interest is clearly localised, not just tinted.
  if (drawBox) {
    let minR = rows;
    let minC = cols;
    let maxR = -1;
    let maxC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (heatmap[r][c] >= 0.5) {
          if (r < minR) minR = r;
          if (c < minC) minC = c;
          if (r > maxR) maxR = r;
          if (c > maxC) maxC = c;
        }
      }
    }
    if (maxR >= 0) {
      const x0 = (minC / cols) * width;
      const y0 = (minR / rows) * height;
      const x1 = ((maxC + 1) / cols) * width;
      const y1 = ((maxR + 1) / rows) * height;
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, width / 110);
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 6;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
    }
  }
}

/** Draws a still image with an optional CAM overlay onto a target canvas. */
export function renderCAMToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  heatmap: number[][] | null,
  drawBox = true,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  if (heatmap) drawCAMOverlay(ctx, canvas.width, canvas.height, heatmap, drawBox);
}

/** Loads an image element from a data/object URL and resolves once decoded. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
