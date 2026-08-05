// Maps the model's referral probability to a binary triage verdict:
//   Perlu Rujukan (referral recommended) vs Tidak Perlu Rujukan (no referral).
//
// The model outputs P(PERLU RUJUKAN) per image. A scan uploads several regions;
// the MOST concerning region drives triage, so we aggregate with `max`. The
// verdict is anchored on the calibrated decision threshold (read from
// model_config.json at runtime): at/above the threshold => referral recommended.

export type RiskLevel = 'TidakRujukan' | 'Rujukan';

export interface RiskResult {
  level: RiskLevel;
  /** Aggregated (max) P(referral) across all scanned regions, 0..1. */
  probability: number;
  /** Hex color for badges / left-border status cards. */
  color: string;
  /** Short Indonesian status label, e.g. "Perlu Rujukan". */
  label: string;
  /** English status label. */
  labelEn: string;
  /** Longer advice copy for the result screen (Indonesian). */
  advice: string;
  /** English advice copy. */
  adviceEn: string;
}

const COPY: Record<RiskLevel, { color: string; label: string; labelEn: string; advice: string; adviceEn: string }> = {
  TidakRujukan: {
    color: '#006b2d',
    label: 'Tidak Perlu Rujukan',
    labelEn: 'No Referral Needed',
    advice:
      'Tidak ditemukan ciri yang memerlukan rujukan pada citra Anda. Tetap lakukan pemeriksaan rutin, dan periksakan bila ada nyeri, pendarahan, atau luka yang tak sembuh dalam 2 minggu.',
    adviceEn:
      'No features requiring referral were found in your image. Keep up routine checks, and see a professional if you have pain, bleeding, or a sore that does not heal within 2 weeks.',
  },
  Rujukan: {
    color: '#ba1a1a',
    label: 'Perlu Rujukan',
    labelEn: 'Referral Recommended',
    advice:
      'Foto menunjukkan gejala yang sebaiknya diperiksa oleh dokter gigi spesialis penyakit mulut. Hasil ini merupakan deteksi dini, bukan diagnosis akhir.',
    adviceEn:
      'The image shows features that should be examined by a specialist in oral medicine. This result is early detection, not a final diagnosis.',
  },
};

/** Classifies a single aggregated probability into a binary referral verdict. */
export function classifyRisk(probability: number, decisionThreshold: number): RiskResult {
  const level: RiskLevel = probability < decisionThreshold ? 'TidakRujukan' : 'Rujukan';
  return { level, probability, ...COPY[level] };
}

/** Aggregates per-region probabilities (max) then classifies. */
export function aggregateRisk(probabilities: number[], decisionThreshold: number): RiskResult {
  const top = probabilities.length ? Math.max(...probabilities) : 0;
  return classifyRisk(top, decisionThreshold);
}

/** Style helper for referral chips/badges used across Riwayat + Beranda. */
export function riskChipClasses(level: RiskLevel): string {
  return level === 'Rujukan'
    ? 'bg-error-container text-on-error-container'
    : 'bg-tertiary-fixed/40 text-tertiary';
}
