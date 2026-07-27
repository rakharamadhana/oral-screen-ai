import { useEffect, useMemo, useState } from 'react';
import { Search, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RiskBadge, RiskIcon } from '../components/ui/RiskBadge';
import { Chip } from '../components/ui/Chip';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { listScans } from '../lib/repository';
import { useLang } from '../lib/i18n';
import type { ScanRecord } from '../lib/types';
import { classifyRisk, type RiskLevel } from '../lib/risk';

const DECISION_THRESHOLD = 0.1973;

/** Referral verdict for a scan, always derived from its probability. */
const levelOf = (r: ScanRecord): RiskLevel => classifyRisk(r.topProbability, DECISION_THRESHOLD).level;

const FILTERS: Array<{ label: string; labelEn: string; match: (r: ScanRecord) => boolean }> = [
  { label: 'Semua', labelEn: 'All', match: () => true },
  { label: 'Tidak Perlu Rujukan', labelEn: 'No Referral', match: (r) => levelOf(r) === 'TidakRujukan' },
  { label: 'Perlu Rujukan', labelEn: 'Referral', match: (r) => levelOf(r) === 'Rujukan' },
];

function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  return { date, time };
}

const SHORT_NOTE: Record<RiskLevel, [string, string]> = {
  TidakRujukan: ['Kondisi mulut terlihat sehat.', 'Oral condition looks healthy.'],
  Rujukan: ['Disarankan konsultasi ke dokter atau spesialis.', 'Consult a dentist or specialist.'],
};

const RISK_TITLE: Record<RiskLevel, [string, string]> = {
  TidakRujukan: ['Tidak Perlu Rujukan', 'No Referral Needed'],
  Rujukan: ['Perlu Rujukan', 'Referral Recommended'],
};

