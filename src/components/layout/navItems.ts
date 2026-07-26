import {
  Home,
  Stethoscope,
  GraduationCap,
  History,
  User,
  HelpCircle,
  ScanLine,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  labelEn: string;
  icon: LucideIcon;
}

/** Full sidebar navigation (desktop). */
export const SIDEBAR_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', labelEn: 'Home', icon: Home },
  { to: '/pemeriksaan', label: 'Pemeriksaan Saya', labelEn: 'My Scan', icon: Stethoscope },
  { to: '/edukasi', label: 'Edukasi', labelEn: 'Education', icon: GraduationCap },
  { to: '/riwayat', label: 'Riwayat', labelEn: 'History', icon: History },
  { to: '/profil', label: 'Profil', labelEn: 'Profile', icon: User },
  { to: '/bantuan', label: 'Bantuan', labelEn: 'Help', icon: HelpCircle },
];

/**
 * Bottom navigation (mobile): 5 tabs with Scan centered and enlarged (rendered
 * as a raised primary button) so the core action is the most prominent.
 */
export const BOTTOM_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', labelEn: 'Home', icon: Home },
  { to: '/edukasi', label: 'Edukasi', labelEn: 'Education', icon: GraduationCap },
  { to: '/pemeriksaan', label: 'Scan', labelEn: 'Scan', icon: ScanLine },
  { to: '/riwayat', label: 'Riwayat', labelEn: 'History', icon: History },
  { to: '/profil', label: 'Profil', labelEn: 'Profile', icon: User },
];

/** Page title shown in the top bar, keyed by route: [Indonesian, English]. */
export const ROUTE_TITLES: Record<string, [string, string]> = {
  '/': ['Beranda', 'Home'],
  '/pemeriksaan': ['Pemeriksaan Baru', 'New Scan'],
  '/edukasi': ['Pusat Edukasi Kesehatan', 'Health Education Center'],
  '/riwayat': ['Riwayat Pemeriksaan', 'Scan History'],
  '/profil': ['Profil Pengguna', 'User Profile'],
  '/bantuan': ['Pusat Bantuan', 'Help Center'],
};
