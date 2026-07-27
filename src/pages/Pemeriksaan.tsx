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
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Stepper, StepperMobile } from '../components/ui/Stepper';
import { RiskIcon } from '../components/ui/RiskBadge';
import { LiveInference } from '../components/scan/LiveInference';
import { CameraCapture } from '../components/scan/CameraCapture';
import { useOnnxModel, type ModelProgress } from '../hooks/useOnnxModel';
import { renderCAMToCanvas, loadImage, type InferenceOutput } from '../lib/inference';
import { classifyRisk, type RiskResult } from '../lib/risk';
import { addScan, generateRefCode, getProfile } from '../lib/repository';
import { useLang } from '../lib/i18n';
import type { Profile, ScanRecord } from '../lib/types';
import { EMPTY_PROFILE } from '../lib/mockData';

// Identity (Data Diri) comes from the profile, risk factors are captured on the
// Profil page, and the photo instructions are shown once then available via a
// Tips button — so the per-scan flow is just capture → confirm → result.
const STEPS: [string, string][] = [
  ['Ambil Foto', 'Take Photo'],
  ['Konfirmasi', 'Confirm'],
  ['Selesai', 'Done'],
];

// Shown automatically the first time, then only on demand via the Tips button.
const SEEN_TIPS_KEY = 'osa:seen-scan-tips:v1';

const GUIDANCE: [string, string][] = [
  ['Cari ruangan dengan cahaya alami yang terang.', 'Find a room with bright, natural light.'],
  ['Berdiri di depan cermin agar posisi kamera pas.', 'Stand in front of a mirror to line up the camera.'],
  ['Gunakan lampu flash jika di dalam ruangan minim cahaya.', 'Use the flash if the room is dim.'],
  ['Pastikan fokus terkunci pada bagian mulut yang difoto.', 'Make sure focus is locked on the mouth area.'],
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
  const { t } = useLang();
  const model = useOnnxModel();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<CaptureMode>('upload');
  const [photo, setPhoto] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [result, setResult] = useState<{ risk: RiskResult; photo: string; output: InferenceOutput } | null>(
    null,
  );

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(EMPTY_PROFILE));
  }, []);

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
      patientName: profile.fullName,
      patientMedicalId: profile.medicalId,
      thumbnail,
    };
    await addScan(scan);
    setResult({ risk, photo: photoUrl, output });
    setStep(2);
  };

  const [scanError, setScanError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!photo) return;
    setRunning(true);
    setScanError(null);
    try {
      const output = await model.infer(photo);
      await commitResult(photo, output);
    } catch (e) {
      console.error(e);
      setScanError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setMode('upload');
    setPhoto(null);
    setResult(null);
    setStep(0);
  };

  return (
    <div>
      {/* Full-screen overlay while the ~25 MB model downloads on first use. */}
      {model.loading && !model.error && <ModelLoadingOverlay progress={model.progress} />}

      {/* Stepper */}
      <Card className="p-md md:p-lg mb-md hidden md:block">
        <Stepper steps={STEPS.map(([id, en]) => t(id, en))} current={step} />
      </Card>
      <div className="md:hidden mb-md">
        <StepperMobile steps={STEPS.map(([id, en]) => t(id, en))} current={step} />
      </div>

      {step === 0 && (
        <AmbilFotoStep
          mode={mode}
          setMode={setMode}
          photo={photo}
          setPhoto={setPhoto}
          onBack={() => navigate('/')}
          onNext={() => setStep(1)}
          inferSource={model.inferSource}
          threshold={threshold}
          onLiveCapture={commitResult}
        />
      )}
      {step === 1 && (
        <KonfirmasiStep
          photo={photo}
          running={running}
          modelReady={model.ready}
          modelLoading={model.loading}
          modelError={model.error}
          progress={model.progress}
          scanError={scanError}
          onReloadModel={model.reload}
          onBack={() => setStep(0)}
          onProcess={runAnalysis}
        />
      )}
      {step === 2 && result && (
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
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between gap-sm mt-lg">
      {onBack ? (
        <Button variant="outline" onClick={onBack}>
          {t('Kembali', 'Back')}
        </Button>
      ) : (
        <span />
      )}
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel ?? t('Lanjutkan', 'Continue')} <ArrowRight size={18} />
        </Button>
      )}
    </div>
  );
}