export function Riwayat() {
  const { t } = useLang();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  useEffect(() => {
    listScans()
      .then(setScans)
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      scans
        .filter(FILTERS[filter].match)
        .filter((r) => r.refCode.toLowerCase().includes(query.toLowerCase())),
    [scans, filter, query],
  );

  const totals = useMemo(
    () => ({
      total: scans.length,
      low: scans.filter((s) => levelOf(s) === 'TidakRujukan').length,
      high: scans.filter((s) => levelOf(s) === 'Rujukan').length,
    }),
    [scans],
  );

  if (loading) return <RiwayatSkeleton />;

  return (
    <div className="space-y-md">
      <div className="md:hidden">
        <h3 className="text-display-lg-mobile font-bold text-on-surface">
          {t('Riwayat Pemeriksaan', 'Scan History')}
        </h3>
        <p className="text-body-md text-on-surface-variant">
          {t(
            'Pantau perkembangan kesehatan mulut Anda secara berkala.',
            'Track your oral health progress over time.',
          )}
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <SummaryTile icon={BarChart3} label="TOTAL SCANS" value={totals.total} color="#4648d4" />
        <SummaryTile icon={CheckCircle2} label="NO REFERRAL" value={totals.low} color="#006b2d" accent />
        <SummaryTile icon={AlertTriangle} label="NEEDS REFERRAL" value={totals.high} color="#ba1a1a" accent />
      </div>

      {/* Mobile filter chips */}
      <div className="flex gap-sm overflow-x-auto no-scrollbar md:hidden">
        {FILTERS.map((f, i) => (
          <Chip key={f.label} label={t(f.label, f.labelEn)} active={filter === i} onClick={() => setFilter(i)} />
        ))}
      </div>

      {/* Mobile card list */}
      <div className="space-y-sm md:hidden">
        {filtered.map((r) => (
          <MobileRow key={r.id} scan={r} onSelect={() => setSelected(r)} />
        ))}
        {filtered.length === 0 && <EmptyState />}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block p-lg">
        <div className="flex items-center justify-between mb-md">
          <h4 className="text-headline-md font-semibold text-on-surface">
            {t('Riwayat Pemeriksaan Terbaru', 'Recent Scans')}
          </h4>
          <div className="relative w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Cari ID Pemeriksaan...', 'Search Scan ID...')}
              className="w-full h-11 pl-11 pr-4 rounded-full border border-outline-variant text-body-md focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-label-md text-on-surface-variant uppercase text-left border-b border-outline-variant">
              <th className="py-sm font-semibold">{t('Tanggal & Waktu', 'Date & Time')}</th>
              <th className="py-sm font-semibold">{t('ID Pemeriksaan', 'Scan ID')}</th>
              <th className="py-sm font-semibold">{t('Status Risiko', 'Risk Status')}</th>
              <th className="py-sm font-semibold">{t('Sampel', 'Sample')}</th>
              <th className="py-sm font-semibold text-right">{t('Aksi', 'Action')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const { date, time } = formatDate(r.createdAt);
              return (
                <tr key={r.id} className="border-b border-outline-variant last:border-0">
                  <td className="py-md">
                    <p className="text-body-md font-bold text-on-surface">{date}</p>
                    <p className="text-caption text-on-surface-variant">{time}</p>
                  </td>
                  <td className="py-md">
                    <p className="text-body-md font-semibold text-secondary">{r.refCode}</p>
                    {r.patientName && (
                      <p className="text-caption text-on-surface-variant">
                        {r.patientName}
                        {r.patientMedicalId ? ` • ${r.patientMedicalId}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="py-md">
                    <RiskBadge level={levelOf(r)} variant="en" />
                  </td>
                  <td className="py-md">
                    <Thumb scan={r} />
                  </td>
                  <td className="py-md text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="text-label-md font-semibold text-primary hover:underline"
                    >
                      {t('Detail', 'Details')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState />}
        <p className="text-caption text-on-surface-variant mt-md">
          {t(
            `Menampilkan ${filtered.length} dari ${scans.length} pemeriksaan`,
            `Showing ${filtered.length} of ${scans.length} scans`,
          )}
        </p>
      </Card>

      {selected && <ScanDetailModal scan={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  color,
  accent,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number;
  color: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-lg flex items-center gap-md" accent={accent ? color : undefined}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}1a` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant uppercase">{label}</p>
        <p className="text-display-lg-mobile font-bold" style={{ color }}>
          {value}
        </p>
      </div>
    </Card>
  );
}

function Thumb({ scan }: { scan: ScanRecord }) {
  if (scan.thumbnail) {
    return <img src={scan.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />;
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
      <RiskIcon level={levelOf(scan)} size={18} />
    </div>
  );
}

function MobileRow({ scan, onSelect }: { scan: ScanRecord; onSelect: () => void }) {
  const { t } = useLang();
  const { date, time } = formatDate(scan.createdAt);
  const level = levelOf(scan);
  const color = level === 'Rujukan' ? '#ba1a1a' : '#006b2d';
  return (
    <Card className="p-md flex items-center gap-md cursor-pointer" onClick={onSelect}>
      <Thumb scan={scan} />
      <div className="flex-1">
        <p className="text-caption text-on-surface-variant">
          {date} • {time}
          {scan.patientName ? ` • ${scan.patientName}` : ''}
        </p>
        <p className="text-body-lg font-bold" style={{ color }}>
          {t(RISK_TITLE[level][0], RISK_TITLE[level][1])}
        </p>
        <p className="text-caption font-semibold text-on-surface-variant">
          {t(SHORT_NOTE[level][0], SHORT_NOTE[level][1])}
        </p>
      </div>
      <RiskIcon level={level} />
    </Card>
  );
}

function EmptyState() {
  const { t } = useLang();
  return (
    <div className="text-center py-lg text-on-surface-variant text-body-md">
      {t('Belum ada pemeriksaan yang cocok.', 'No matching scans yet.')}
    </div>
  );
}

function ScanDetailModal({ scan, onClose }: { scan: ScanRecord; onClose: () => void }) {
  const { t, lang } = useLang();
  const risk = classifyRisk(scan.topProbability, DECISION_THRESHOLD);
  const { date, time } = formatDate(scan.createdAt);

  return (
    <Modal open onClose={onClose} ariaLabel="Detail Pemeriksaan">
      <div className="flex items-center gap-md mb-md pr-lg">
        <RiskIcon level={risk.level} size={32} />
        <div>
          <p className="text-label-md uppercase font-bold" style={{ color: risk.color }}>
            {t('Detail Pemeriksaan', 'Scan Details')}
          </p>
          <h3 className="text-headline-md font-bold text-on-surface">
            {lang === 'en' ? risk.labelEn : risk.label}
          </h3>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-md mb-md">
        <div>
          <p className="text-caption text-on-surface-variant">{t('ID Pemeriksaan', 'Scan ID')}</p>
          <p className="text-body-md font-semibold text-secondary">{scan.refCode}</p>
        </div>
        <div>
          <p className="text-caption text-on-surface-variant">{t('Tanggal & Waktu', 'Date & Time')}</p>
          <p className="text-body-md text-on-surface">
            {date} • {time}
          </p>
        </div>
        {scan.patientName && (
          <div className="col-span-2">
            <p className="text-caption text-on-surface-variant">{t('Pasien', 'Patient')}</p>
            <p className="text-body-md text-on-surface">
              {scan.patientName}
              {scan.patientMedicalId ? ` • ${scan.patientMedicalId}` : ''}
            </p>
          </div>
        )}
      </div>

      {scan.thumbnail && (
        <img
          src={scan.thumbnail}
          alt="Sampel pemeriksaan"
          className="w-full max-h-56 object-contain rounded-lg border border-outline-variant bg-surface-container mb-md"
        />
      )}

      {/* What to do next */}
      <div
        className="rounded-xl p-md mb-md"
        style={{ backgroundColor: `${risk.color}14`, borderLeft: `4px solid ${risk.color}` }}
      >
        <p className="text-label-md uppercase font-bold mb-xs" style={{ color: risk.color }}>
          {t('Langkah Selanjutnya', 'Next Steps')}
        </p>
        <p className="text-body-md text-on-surface">{lang === 'en' ? risk.adviceEn : risk.advice}</p>
      </div>

      <p className="text-caption text-on-surface-variant">
        {t(
          'Oral Screen AI adalah alat bantu triase, bukan diagnosis. Konsultasikan hasil dengan tenaga medis profesional.',
          'Oral Screen AI is a triage aid, not a diagnosis. Consult a medical professional about your result.',
        )}
      </p>

      <div className="flex justify-end mt-md">
        <Button variant="outline" onClick={onClose}>
          {t('Tutup', 'Close')}
        </Button>
      </div>
    </Modal>
  );
}

function RiwayatSkeleton() {
  return (
    <div className="space-y-md">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-lg flex items-center gap-md">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-xs">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-10" />
            </div>
          </Card>
        ))}
      </div>

      {/* Row list */}
      <Card className="p-lg space-y-md">
        <Skeleton className="h-6 w-56" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-md py-sm border-b border-outline-variant last:border-0"
          >
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-xs">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}
