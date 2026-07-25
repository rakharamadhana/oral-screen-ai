// Detects the host OS so route transitions can mimic native navigation:
// iOS uses a horizontal push; Android (Material) uses a fade-through/upward.
// Computed once at module load.

export type Platform = 'ios' | 'android' | 'default';

function detect(): Platform {
  if (typeof navigator === 'undefined') return 'default';
  const ua = navigator.userAgent || '';
  const isIOS =
    /iP(hone|ad|od)/.test(ua) ||
    // iPadOS 13+ reports as Mac; disambiguate via touch points.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'default';
}

export const PLATFORM: Platform = detect();
