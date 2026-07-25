import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, VideoOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraCaptureProps {
  photo: string | null;
  setPhoto: (url: string | null) => void;
}

/**
 * Opens the device camera as a viewfinder and captures a single still on the
 * shutter tap (works on desktop + mobile via getUserMedia, unlike the file
 * `capture` attribute which desktop ignores). This is a still capture — the
 * continuous-inference mode is LiveInference.
 */
export function CameraCapture({ photo, setPhoto }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run the camera while there is no captured still to review.
    if (photo) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
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
        setReady(true);
      } catch {
        setError('Tidak dapat mengakses kamera. Periksa izin kamera, atau gunakan opsi Unggah Foto.');
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [photo]);

  const shoot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.9));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  if (error) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-lg text-center">
        <VideoOff size={32} className="mx-auto text-on-surface-variant mb-sm" />
        <p className="text-body-md text-on-surface-variant">{error}</p>
      </div>
    );
  }

  if (photo) {
    return (
      <div className="space-y-md">
        <img
          src={photo}
          alt="Foto rongga mulut"
          className="w-full max-h-80 object-contain rounded-xl border border-outline-variant bg-surface-container"
        />
        <Button variant="outline" onClick={() => setPhoto(null)} fullWidth>
          <RotateCcw size={18} /> Ambil Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div className="relative rounded-xl overflow-hidden bg-inverse-surface aspect-[4/3]">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-inverse-on-surface gap-sm">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-body-md">Mengaktifkan kamera…</span>
          </div>
        )}
      </div>
      <Button onClick={shoot} disabled={!ready} fullWidth>
        <Camera size={18} /> Ambil Foto
      </Button>
    </div>
  );
}
