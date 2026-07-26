// Data access for scans + profile + articles.
//
// Uses Supabase (Postgres) when configured; otherwise falls back to localStorage
// so the app is fully functional offline / before a backend exists. Both paths
// return the same domain types (types.ts), so pages never branch on the source.
//
// Privacy: image-derived data (scan thumbnails) is NEVER sent to the server.
// Thumbnails live only in browser localStorage, keyed by scan id, and are
// re-attached to scan records on read. Full-resolution photos are never stored.

import { supabase } from './supabase';
import { SEED_HISTORY, SEED_PROFILE, ARTICLES, getArticleById } from './mockData';
import type { Article, Profile, ScanRecord } from './types';

const SCANS_KEY = 'osa:scans:v1';
const PROFILE_KEY = 'osa:profile:v1';
const THUMBS_KEY = 'osa:thumbs:v1'; // { [scanId]: dataUrl }

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

// ---------- on-device thumbnail store (never leaves the browser) ----------

function saveThumb(id: string, dataUrl: string | null): void {
  if (!dataUrl) return;
  const map = readLocal<Record<string, string>>(THUMBS_KEY, {});
  map[id] = dataUrl;
  writeLocal(THUMBS_KEY, map);
}

function getThumb(id: string): string | null {
  const map = readLocal<Record<string, string>>(THUMBS_KEY, {});
  return map[id] ?? null;
}

// Map a Supabase row to the domain ScanRecord. Thumbnail comes from localStorage.
type ScanRow = {
  id: string;
  ref_code: string;
  created_at: string;
  risk_level: ScanRecord['riskLevel'];
  top_probability: number;
  region_results: ScanRecord['regionResults'];
  patient_name: string | null;
  patient_medical_id: string | null;
};

function rowToScan(r: ScanRow): ScanRecord {
  return {
    id: r.id,
    refCode: r.ref_code,
    createdAt: r.created_at,
    riskLevel: r.risk_level,
    topProbability: r.top_probability,
    regionResults: r.region_results ?? [],
    patientName: r.patient_name ?? undefined,
    patientMedicalId: r.patient_medical_id ?? undefined,
    thumbnail: getThumb(r.id),
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
  // Thumbnail always stays on-device, regardless of backend.
  saveThumb(scan.id, scan.thumbnail);

  if (supabase) {
    // Send the client-generated uuid so the row id matches the local thumbnail
    // key (and so patient identity travels with the scan). No image data.
    const { error } = await supabase.from('scans').insert({
      id: scan.id,
      ref_code: scan.refCode,
      created_at: scan.createdAt,
      risk_level: scan.riskLevel,
      top_probability: scan.topProbability,
      region_results: scan.regionResults,
      patient_name: scan.patientName ?? null,
      patient_medical_id: scan.patientMedicalId ?? null,
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
        riskFactors: data.risk_factors ?? [],
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
      risk_factors: profile.riskFactors,
    });
    if (error) throw error;
    return;
  }
  writeLocal(PROFILE_KEY, profile);
}

// ---------- articles ----------

type ArticleRow = {
  id: string;
  category: Article['category'];
  title: string;
  excerpt: string;
  read_minutes: number;
  featured: boolean;
  cover: string;
  body: string[] | null;
};

function rowToArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt,
    readMinutes: r.read_minutes,
    featured: r.featured,
    cover: r.cover,
    // Empty array in the DB means "no custom body" — let callers fall back to
    // the default body, matching the static content's optional `body`.
    body: r.body && r.body.length > 0 ? r.body : undefined,
  };
}

export async function listArticles(): Promise<Article[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as ArticleRow[]).map(rowToArticle);
  }
  return ARTICLES;
}

export async function getArticle(id: string): Promise<Article | undefined> {
  if (supabase) {
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToArticle(data as ArticleRow) : undefined;
  }
  return getArticleById(id);
}
