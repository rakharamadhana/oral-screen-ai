import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Video,
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Stepper, StepperMobile } from '../components/ui/Stepper';
import { RiskIcon } from '../components/ui/RiskBadge';
import { LiveInference } from '../components/scan/LiveInference';
import { CameraCapture } from '../components/scan/CameraCapture';
import { useOnnxModel } from '../hooks/useOnnxModel';
import { renderCAMToCanvas, loadImage, type InferenceOutput } from '../lib/inference';
import { classifyRisk, type RiskResult } from '../lib/risk';
import { addScan, generateRefCode } from '../lib/repository';
import type { ScanRecord } from '../lib/types';
import { SEED_PROFILE } from '../lib/mockData';

const STEPS = ['Data Diri', 'Kuesioner', 'Instruksi', 'Ambil Foto', 'Konfirmasi', 'Selesai'];

const GUIDANCE = [
  'Cari ruangan dengan cahaya alami yang terang.',
  'Berdiri di depan cermin agar posisi kamera pas.',
  'Gunakan lampu flash jika di dalam ruangan minim cahaya.',
  'Pastikan fokus terkunci pada bagian mulut yang difoto.',
];

const RISK_FACTORS = [
  'Perokok aktif',
  'Konsumsi alkohol rutin',
  'Riwayat keluarga kanker mulut',
  'Luka mulut > 2 minggu',
];

type CaptureMode = 'upload' | 'camera' | 'live';

/** Downscales an image src to a small JPEG data URL for history thumbnails. */
async function makeThumbnail(src: string, size = 96): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.getContext('2d')!.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.7);
}

export function Pemeriksaan() {
  const navigate = useNavigate();
  const model = useOnnxModel();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<CaptureMode>('upload');
  const [photo, setPhoto] = useState<string | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ risk: RiskResult; photo: string; output: InferenceOutput } | null>(
    null,
  );

  const threshold = model.config?.decisionThreshold ?? 0.1973;

  // Shared finaliser: classify, persist to history, show the result screen.
  const commitResult = async (photoUrl: string, output: InferenceOutput) => {
    const risk = classifyRisk(output.prob, threshold);
    const thumbnail = await makeThumbnail(photoUrl);
    const scan: ScanRecord = {
      id: crypto.randomUUID(),
      refCode: generateRefCode(),
      createdAt: new Date().toISOString(),
      riskLevel: risk.level,
      topProbability: output.prob,
      regionResults: [{ region: 'Rongga Mulut', probability: output.prob }],
      thumbnail,
    };
    await addScan(scan);
    setResult({ risk, photo: photoUrl, output });
    setStep(5);
  };

  const runAnalysis = async () => {
    if (!photo) return;
    setRunning(true);
    try {
      const output = await model.infer(photo);
      await commitResult(photo, output);
    } catch (e) {
      console.error(e);
      alert('Gagal memproses gambar. Coba lagi.');
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setMode('upload');
    setPhoto(null);
    setFactors([]);
    setResult(null);
    setStep(0);
  };

  return (
    <div>
      {/* Mobile back + title */}
      <div className="flex items-center gap-sm mb-md md:hidden">
        <button onClick={() => (step > 0 ? setStep(step - 1) : navigate('/'))} className="text-primary">
          <ArrowLeft size={22} />
        </button>
        <h3 className="text-headline-md font-bold text-primary">Pemeriksaan Baru</h3>
      </div>

      {/* Stepper */}
      <Card className="p-md md:p-lg mb-md hidden md:block">
        <Stepper steps={STEPS} current={step} />
      </Card>
      <div className="md:hidden mb-md">
        <StepperMobile steps={STEPS} current={step} />
      </div>

      {step === 0 && <DataDiriStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <KuesionerStep
          factors={factors}
          toggle={(f) => setFactors((v) => (v.includes(f) ? v.filter((x) => x !== f) : [...v, f]))}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && <InstruksiStep onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && (
        <AmbilFotoStep
          mode={mode}
          setMode={setMode}
          photo={photo}
          setPhoto={setPhoto}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          inferSource={model.inferSource}
          threshold={threshold}
          onLiveCapture={commitResult}
        />
      )}
      {step === 4 && (
        <KonfirmasiStep
          photo={photo}
          running={running}
          modelLoading={model.loading}
          onBack={() => setStep(3)}
          onProcess={runAnalysis}
        />
      )}
      {step === 5 && result && (
        <SelesaiStep result={result} onReset={reset} onHistory={() => navigate('/riwayat')} />
      )}
    </div>
  );
}

