// Loads the ResNeSt-50 model once and exposes an infer() callback.
//
// The heavy WASM session is created lazily on first mount and cached in a
// module-level singleton so navigating between pages never reloads it.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadModel,
  runInference,
  runInferenceOnSource,
  loadImage,
  type LoadedModel,
  type InferenceOutput,
} from '../lib/inference';

let modelPromise: Promise<LoadedModel> | null = null;

function getModel(): Promise<LoadedModel> {
  if (!modelPromise) modelPromise = loadModel();
  return modelPromise;
}

export interface UseOnnxModel {
  ready: boolean;
  loading: boolean;
  error: string | null;
  config: LoadedModel['config'] | null;
  /** Runs inference on an image source (data/object URL). */
  infer: (src: string) => Promise<InferenceOutput>;
  /** Runs inference on a live source (e.g. a <video> frame). */
  inferSource: (source: CanvasImageSource) => Promise<InferenceOutput>;
}

export function useOnnxModel(): UseOnnxModel {
  const modelRef = useRef<LoadedModel | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getModel()
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
  }, []);

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

  return { ready, loading, error, config: modelRef.current?.config ?? null, infer, inferSource };
}
