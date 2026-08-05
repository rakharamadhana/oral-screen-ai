// Supabase client. Created only when both env vars are present; otherwise this
// is null and repository.ts transparently falls back to localStorage so the app
// still runs (and deploys) before Supabase is provisioned.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = supabase !== null;

/**
 * Resolves an asset path (e.g. "/assets/samples/ok-01.jpeg" or "/articles/image1.jpeg").
 * Uses Supabase Storage public URL when Supabase is configured; otherwise falls back to local path.
 */
export function getAssetUrl(relativePath: string): string {
  const cleanPath = relativePath.replace(/^\/+/, '');
  if (isSupabaseConfigured && url) {
    // Bucket layout: "assets/samples/..." -> "samples/...", "articles/..." -> "articles/..."
    const storagePath = cleanPath.startsWith('assets/')
      ? cleanPath.replace(/^assets\//, '')
      : cleanPath;
    return `${url}/storage/v1/object/public/app-assets/${storagePath}`;
  }
  return `/${cleanPath}`;
}