// ---------- shared ----------

function StepShell({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card className="p-md md:p-lg">
      <h4 className="text-headline-md font-semibold text-on-surface mb-xs">{title}</h4>
      {desc && <p className="text-body-md text-on-surface-variant mb-md">{desc}</p>}
      {children}
    </Card>
  );
}

function FooterNav({
  onBack,
  onNext,
  nextLabel = 'Lanjutkan',
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-sm mt-lg">
      {onBack ? (
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
      ) : (
        <span />
      )}
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel} <ArrowRight size={18} />
        </Button>
      )}
    </div>
  );
}

function DataDiriStep({ onNext }: { onNext: () => void }) {
  return (
    <StepShell title="Data Diri" desc="Pastikan data Anda sudah benar sebelum memulai pemindaian.">
      <div className="space-y-md">
        <Field label="Nama Lengkap" value={SEED_PROFILE.fullName} />
        <Field label="ID Pasien" value={SEED_PROFILE.medicalId} />
        <Field label="Email" value={SEED_PROFILE.email} />
      </div>
      <FooterNav onNext={onNext} />
    </StepShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-outline-variant rounded-lg px-md py-sm">
      <p className="text-caption text-on-surface-variant">{label}</p>
      <p className="text-body-lg text-on-surface">{value}</p>
    </div>
  );
}

