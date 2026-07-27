// Built-in offline demo account.
//
// When this account is active, the app uses local seed data (the "Andi Setiawan"
// persona in mockData.ts) instead of Supabase — so it stays fully explorable with
// no backend, no network, and no real user account. Real accounts go through
// Supabase Auth and see only their own per-user data.

export const DEMO_EMAIL = 'user@example.com';
export const DEMO_PASSWORD = 'user123';

/** localStorage flag set while the demo account is "logged in". */
export const DEMO_KEY = 'osa:auth:v1';

/** True when the offline demo account is active (vs. a real Supabase session). */
export function isDemoActive(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}
