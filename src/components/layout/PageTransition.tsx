import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PLATFORM } from '../../lib/platform';

/**
 * Plays an enter animation on every route change, keyed by pathname so the
 * subtree remounts. The animation style follows the host OS (see index.css):
 * iOS = horizontal push, Android = Material fade-through, desktop = plain fade.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={`page-enter page-enter-${PLATFORM}`}>
      {children}
    </div>
  );
}
