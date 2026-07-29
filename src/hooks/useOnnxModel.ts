// Loads the ResNeSt-50 model once and exposes an infer() callback.
//
// The heavy WASM session is created lazily on first mount and cached in a
// module-level singleton so navigating between pages never reloads it.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadModel,
  loadModelConfig,
  runInference,
  runInferenceOnSource,
  loadImage,
  type LoadedModel,
  type ModelConfig,
  type InferenceOutput,
  type LoadProgress,
} from '../lib/inference';

let modelPromise: Promise<LoadedModel> | null = null;

function getModel(onProgress?: LoadProgress): Promise<LoadedModel> {
  if (!modelPromise) {
    // Reset the singleton on failure so a retry actually re-attempts the load
    // instead of re-throwing a permanently-cached rejection.
    modelPromise = loadModel(onProgress).catch((e) => {
      modelPromise = null;
      throw e;
    });
  }
  return modelPromise;
}

/** Download progress for the model file. `total` is 0 until the size is known. */
export interface ModelProgress {
  loaded: number;
  total: number;
}

export interface UseOnnxModel {
  ready: boolean;
  loading: boolean;
  error: string | null;
  /** Bytes downloaded so far for the model, or null before the download starts. */
  progress: ModelProgress | null;
  config: LoadedModel['config'] | null;
  /** Re-attempts the load after a failure. */
  reload: () => void;
  /** Runs inference on an image source (data/object URL). */
  infer: (src: string) => Promise<InferenceOutput>;
  /** Runs inference on a live source (e.g. a <video> frame). */
  inferSource: (source: CanvasImageSource) => Promise<InferenceOutput>;
}

/**
 * Loads only the tiny model_config.json (not the 25 MB session). Pages that
 * just need config-derived facts — e.g. the decision threshold to classify
 * stored scans — use this instead of `useOnnxModel` so the home/history views
 * never trigger the heavy model download. Returns null until config resolves.
 */
export function useModelConfig(): ModelConfig | null {
  const [config, setConfig] = useState<ModelConfig | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadModelConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        // Config unavailable — consumers fall back to FALLBACK_DECISION_THRESHOLD.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return config;
}

export function useOnnxModel(): UseOnnxModel {
  const modelRef = useRef<LoadedModel | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ModelProgress | null>(null);
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => {
    setError(null);
    setReady(false);
    setLoading(true);
    setProgress(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getModel((loaded, total) => {
      if (!cancelled) setProgress({ loaded, total });
    })
      .then((m) => {
        if (cancelled) return;
        modelRef.current = m;
        setReady(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const infer = useCallback(async (src: string): Promise<InferenceOutput> => {
    const model = modelRef.current ?? (await getModel());
    modelRef.current = model;
    const img = await loadImage(src);
    return runInference(model, img);
  }, []);

  const inferSource = useCallback(async (source: CanvasImageSource): Promise<InferenceOutput> => {
    const model = modelRef.current ?? (await getModel());
    modelRef.current = model;
    return runInferenceOnSource(model, source);
  }, []);

  return { ready, loading, error, progress, reload, config: modelRef.current?.config ?? null, infer, inferSource };
}