function KuesionerStep({
  factors,
  toggle,
  onBack,
  onNext,
}: {
  factors: string[];
  toggle: (f: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell title="Kuesioner Faktor Risiko" desc="Centang yang sesuai dengan kondisi Anda (opsional).">
      <div className="space-y-sm">
        {RISK_FACTORS.map((f) => {
          const checked = factors.includes(f);
          return (
            <label
              key={f}
              className={`flex items-center gap-sm px-md py-sm rounded-lg border cursor-pointer transition-colors ${
                checked ? 'border-primary bg-surface-container-low' : 'border-outline-variant'
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(f)} className="w-4 h-4 accent-primary" />
              <span className="text-body-md text-on-surface">{f}</span>
            </label>
          );
        })}
      </div>
      <FooterNav onBack={onBack} onNext={onNext} />
    </StepShell>
  );
}

function InstruksiStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <StepShell title="Instruksi Pengambilan Foto" desc="Ikuti panduan berikut untuk hasil terbaik.">
      <ul className="space-y-sm">
        {GUIDANCE.map((g, i) => (
          <li key={g} className="flex items-start gap-sm">
            <span className="w-6 h-6 shrink-0 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-body-md text-on-surface-variant">{g}</span>
          </li>
        ))}
      </ul>
      <FooterNav onBack={onBack} onNext={onNext} nextLabel="Mulai Ambil Foto" />
    </StepShell>
  );
}

// ---------- capture step (single photo, 3 modes) ----------

const MODES: Array<{ key: CaptureMode; label: string; icon: typeof Camera }> = [
  { key: 'upload', label: 'Unggah Foto', icon: Upload },
  { key: 'camera', label: 'Ambil Foto', icon: Camera },
  { key: 'live', label: 'Deteksi Langsung', icon: Video },
];

function AmbilFotoStep({
  mode,
  setMode,
  photo,
  setPhoto,
  onBack,
  onNext,
  inferSource,
  threshold,
  onLiveCapture,
}: {
  mode: CaptureMode;
  setMode: (m: CaptureMode) => void;
  photo: string | null;
  setPhoto: (url: string | null) => void;
  onBack: () => void;
  onNext: () => void;
  inferSource: (s: CanvasImageSource) => Promise<InferenceOutput>;
  threshold: number;
  onLiveCapture: (url: string, output: InferenceOutput) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
      <div className="lg:col-span-2 space-y-md">
        <div className="bg-surface-container-low border-l-4 border-primary rounded-xl p-md flex gap-sm">
          <Info size={22} className="text-primary shrink-0" />
          <div>
            <h4 className="text-headline-md font-semibold text-on-surface mb-xs">Unggah Foto Rongga Mulut</h4>
            <p className="text-body-md text-on-surface-variant">
              Cukup satu foto area mulut dengan pencahayaan yang cukup. Pilih cara pengambilan di bawah.
            </p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-sm">
          {MODES.map(({ key, label, icon: Icon }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex flex-col items-center gap-xs px-sm py-md rounded-xl border transition-colors ${
                  active
                    ? 'border-primary bg-surface-container-low text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <Icon size={22} />
                <span className="text-label-md font-semibold text-center">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode content */}
        {mode === 'live' ? (
          <>
            <LiveInference inferSource={inferSource} threshold={threshold} onCapture={onLiveCapture} />
            <div className="flex items-center justify-between gap-sm mt-md">
              <Button variant="outline" onClick={onBack}>
                Kembali
              </Button>
            </div>
          </>
        ) : (
          <>
            {mode === 'camera' ? (
              <CameraCapture photo={photo} setPhoto={setPhoto} />
            ) : (
              <SinglePhotoUpload photo={photo} setPhoto={setPhoto} />
            )}
            <FooterNav
              onBack={onBack}
              onNext={onNext}
              nextLabel="Lanjutkan Ke Konfirmasi"
              nextDisabled={!photo}
            />
          </>
        )}
      </div>

      {/* Right rail: guidance + examples */}
      <div className="space-y-md">
        <Card className="p-md">
          <h4 className="text-headline-md font-semibold text-on-surface mb-sm flex items-center gap-sm">
            <Lightbulb size={20} className="text-primary" /> Panduan Pengambilan
          </h4>
          <ol className="space-y-sm">
            {GUIDANCE.map((g, i) => (
              <li key={g} className="flex items-start gap-sm">
                <span className="w-5 h-5 shrink-0 rounded-full bg-primary-container text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-body-md text-on-surface-variant">{g}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-md">
          <h4 className="text-headline-md font-semibold text-on-surface mb-sm">Contoh Hasil Foto</h4>
          <p className="text-label-md font-bold text-tertiary flex items-center gap-xs mb-xs">
            <CheckCircle2 size={16} /> BENAR
          </p>
          <div className="grid grid-cols-3 gap-xs mb-xs">
            {['ok-01.jpeg', 'ok-02.jpeg', 'ok-03.jpeg'].map((f) => (
              <img
                key={f}
                src={`/assets/samples/${f}`}
                alt="Contoh foto yang benar"
                className="h-20 w-full object-cover rounded-lg border border-tertiary/40"
              />
            ))}
          </div>
          <p className="text-caption text-on-surface-variant italic mb-md">Terang, fokus, dan area terlihat jelas.</p>
          <p className="text-label-md font-bold text-error flex items-center gap-xs mb-xs">
            <XCircle size={16} /> SALAH
          </p>
          <div className="grid grid-cols-2 gap-xs">
            {['bad-01.jpeg', 'bad-02.png'].map((f) => (
              <img
                key={f}
                src={`/assets/samples/${f}`}
                alt="Contoh foto yang salah"
                className="h-24 w-full object-cover rounded-lg border border-error/40"
              />
            ))}
          </div>
          <p className="text-caption text-on-surface-variant italic mt-xs">Hindari foto buram atau terlalu gelap.</p>
        </Card>
      </div>
    </div>
  );
}

function SinglePhotoUpload({
  photo,
  setPhoto,
}: {
  photo: string | null;
  setPhoto: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="relative w-full h-72 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low hover:border-primary transition-colors flex flex-col items-center justify-center gap-sm overflow-hidden"
    >
      {photo ? <img src={photo} alt="Foto rongga mulut" className="absolute inset-0 w-full h-full object-cover" /> : null}
      <div
        className={`relative z-10 flex flex-col items-center gap-sm ${
          photo ? 'bg-black/40 rounded-lg px-md py-sm text-white' : ''
        }`}
      >
        <span className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center">
          <Upload size={26} />
        </span>
        <span className="text-body-lg font-bold">{photo ? 'Ganti foto' : 'Ketuk untuk memilih foto'}</span>
        <span className="text-caption opacity-90">Maksimal ukuran file 5MB (JPG/PNG)</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPhoto(URL.createObjectURL(file));
        }}
      />
    </button>
  );
}

function KonfirmasiStep({
  photo,
  running,
  modelLoading,
  onBack,
  onProcess,
}: {
  photo: string | null;
  running: boolean;
  modelLoading: boolean;
  onBack: () => void;
  onProcess: () => void;
}) {
  return (
    <StepShell title="Konfirmasi Pemeriksaan" desc="Tinjau foto sebelum dianalisis oleh AI di perangkat Anda.">
      {photo && (
        <img
          src={photo}
          alt="Foto rongga mulut"
          className="w-full max-h-80 object-contain rounded-lg border border-outline-variant bg-surface-container"
        />
      )}
      {modelLoading && (
        <p className="text-caption text-on-surface-variant mt-md flex items-center gap-xs">
          <Loader2 size={14} className="animate-spin" /> Memuat model AI di perangkat…
        </p>
      )}
      <div className="flex items-center justify-between gap-sm mt-lg">
        <Button variant="outline" onClick={onBack} disabled={running}>
          Kembali
        </Button>
        <Button onClick={onProcess} disabled={running || !photo}>
          {running ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Memproses…
            </>
          ) : (
            <>
              Proses Hasil <ArrowRight size={18} />
            </>
          )}
        </Button>
      </div>
    </StepShell>
  );
}

function SelesaiStep({
  result,
  onReset,
  onHistory,
}: {
  result: { risk: RiskResult; photo: string; output: InferenceOutput };
  onReset: () => void;
  onHistory: () => void;
}) {
  const { risk, photo, output } = result;
  return (
    <div className="space-y-md">
      <Card className="p-lg" accent={risk.color}>
        <div className="flex items-center gap-md mb-sm">
          <RiskIcon level={risk.level} size={32} />
          <div>
            <p className="text-label-md uppercase font-bold" style={{ color: risk.color }}>
              Hasil Analisis
            </p>
            <h3 className="text-display-lg-mobile font-bold text-on-surface">{risk.label}</h3>
          </div>
        </div>
        <p className="text-body-md text-on-surface-variant mb-md">{risk.advice}</p>
        <p className="text-caption text-on-surface-variant">Skor risiko: {(output.prob * 100).toFixed(1)}%</p>
      </Card>

      <Card className="p-md md:p-lg">
        <h4 className="text-headline-md font-semibold text-on-surface mb-sm">Analisis Visual (Grad-CAM)</h4>
        <p className="text-body-md text-on-surface-variant mb-md">
          Kotak dan area terang menunjukkan bagian yang paling memengaruhi penilaian model.
        </p>
        <ResultCanvas photo={photo} output={output} />
      </Card>

      <div className="flex items-center justify-between gap-sm">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw size={18} /> Pemeriksaan Baru
        </Button>
        <Button onClick={onHistory}>
          Lihat Riwayat <ArrowRight size={18} />
        </Button>
      </div>

      <p className="text-caption text-on-surface-variant text-center pt-sm">
        Oral Screen AI adalah alat bantu triase, bukan diagnosis. Konsultasikan hasil dengan tenaga medis
        profesional.
      </p>
    </div>
  );
}

function ResultCanvas({ photo, output }: { photo: string; output: InferenceOutput }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    loadImage(photo).then((img) => {
      if (cancelled || !canvasRef.current) return;
      renderCAMToCanvas(canvasRef.current, img, output.heatmap);
    });
    return () => {
      cancelled = true;
    };
  }, [photo, output]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-h-96 rounded-lg border border-outline-variant bg-surface-container"
      style={{ objectFit: 'contain' }}
    />
  );
}
