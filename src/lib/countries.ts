// Country dial codes for the phone-number field. Indonesia first (primary
// audience), then alphabetical. Not exhaustive — a pragmatic common set.

export interface Country {
  iso: string; // ISO 3166-1 alpha-2, used only as a stable React key
  name: string;
  dial: string; // includes leading '+', e.g. "+62"
  flag: string; // emoji
}

export const DEFAULT_DIAL = '+62';

export const COUNTRIES: Country[] = [
  { iso: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { iso: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { iso: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { iso: 'BN', name: 'Brunei', dial: '+673', flag: '🇧🇳' },
  { iso: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { iso: 'KH', name: 'Cambodia', dial: '+855', flag: '🇰🇭' },
  { iso: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { iso: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { iso: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { iso: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { iso: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { iso: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { iso: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
  { iso: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { iso: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { iso: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦' },
  { iso: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { iso: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { iso: 'MM', name: 'Myanmar', dial: '+95', flag: '🇲🇲' },
  { iso: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { iso: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { iso: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { iso: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { iso: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { iso: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { iso: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { iso: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { iso: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { iso: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { iso: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { iso: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { iso: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { iso: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { iso: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { iso: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
  { iso: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { iso: 'TL', name: 'Timor-Leste', dial: '+670', flag: '🇹🇱' },
  { iso: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { iso: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { iso: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
];

/** Split a stored phone string into a dial code + local number. */
export function parsePhone(value: string | undefined | null): { dial: string; local: string } {
  const v = (value ?? '').trim();
  if (v.startsWith('+')) {
    const compact = v.replace(/\s+/g, '');
    // Longest dial code first so e.g. +670 wins over +6.
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => compact.startsWith(c.dial));
    if (match) {
      // Drop the leading '+' and the dial's digits, keeping the local part's spacing.
      const local = v.replace(/^\+/, '').slice(match.dial.length - 1).trim();
      return { dial: match.dial, local };
    }
  }
  return { dial: DEFAULT_DIAL, local: v };
}

/** Recombine a dial code + local number into the stored phone string ('' if no number). */
export function formatPhone(dial: string, local: string): string {
  const trimmed = local.trim();
  return trimmed ? `${dial} ${trimmed}` : '';
}
