import { useEffect, useRef, useState } from 'react';
import { Loader2, Brain, Check, VideoOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { RiskIcon } from '../ui/RiskBadge';
import { classifyRisk } from '../../lib/risk';
import { drawCAMOverlay, type InferenceOutput } from '../../lib/inference';

interface LiveInferenceProps {
  inferSource: (source: CanvasImageSource) => Promise<InferenceOutput>;
  threshold: number;
  /** Called when the user freezes the current frame + its result. */
  onCapture: (photoDataUrl: string, output: InferenceOutput) => void;
}

/**
 * Live on-device detection from the device camera. Draws the video to a canvas
 * at ~60fps and runs a throttled forward pass (~every 700ms, one at a time),
 * overlaying the real Grad-CAM. "Gunakan Hasil Ini" freezes the current frame
 * and its latest result.
 */
export function LiveInference({ inferSource, threshold, onCapture }: LiveInferenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const lastRunRef = useRef(0);
  const latestRef = useRef<InferenceOutput | null>(null);
  const showCamRef = useRef(true);

  const [showCam, setShowCam] = useState(true);
  const [prob, setProb] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    showCamRef.current = showCam;
  }, [showCam]);

  useEffect(() => {
    let cancelled = false;

    const loop = () => {
      const v = videoRef.current;
      const cv = canvasRef.current;
      if (v && cv && v.readyState >= 2) {
        const ctx = cv.getContext('2d')!;
        if (cv.width !== v.videoWidth) {
          cv.width = v.videoWidth;
          cv.height = v.videoHeight;
        }
        ctx.drawImage(v, 0, 0, cv.width, cv.height);
        if (showCamRef.current && latestRef.current?.heatmap) {
          drawCAMOverlay(ctx, cv.width, cv.height, latestRef.current.heatmap, true);
        }

        const now = performance.now();
        if (now - lastRunRef.current >= 700 && !processingRef.current) {
          processingRef.current = true;
          lastRunRef.current = now;
          inferSource(v)
            .then((out) => {
              latestRef.current = out;
              setProb(out.prob);
              processingRef.current = false;
            })
            .catch(() => {
              processingRef.current = false;
            });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        setStarted(true);
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        setError('Tidak dapat mengakses kamera. Periksa izin kamera pada perangkat/browser Anda.');
      }
    }

    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [inferSource]);

  const capture = () => {
    const v = videoRef.current;
    const out = latestRef.current;
    if (!v || !out) return;
    const snap = document.createElement('canvas');
    snap.width = v.videoWidth;
    snap.height = v.videoHeight;
    snap.getContext('2d')!.drawImage(v, 0, 0);
    const url = snap.toDataURL('image/jpeg', 0.85);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(url, out);
  };

  if (error) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-lg text-center">
        <VideoOff size={32} className="mx-auto text-on-surface-variant mb-sm" />
        <p className="text-body-md text-on-surface-variant">{error}</p>
      </div>
    );
  }

  const risk = prob != null ? classifyRisk(prob, threshold) : null;

  return (
    <div className="space-y-md">
      <div className="relative rounded-xl overflow-hidden bg-inverse-surface aspect-[4/3]">
        <video ref={videoRef} playsInline muted className="absolute opacity-0 w-px h-px pointer-events-none" />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-inverse-on-surface gap-sm">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-body-md">Mengaktifkan kamera…</span>
          </div>
        )}

        {risk && (
          <div className="absolute top-sm left-sm flex items-center gap-xs bg-surface-container-lowest/90 backdrop-blur rounded-full pl-sm pr-md py-base shadow-sm">
            <RiskIcon level={risk.level} size={18} />
            <span className="text-label-md font-bold" style={{ color: risk.color }}>
              {risk.label}
            </span>
          </div>
        )}

        {started && prob == null && (
          <div className="absolute bottom-sm left-sm flex items-center gap-xs bg-surface-container-lowest/90 rounded-full px-sm py-base">
            <Loader2 size={14} className="animate-spin text-primary" />
            <span className="text-caption text-on-surface-variant">Menganalisis…</span>
          </div>
        )}
      </div>

      <div className="flex gap-sm">
        <Button variant="outline" onClick={() => setShowCam((s) => !s)} className="flex-1">
          <Brain size={18} /> {showCam ? 'Sembunyikan' : 'Tampilkan'} Peta Panas
        </Button>
        <Button onClick={capture} disabled={prob == null} className="flex-1">
          <Check size={18} /> Gunakan Hasil Ini
        </Button>
      </div>
      <p className="text-caption text-on-surface-variant">
        Arahkan kamera ke area mulut. Analisis berjalan langsung di perangkat Anda.
      </p>
    </div>
  );
}
