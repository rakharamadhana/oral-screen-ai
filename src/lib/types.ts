import type { RiskLevel } from './risk';

export type OralRegion = 'Lidah' | 'Gusi' | 'Pipi Dalam' | 'Langit-langit';

export const ORAL_REGIONS: OralRegion[] = ['Lidah', 'Gusi', 'Pipi Dalam', 'Langit-langit'];

export interface RegionResult {
  region: string;
  probability: number;
}

export interface ScanRecord {
  id: string;
  refCode: string; // e.g. "#OSA-9821-XP"
  createdAt: string; // ISO timestamp
  riskLevel: RiskLevel;
  topProbability: number;
  regionResults: RegionResult[];
  /** Small downscaled JPEG data URL of the most concerning region, for lists. */
  thumbnail: string | null;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  medicalId: string;
  phone: string;
  birthDate: string;
  memberSince: string;
  avatarUrl: string | null;
  verified: boolean;
  notifications: {
    exams: boolean;
    education: boolean;
    updates: boolean;
  };
}

export interface Article {
  id: string;
  category: 'Gejala' | 'Pencegahan' | 'Perawatan' | 'Gaya Hidup' | 'Teknologi';
  title: string;
  excerpt: string;
  readMinutes: number;
  featured?: boolean;
  /** Tailwind gradient classes used as a placeholder cover. */
  cover: string;
  /** Full article body as paragraphs (falls back to a default when omitted). */
  body?: string[];
}

export interface Checkup {
  monthLabel: string; // "MEI"
  day: string; // "24"
  title: string;
  detail: string;
}
