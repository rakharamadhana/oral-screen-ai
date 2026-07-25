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
  icon: LucideIcon;
}

/** Full sidebar navigation (desktop). */
export const SIDEBAR_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/pemeriksaan', label: 'Pemeriksaan Saya', icon: Stethoscope },
  { to: '/edukasi', label: 'Edukasi', icon: GraduationCap },
  { to: '/riwayat', label: 'Riwayat', icon: History },
  { to: '/profil', label: 'Profil', icon: User },
  { to: '/bantuan', label: 'Bantuan', icon: HelpCircle },
];

/** Bottom navigation (mobile): 5 tabs; the active tab renders as a filled pill. */
export const BOTTOM_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/pemeriksaan', label: 'Scan', icon: ScanLine },
  { to: '/edukasi', label: 'Edukasi', icon: GraduationCap },
  { to: '/riwayat', label: 'History', icon: History },
  { to: '/profil', label: 'Profile', icon: User },
];

/** Page title shown in the desktop top bar, keyed by route. */
export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Beranda',
  '/pemeriksaan': 'Pemeriksaan Baru',
  '/edukasi': 'Pusat Edukasi Kesehatan',
  '/riwayat': 'Riwayat Pemeriksaan',
  '/profil': 'Profil Pengguna',
  '/bantuan': 'Pusat Bantuan',
};
