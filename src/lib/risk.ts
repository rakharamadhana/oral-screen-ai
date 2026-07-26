// Maps the model's referral probability to the three-level triage risk shown in
// the OralDetect designs: Risiko Rendah / Sedang / Tinggi.
//
// The model outputs P(PERLU RUJUKAN) per image. A scan uploads several regions;
// the MOST concerning region drives triage, so we aggregate with `max`.
//
// Bands are anchored on the calibrated decision threshold (~0.1973 from
// model_config.json). Below threshold => Rendah. The upper cut for Sedang vs
// Tinggi is a product decision, kept here as a single constant.

export type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi';

/** Probability at/above which a scan is escalated to high risk. */
export const HIGH_RISK_CUTOFF = 0.6;

export interface RiskResult {
  level: RiskLevel;
  /** Aggregated (max) P(referral) across all scanned regions, 0..1. */
  probability: number;
  /** Hex color for badges / left-border status cards. */
  color: string;
  /** Short Indonesian status label, e.g. "Risiko Rendah". */
  label: string;
  /** English status label. */
  labelEn: string;
  /** Longer advice copy for the result screen (Indonesian). */
  advice: string;
  /** English advice copy. */
  adviceEn: string;
}

const COPY: Record<RiskLevel, { color: string; label: string; labelEn: string; advice: string; adviceEn: string }> = {
  Rendah: {
    color: '#006b2d',
    label: 'Risiko Rendah',
    labelEn: 'Low Risk',
    advice:
      'Tidak ditemukan ciri yang memerlukan rujukan pada citra Anda. Tetap lakukan pemeriksaan rutin, dan periksakan bila ada nyeri, pendarahan, atau luka yang tak sembuh dalam 2 minggu.',
    adviceEn:
      'No features requiring referral were found in your image. Keep up routine checks, and see a professional if you have pain, bleeding, or a sore that does not heal within 2 weeks.',
  },
  Sedang: {
    color: '#b45309',
    label: 'Perlu Observasi',
    labelEn: 'Needs Observation',
    advice:
      'Terdapat ciri yang sebaiknya diamati lebih lanjut. Jadwalkan pemeriksaan ulang dalam 14 hari dan pantau perubahan pada area tersebut. Ini sinyal triase, bukan diagnosis.',
    adviceEn:
      'Some features are worth monitoring further. Schedule a re-check within 14 days and watch the area for changes. This is a triage signal, not a diagnosis.',
  },
  Tinggi: {
    color: '#ba1a1a',
    label: 'Indikasi Risiko Tinggi',
    labelEn: 'High Risk Indication',
    advice:
      'Citra menunjukkan ciri yang sebaiknya segera diperiksa dokter gigi atau spesialis. Segera konsultasikan hasil ini. Ini sinyal triase, bukan diagnosis.',
    adviceEn:
      'The image shows features that should be examined by a dentist or specialist soon. Consult about this result promptly. This is a triage signal, not a diagnosis.',
  },
};

/** Classifies a single aggregated probability into a risk result. */
export function classifyRisk(probability: number, decisionThreshold: number): RiskResult {
  let level: RiskLevel;
  if (probability < decisionThreshold) level = 'Rendah';
  else if (probability < HIGH_RISK_CUTOFF) level = 'Sedang';
  else level = 'Tinggi';

  return { level, probability, ...COPY[level] };
}

/** Aggregates per-region probabilities (max) then classifies. */
export function aggregateRisk(probabilities: number[], decisionThreshold: number): RiskResult {
  const top = probabilities.length ? Math.max(...probabilities) : 0;
  return classifyRisk(top, decisionThreshold);
}

/** Style helper for risk chips/badges used across Riwayat + Beranda. */
export function riskChipClasses(level: RiskLevel): string {
  switch (level) {
    case 'Rendah':
      return 'bg-tertiary-fixed/40 text-tertiary';
    case 'Sedang':
      return 'bg-warning-container text-on-warning-container';
    case 'Tinggi':
      return 'bg-error-container text-on-error-container';
  }
}