/** The photo-taking guidance list, reused by the Tips modal. */
function InstruksiContent() {
  const { t } = useLang();
  return (
    <ul className="space-y-sm">
      {GUIDANCE.map(([id, en], i) => (
        <li key={id} className="flex items-start gap-sm">
          <span className="w-6 h-6 shrink-0 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <span className="text-body-md text-on-surface-variant">{t(id, en)}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------- capture step (single photo, 3 modes) ----------

const MODES: Array<{ key: CaptureMode; label: string; labelEn: string; icon: typeof Camera }> = [
  { key: 'upload', label: 'Unggah Foto', labelEn: 'Upload', icon: Upload },
  { key: 'camera', label: 'Ambil Foto', labelEn: 'Camera', icon: Camera },
  { key: 'live', label: 'Deteksi Langsung', labelEn: 'Live Detect', icon: Video },
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
  const { t } = useLang();
  const [tipsOpen, setTipsOpen] = useState(false);

  // Auto-show the photo tips the first time — but only below lg, where the
  // right-rail guidance is hidden. On desktop the right rail already shows it.
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop && localStorage.getItem(SEEN_TIPS_KEY) !== 'true') {
      setTipsOpen(true);
      localStorage.setItem(SEEN_TIPS_KEY, 'true');
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
      <div className="lg:col-span-2 space-y-md">
        <div className="bg-surface-container-low border-l-4 border-primary rounded-xl p-md flex items-start gap-sm">
          <Info size={22} className="text-primary shrink-0" />
          <div className="flex-1">
            <h4 className="text-headline-md font-semibold text-on-surface mb-xs">
              {t('Unggah Foto Rongga Mulut', 'Upload an Oral Cavity Photo')}
            </h4>
            <p className="text-body-md text-on-surface-variant">
              {t(
                'Cukup satu foto area mulut dengan pencahayaan yang cukup. Pilih cara pengambilan di bawah.',
                'Just one well-lit photo of the mouth area. Choose a capture method below.',
              )}
            </p>
          </div>
          <button
            onClick={() => setTipsOpen(true)}
            className="lg:hidden shrink-0 inline-flex items-center gap-xs rounded-full border border-primary text-primary px-sm py-xs text-label-md font-semibold hover:bg-surface-container"
          >
            <Lightbulb size={16} /> {t('Tips', 'Tips')}
          </button>
        </div>

        <Modal open={tipsOpen} onClose={() => setTipsOpen(false)} ariaLabel="Tips">
          <h3 className="text-headline-md font-bold text-on-surface mb-xs pr-lg">
            {t('Instruksi Pengambilan Foto', 'Photo Capture Instructions')}
          </h3>
          <p className="text-body-md text-on-surface-variant mb-md">
            {t('Ikuti panduan berikut untuk hasil terbaik.', 'Follow these tips for the best result.')}
          </p>
          <InstruksiContent />
          {/* Examples live here on mobile; on desktop they're in the right rail. */}
          <div className="lg:hidden mt-lg pt-md border-t border-outline-variant">
            <ContohHasilFoto />
          </div>
          <div className="flex justify-end mt-lg">
            <Button onClick={() => setTipsOpen(false)}>{t('Mengerti', 'Got it')}</Button>
          </div>
        </Modal>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-sm">
          {MODES.map(({ key, label, labelEn, icon: Icon }) => {
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
                <span className="text-label-md font-semibold text-center">{t(label, labelEn)}</span>
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
                {t('Kembali', 'Back')}
              </Button>
            </div>
          </>
        ) : (
          <>
            {mode === 'camera' ? (
              <CameraCapture photo={photo} setPhoto={setPhoto} onCommit={onNext} />
            ) : (
              <SinglePhotoUpload photo={photo} setPhoto={setPhoto} onCommit={onNext} />
            )}
            <FooterNav
              onBack={onBack}
              onNext={onNext}
              nextLabel={t('Lanjutkan Ke Konfirmasi', 'Continue to Confirm')}
              nextDisabled={!photo}
            />
          </>
        )}
      </div>

      {/* Right rail: guidance + examples. Desktop only — on mobile this is
          redundant with the Tips modal (which carries the same content). */}
      <div className="hidden lg:block space-y-md">
        <Card className="p-md">
          <h4 className="text-headline-md font-semibold text-on-surface mb-sm flex items-center gap-sm">
            <Lightbulb size={20} className="text-primary" /> {t('Panduan Pengambilan', 'Capture Guide')}
          </h4>
          <ol className="space-y-sm">
            {GUIDANCE.map(([id, en], i) => (
              <li key={id} className="flex items-start gap-sm">
                <span className="w-5 h-5 shrink-0 rounded-full bg-primary-container text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-body-md text-on-surface-variant">{t(id, en)}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-md">
          <ContohHasilFoto />
        </Card>
      </div>
    </div>
  );
}

/** "Correct vs wrong" example photos, reused in the right rail and Tips modal. */
function ContohHasilFoto() {
  const { t } = useLang();
  return (
    <>
      <h4 className="text-headline-md font-semibold text-on-surface mb-sm">
        {t('Contoh Hasil Foto', 'Photo Examples')}
      </h4>
      <p className="text-label-md font-bold text-tertiary flex items-center gap-xs mb-xs">
        <CheckCircle2 size={16} /> {t('BENAR', 'GOOD')}
      </p>
      <div className="grid grid-cols-3 gap-xs mb-xs">
        {['ok-01.jpeg', 'ok-02.jpeg', 'ok-03.jpeg'].map((f) => (
          <img
            key={f}
            src={`/assets/samples/${f}`}
            alt={t('Contoh foto yang benar', 'Example of a good photo')}
            className="h-20 w-full object-cover rounded-lg border border-tertiary/40"
          />
        ))}
      </div>
      <p className="text-caption text-on-surface-variant italic mb-md">
        {t('Terang, fokus, dan area terlihat jelas.', 'Bright, in focus, and the area is clearly visible.')}
      </p>
      <p className="text-label-md font-bold text-error flex items-center gap-xs mb-xs">
        <XCircle size={16} /> {t('SALAH', 'BAD')}
      </p>
      <div className="grid grid-cols-2 gap-xs">
        {['bad-01.jpeg', 'bad-02.png'].map((f) => (
          <img
            key={f}
            src={`/assets/samples/${f}`}
            alt={t('Contoh foto yang salah', 'Example of a bad photo')}
            className="h-24 w-full object-cover rounded-lg border border-error/40"
          />
        ))}
      </div>
      <p className="text-caption text-on-surface-variant italic mt-xs">
        {t('Hindari foto buram atau terlalu gelap.', 'Avoid blurry or too-dark photos.')}
      </p>
    </>
  );
}

function SinglePhotoUpload({
  photo,
  setPhoto,
  onCommit,
}: {
  photo: string | null;
  setPhoto: (url: string | null) => void;
  /** Called right after a fresh file is chosen (used to auto-advance). */
  onCommit?: () => void;
}) {
  const { t } = useLang();
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
        <span className="text-body-lg font-bold">
          {photo ? t('Ganti foto', 'Change photo') : t('Ketuk untuk memilih foto', 'Tap to choose a photo')}
        </span>
        <span className="text-caption opacity-90">{t('Maksimal ukuran file 5MB (JPG/PNG)', 'Max file size 5MB (JPG/PNG)')}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setPhoto(URL.createObjectURL(file));
            onCommit?.();
          }
        }}
      />
    </button>
  );
}

/** Formats a byte count as MB with one decimal (e.g. 12.4). */
function mb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/** Full-screen overlay shown while the model downloads/initialises on first use. */
function ModelLoadingOverlay({ progress }: { progress: ModelProgress | null }) {
  const { t } = useLang();
  const total = progress?.total ?? 0;
  const loaded = progress?.loaded ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/95 backdrop-blur-sm p-lg">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-md">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
        <h3 className="text-headline-md font-bold text-on-surface">
          {t('Menyiapkan model AI', 'Preparing the AI model')}
        </h3>
        <p className="text-body-md text-on-surface-variant mt-xs">
          {t(
            'Model dijalankan langsung di perangkat Anda dan diunduh sekali saja, lalu tersimpan untuk pemeriksaan berikutnya.',
            'The model runs entirely on your device and downloads only once, then is cached for future scans.',
          )}
        </p>

        <div className="mt-lg h-2.5 rounded-full bg-surface-container overflow-hidden">
          <div
            className={`h-full bg-primary transition-[width] duration-200 ${pct == null ? 'animate-pulse w-1/3' : ''}`}
            style={pct == null ? undefined : { width: `${pct}%` }}
          />
        </div>
        <p className="text-caption text-on-surface-variant mt-sm tabular-nums">
          {total > 0
            ? `${mb(loaded)} / ${mb(total)} MB · ${pct}%`
            : t('Memuat…', 'Loading…')}
        </p>
      </div>
    </div>
  );
}

/** Prominent progress panel shown while the ~25 MB model downloads on first use. */
function ModelDownload({ progress }: { progress: ModelProgress | null }) {
  const { t } = useLang();
  const total = progress?.total ?? 0;
  const loaded = progress?.loaded ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null;

  return (
    <div className="mt-md rounded-xl border border-outline-variant bg-surface-container-low p-md">
      <p className="text-body-md font-semibold text-on-surface flex items-center gap-xs">
        <Loader2 size={16} className="animate-spin text-primary" />
        {t('Menyiapkan model AI di perangkat…', 'Preparing the on-device AI model…')}
      </p>
      <p className="text-caption text-on-surface-variant mt-xs">
        {t(
          'Model diunduh sekali lalu tersimpan untuk pemeriksaan berikutnya.',
          'The model downloads once, then is cached for future scans.',
        )}
      </p>
      <div className="mt-sm h-2 rounded-full bg-surface-container overflow-hidden">
        <div
          className={`h-full bg-primary transition-[width] duration-200 ${pct == null ? 'animate-pulse w-1/3' : ''}`}
          style={pct == null ? undefined : { width: `${pct}%` }}
        />
      </div>
      <p className="text-caption text-on-surface-variant mt-xs tabular-nums">
        {total > 0
          ? `${mb(loaded)} / ${mb(total)} MB · ${pct}%`
          : `${mb(loaded)} MB`}
      </p>
    </div>
  );
}

function KonfirmasiStep({
  photo,
  running,
  modelReady,
  modelLoading,
  modelError,
  progress,
  scanError,
  onReloadModel,
  onBack,
  onProcess,
}: {
  photo: string | null;
  running: boolean;
  modelReady: boolean;
  modelLoading: boolean;
  modelError: string | null;
  progress: ModelProgress | null;
  scanError: string | null;
  onReloadModel: () => void;
  onBack: () => void;
  onProcess: () => void;
}) {
  const { t } = useLang();
  const err = modelError ?? scanError;
  return (
    <StepShell
      title={t('Konfirmasi Pemeriksaan', 'Confirm Scan')}
      desc={t(
        'Tinjau foto sebelum dianalisis oleh AI di perangkat Anda.',
        'Review the photo before it is analyzed by the on-device AI.',
      )}
    >
      {photo && (
        <img
          src={photo}
          alt="Foto rongga mulut"
          className="w-full max-h-80 object-contain rounded-lg border border-outline-variant bg-surface-container"
        />
      )}

      {/* Model still downloading/initialising — show real progress, not a blind spinner. */}
      {modelLoading && !err && <ModelDownload progress={progress} />}

      {/* Load or inference failed — surface the real reason and let the user retry. */}
      {err && (
        <div className="mt-md rounded-xl border border-error/40 bg-error/5 p-md">
          <p className="text-body-md font-semibold text-error">
            {t('Gagal menyiapkan model AI.', 'Could not prepare the AI model.')}
          </p>
          <p className="text-caption text-on-surface-variant mt-xs break-words">{err}</p>
          <Button variant="outline" onClick={onReloadModel} className="mt-sm">
            <RotateCcw size={16} /> {t('Coba Lagi', 'Try Again')}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-sm mt-lg">
        <Button variant="outline" onClick={onBack} disabled={running}>
          {t('Kembali', 'Back')}
        </Button>
        <Button onClick={onProcess} disabled={running || !photo || !modelReady}>
          {running ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {t('Memproses…', 'Processing…')}
            </>
          ) : modelLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {t('Memuat model…', 'Loading model…')}
            </>
          ) : (
            <>
              {t('Proses Hasil', 'Process Result')} <ArrowRight size={18} />
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
  const { t, lang } = useLang();
  const { risk, photo, output } = result;
  return (
    <div className="space-y-md">
      <Card className="p-lg" accent={risk.color}>
        <div className="flex items-center gap-md mb-md">
          <RiskIcon level={risk.level} size={32} />
          <div>
            <p className="text-label-md uppercase font-bold" style={{ color: risk.color }}>
              {t('Hasil Analisis', 'Analysis Result')}
            </p>
            <h3 className="text-display-lg-mobile font-bold text-on-surface">
              {lang === 'en' ? risk.labelEn : risk.label}
            </h3>
          </div>
        </div>

        {/* What to do next */}
        <div
          className="rounded-xl p-md"
          style={{ backgroundColor: `${risk.color}14`, borderLeft: `4px solid ${risk.color}` }}
        >
          <p className="text-label-md uppercase font-bold mb-xs" style={{ color: risk.color }}>
            {t('Langkah Selanjutnya', 'Next Steps')}
          </p>
          <p className="text-body-md text-on-surface">{lang === 'en' ? risk.adviceEn : risk.advice}</p>
        </div>
      </Card>

      <Card className="p-md md:p-lg">
        <h4 className="text-headline-md font-semibold text-on-surface mb-sm">
          {t('Analisis Visual (Grad-CAM)', 'Visual Analysis (Grad-CAM)')}
        </h4>
        <p className="text-body-md text-on-surface-variant mb-md">
          {t(
            'Kotak dan area terang menunjukkan bagian yang paling memengaruhi penilaian model.',
            'The box and bright areas highlight the parts that most influenced the model.',
          )}
        </p>
        <ResultCanvas photo={photo} output={output} />
      </Card>

      <div className="flex items-center justify-between gap-sm">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw size={18} /> {t('Pemeriksaan Baru', 'New Scan')}
        </Button>
        <Button onClick={onHistory}>
          {t('Lihat Riwayat', 'View History')} <ArrowRight size={18} />
        </Button>
      </div>

      <p className="text-caption text-on-surface-variant text-center pt-sm">
        {t(
          'Oral Screen AI adalah alat bantu triase, bukan diagnosis. Konsultasikan hasil dengan tenaga medis profesional.',
          'Oral Screen AI is a triage aid, not a diagnosis. Consult a medical professional about your result.',
        )}
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
