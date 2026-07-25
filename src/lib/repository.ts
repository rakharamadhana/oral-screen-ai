// Data access for scans + profile.
//
// Uses Supabase (Postgres) when configured; otherwise falls back to localStorage
// so the app is fully functional offline / before a backend exists. Both paths
// return the same domain types (types.ts), so pages never branch on the source.

import { supabase } from './supabase';
import { SEED_HISTORY, SEED_PROFILE } from './mockData';
import type { Profile, ScanRecord } from './types';

const SCANS_KEY = 'osa:scans:v1';
const PROFILE_KEY = 'osa:profile:v1';

// ---------- helpers ----------

export function generateRefCode(): string {
  const rand = (n: number) =>
    Array.from({ length: n }, () => '0123456789'[Math.floor(Math.random() * 10)]).join('');
  const letters = () =>
    Array.from({ length: 2 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
  return `#OSA-${rand(4)}-${letters()}`;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore in demo */
  }
}

// Map a Supabase row to the domain ScanRecord.
type ScanRow = {
  id: string;
  ref_code: string;
  created_at: string;
  risk_level: ScanRecord['riskLevel'];
  top_probability: number;
  region_results: ScanRecord['regionResults'];
  thumbnail: string | null;
};

function rowToScan(r: ScanRow): ScanRecord {
  return {
    id: r.id,
    refCode: r.ref_code,
    createdAt: r.created_at,
    riskLevel: r.risk_level,
    topProbability: r.top_probability,
    regionResults: r.region_results ?? [],
    thumbnail: r.thumbnail,
  };
}

// ---------- scans ----------

export async function listScans(): Promise<ScanRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as ScanRow[]).map(rowToScan);
  }
  // localStorage: user scans first (already newest-first), then seed history.
  const local = readLocal<ScanRecord[]>(SCANS_KEY, []);
  return [...local, ...SEED_HISTORY];
}

export async function addScan(scan: ScanRecord): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('scans').insert({
      ref_code: scan.refCode,
      created_at: scan.createdAt,
      risk_level: scan.riskLevel,
      top_probability: scan.topProbability,
      region_results: scan.regionResults,
      thumbnail: scan.thumbnail,
    });
    if (error) throw error;
    return;
  }
  const local = readLocal<ScanRecord[]>(SCANS_KEY, []);
  writeLocal(SCANS_KEY, [scan, ...local]);
}

export async function getLatestScan(): Promise<ScanRecord | null> {
  const scans = await listScans();
  return scans[0] ?? null;
}

// ---------- profile ----------

export async function getProfile(): Promise<Profile> {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        medicalId: data.medical_id,
        phone: data.phone ?? '',
        birthDate: data.birth_date ?? '',
        memberSince: data.member_since ?? '',
        avatarUrl: data.avatar_url,
        verified: data.verified,
        notifications: data.notifications ?? SEED_PROFILE.notifications,
      };
    }
    return SEED_PROFILE;
  }
  return readLocal<Profile>(PROFILE_KEY, SEED_PROFILE);
}

export async function saveProfile(profile: Profile): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      medical_id: profile.medicalId,
      phone: profile.phone,
      birth_date: profile.birthDate,
      member_since: profile.memberSince,
      avatar_url: profile.avatarUrl,
      verified: profile.verified,
      notifications: profile.notifications,
    });
    if (error) throw error;
    return;
  }
  writeLocal(PROFILE_KEY, profile);
}
