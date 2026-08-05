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
import { isDemoActive } from './demo';
import { SEED_HISTORY, SEED_PROFILE, EMPTY_PROFILE, ARTICLES, getArticleBySlug } from './mockData';
import type { Article, Profile, ScanRecord } from './types';
import type { User } from '@supabase/supabase-js';

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

// ---------- data source ----------

// Use Supabase (per-user) when it's configured AND we're not in the offline demo
// account. The demo account and the no-backend fallback both read local seed data.
function useRemote(): boolean {
  return !!supabase && !isDemoActive();
}

/** The signed-in Supabase user, or null (demo/offline). Uses the cached session. */
async function currentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
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
  if (useRemote()) {
    const user = await currentUser();
    if (user) {
      const { data, error } = await supabase!
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as ScanRow[]).map(rowToScan);
    }
  }
  // Demo/offline: user scans first (already newest-first), then seed history.
  const local = readLocal<ScanRecord[]>(SCANS_KEY, []);
  return [...local, ...SEED_HISTORY];
}

export async function addScan(scan: ScanRecord): Promise<void> {
  // Thumbnail always stays on-device, regardless of backend.
  saveThumb(scan.id, scan.thumbnail);

  if (useRemote()) {
    const user = await currentUser();
    if (user) {
      // Send the client-generated uuid so the row id matches the local thumbnail
      // key (and so patient identity travels with the scan). No image data.
      const { error } = await supabase!.from('scans').insert({
        id: scan.id,
        user_id: user.id,
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
  }
  const local = readLocal<ScanRecord[]>(SCANS_KEY, []);
  writeLocal(SCANS_KEY, [scan, ...local]);
}

export async function getLatestScan(): Promise<ScanRecord | null> {
  const scans = await listScans();
  return scans[0] ?? null;
}

// ---------- profile ----------

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  medical_id: string | null;
  phone: string | null;
  birth_date: string | null;
  member_since: string | null;
  avatar_url: string | null;
  verified: boolean;
  notifications: Profile['notifications'] | null;
  risk_factors: string[] | null;
};

function rowToProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email ?? '',
    medicalId: r.medical_id ?? '',
    phone: r.phone ?? '',
    birthDate: r.birth_date ?? '',
    memberSince: r.member_since ?? '',
    avatarUrl: r.avatar_url,
    verified: r.verified,
    notifications: r.notifications ?? SEED_PROFILE.notifications,
    riskFactors: r.risk_factors ?? [],
  };
}

/** Minimal profile derived from the auth user, if their row isn't ready yet. */
function profileFromAuthUser(user: User): Profile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.display_name === 'string' && meta.display_name) ||
    (typeof meta.full_name === 'string' && meta.full_name) ||
    user.email?.split('@')[0] ||
    '';
  return { ...EMPTY_PROFILE, id: user.id, fullName: name, email: user.email ?? '' };
}

export async function getProfile(): Promise<Profile> {
  if (useRemote()) {
    const user = await currentUser();
    if (user) {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      // Row is auto-created by a signup trigger; fall back to auth metadata if it
      // hasn't propagated yet (never to the demo "Andi" persona).
      return data ? rowToProfile(data as ProfileRow) : profileFromAuthUser(user);
    }
  }
  return readLocal<Profile>(PROFILE_KEY, SEED_PROFILE);
}

export async function saveProfile(profile: Profile): Promise<void> {
  if (useRemote()) {
    const user = await currentUser();
    if (user) {
      const { error } = await supabase!.from('profiles').upsert({
        id: user.id, // always the caller's own row (RLS enforces this too)
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
  }
  writeLocal(PROFILE_KEY, profile);
}

// ---------- articles ----------

type ArticleRow = {
  id: string;
  slug: string;
  category: Article['category'];
  title: string;
  excerpt: string;
  read_minutes: number;
  featured: boolean;
  cover: string;
  body: string[] | null;
  sources: string[] | null;
  images: Article['images'] | null;
};

function rowToArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt,
    readMinutes: r.read_minutes,
    featured: r.featured,
    cover: r.cover,
    // Empty array in the DB means "no custom body" — let callers fall back to
    // the default body, matching the static content's optional `body`.
    body: r.body && r.body.length > 0 ? r.body : undefined,
    sources: r.sources && r.sources.length > 0 ? r.sources : undefined,
    images: r.images && r.images.length > 0 ? r.images : undefined,
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

export async function getArticle(slug: string): Promise<Article | undefined> {
  if (supabase) {
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? rowToArticle(data as ArticleRow) : undefined;
  }
  return getArticleBySlug(slug);
}
