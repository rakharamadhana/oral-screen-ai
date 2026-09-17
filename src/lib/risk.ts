// Maps the model's predicted class to an app-level triage verdict across 4
// oral conditions: Mulut Normal, Sariawan, Kelainan Mulut, Kanker Mulut.
//
// The model has no single scalar decision threshold anymore (that only made
// sense for the old binary referral/no-referral model) -- the predicted class
// is simply argmax(softmax(logits)), already resolved by inference.ts. This
// module only maps that resolved class to UI copy/color and, for stored scans
// (which persist the resolved class, not raw probabilities), reconstructs the
// same RiskResult shape without re-running any classification.

import type { InferenceOutput } from './inference';

export type RiskLevel = 'MulutNormal' | 'Sariawan' | 'KelainanMulut' | 'KankerMulut';

/** Maps a raw model class name (from model_config.json) to an app-level RiskLevel. */
const CLASS_NAME_TO_LEVEL: Record<string, RiskLevel> = {
  'SUSPECT MULUT NORMAL': 'MulutNormal',
  'SUSPECT SARIAWAN': 'Sariawan',
  'SUSPECT KELAINAN MULUT': 'KelainanMulut',
  'SUSPECT KANKER MULUT': 'KankerMulut',
};

/**
 * Falls back to the most severe level (KankerMulut) for an unrecognised class
 * name -- e.g. a config from a future retrain adds a class this build doesn't
 * know about yet. Silently mapping to "normal" would be the dangerous
 * direction to fail in; escalating to "needs attention" is the safe one.
 */
export function classNameToRiskLevel(className: string): RiskLevel {
  return CLASS_NAME_TO_LEVEL[className] ?? 'KelainanMulut';
}

export interface RiskResult {
  level: RiskLevel;
  /** Confidence of the predicted class, 0..1. */
  probability: number;
  /** Hex color for badges / left-border status cards. */
  color: string;
  /** Short Indonesian status label. */
  label: string;
  /** English status label. */
  labelEn: string;
  /** Longer advice copy for the result screen (Indonesian). */
  advice: string;
  /** English advice copy. */
  adviceEn: string;
}

const COPY: Record<RiskLevel, Omit<RiskResult, 'level' | 'probability'>> = {
  MulutNormal: {
    color: '#006b2d',
    label: 'Mulut Normal',
    labelEn: 'Normal',
    advice:
      'Tidak ditemukan ciri kelainan pada citra Anda. Tetap lakukan pemeriksaan rutin, dan periksakan bila ada nyeri, pendarahan, atau luka yang tak sembuh dalam 2 minggu.',
    adviceEn:
      'No abnormal features were found in your image. Keep up routine checks, and see a professional if you have pain, bleeding, or a sore that does not heal within 2 weeks.',
  },
  Sariawan: {
    color: '#f9a825',
    label: 'Diduga Sariawan',
    labelEn: 'Suspected Canker Sore',
    advice:
      'Foto menunjukkan pola yang konsisten dengan sariawan (ulkus aftosa), umumnya jinak dan sembuh sendiri dalam 1-2 minggu. Periksakan ke dokter gigi bila tidak membaik atau sering kambuh.',
    adviceEn:
      'The image shows a pattern consistent with a canker sore, usually benign and self-healing within 1-2 weeks. See a dentist if it does not improve or recurs often.',
  },
  KelainanMulut: {
    color: '#ef6c00',
    label: 'Diduga Kelainan Mulut',
    labelEn: 'Suspected Oral Abnormality',
    advice:
      'Foto menunjukkan kelainan pada mukosa mulut yang sebaiknya diperiksa oleh dokter gigi. Hasil ini merupakan deteksi dini, bukan diagnosis akhir.',
    adviceEn:
      'The image shows an oral mucosal abnormality that should be examined by a dentist. This result is early detection, not a final diagnosis.',
  },
  KankerMulut: {
    color: '#ba1a1a',
    label: 'Diduga Kanker Mulut',
    labelEn: 'Suspected Oral Cancer',
    advice:
      'Foto menunjukkan gejala yang sebaiknya SEGERA diperiksa oleh dokter gigi spesialis penyakit mulut. Hasil ini merupakan deteksi dini, bukan diagnosis akhir.',
    adviceEn:
      'The image shows features that should be examined URGENTLY by a specialist in oral medicine. This result is early detection, not a final diagnosis.',
  },
};

/** Builds a RiskResult for an already-resolved level (e.g. a stored scan). */
export function riskResultForLevel(level: RiskLevel, probability = 0): RiskResult {
  return { level, probability, ...COPY[level] };
}

/** Builds a RiskResult straight from a fresh inference output. */
export function classifyFromOutput(output: InferenceOutput): RiskResult {
  const level = classNameToRiskLevel(output.predictedClassName);
  return riskResultForLevel(level, output.probs[output.predictedIndex]);
}

/** Style helper for referral chips/badges used across Riwayat + Beranda. */
export function riskChipClasses(level: RiskLevel): string {
  switch (level) {
    case 'KankerMulut':
      return 'bg-error-container text-on-error-container';
    case 'KelainanMulut':
      return 'bg-secondary-container text-on-secondary-container';
    case 'Sariawan':
      return 'bg-tertiary-container text-on-tertiary-container';
    case 'MulutNormal':
      return 'bg-tertiary-fixed/40 text-tertiary';
  }
}
