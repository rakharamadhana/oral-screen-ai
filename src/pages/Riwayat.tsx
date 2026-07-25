import { useEffect, useMemo, useState } from 'react';
import { Search, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { RiskBadge, RiskIcon } from '../components/ui/RiskBadge';
import { Chip } from '../components/ui/Chip';
import { listScans } from '../lib/repository';
import type { ScanRecord } from '../lib/types';
import type { RiskLevel } from '../lib/risk';

const FILTERS: Array<{ label: string; match: (r: ScanRecord) => boolean }> = [
  { label: 'Semua', match: () => true },
  { label: 'Risiko Rendah', match: (r) => r.riskLevel === 'Rendah' },
  { label: 'Perlu Konsultasi', match: (r) => r.riskLevel !== 'Rendah' },
];

function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  return { date, time };
}

const SHORT_NOTE: Record<RiskLevel, string> = {
  Rendah: 'Kondisi mulut terlihat sehat.',
  Sedang: 'Jadwalkan pemeriksaan ulang dalam 14 hari.',
  Tinggi: 'Segera konsultasi ke dokter spesialis.',
};

export function Riwayat() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    listScans().then(setScans).catch(() => setScans([]));
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
      low: scans.filter((s) => s.riskLevel === 'Rendah').length,
      high: scans.filter((s) => s.riskLevel === 'Tinggi').length,
    }),
    [scans],
  );

  return (
    <div className="space-y-md">
      <div className="md:hidden">
        <h3 className="text-display-lg-mobile font-bold text-on-surface">Riwayat Pemeriksaan</h3>
        <p className="text-body-md text-on-surface-variant">
          Pantau perkembangan kesehatan mulut Anda secara berkala.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <SummaryTile icon={BarChart3} label="TOTAL SCANS" value={totals.total} color="#4648d4" />
        <SummaryTile icon={CheckCircle2} label="LOW RISK CASES" value={totals.low} color="#006b2d" accent />
        <SummaryTile icon={AlertTriangle} label="HIGH RISK CASES" value={totals.high} color="#ba1a1a" accent />
      </div>

      {/* Mobile filter chips */}
      <div className="flex gap-sm overflow-x-auto no-scrollbar md:hidden">
        {FILTERS.map((f, i) => (
          <Chip key={f.label} label={f.label} active={filter === i} onClick={() => setFilter(i)} />
        ))}
      </div>

      {/* Mobile card list */}
      <div className="space-y-sm md:hidden">
        {filtered.map((r) => (
          <MobileRow key={r.id} scan={r} />
        ))}
        {filtered.length === 0 && <EmptyState />}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block p-lg">
        <div className="flex items-center justify-between mb-md">
          <h4 className="text-headline-md font-semibold text-on-surface">Riwayat Pemeriksaan Terbaru</h4>
          <div className="relative w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ID Pemeriksaan..."
              className="w-full h-11 pl-11 pr-4 rounded-full border border-outline-variant text-body-md focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-label-md text-on-surface-variant uppercase text-left border-b border-outline-variant">
              <th className="py-sm font-semibold">Tanggal & Waktu</th>
              <th className="py-sm font-semibold">ID Pemeriksaan</th>
              <th className="py-sm font-semibold">Status Risiko</th>
              <th className="py-sm font-semibold">Sampel</th>
              <th className="py-sm font-semibold text-right">Aksi</th>
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
                  <td className="py-md text-body-md font-semibold text-secondary">{r.refCode}</td>
                  <td className="py-md">
                    <RiskBadge level={r.riskLevel} variant="en" />
                  </td>
                  <td className="py-md">
                    <Thumb scan={r} />
                  </td>
                  <td className="py-md text-right">
                    <button className="text-label-md font-semibold text-primary hover:underline">Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState />}
        <p className="text-caption text-on-surface-variant mt-md">
          Menampilkan {filtered.length} dari {scans.length} pemeriksaan
        </p>
      </Card>
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
      <RiskIcon level={scan.riskLevel} size={18} />
    </div>
  );
}

function MobileRow({ scan }: { scan: ScanRecord }) {
  const { date, time } = formatDate(scan.createdAt);
  const color = scan.riskLevel === 'Rendah' ? '#006b2d' : scan.riskLevel === 'Sedang' ? '#b45309' : '#ba1a1a';
  return (
    <Card className="p-md flex items-center gap-md">
      <Thumb scan={scan} />
      <div className="flex-1">
        <p className="text-caption text-on-surface-variant">
          {date} • {time}
        </p>
        <p className="text-body-lg font-bold text-on-surface">
          {scan.riskLevel === 'Rendah'
            ? 'Risiko Rendah'
            : scan.riskLevel === 'Sedang'
              ? 'Perlu Observasi'
              : 'Indikasi Risiko Tinggi'}
        </p>
        <p className="text-caption font-semibold" style={{ color }}>
          {SHORT_NOTE[scan.riskLevel]}
        </p>
      </div>
      <RiskIcon level={scan.riskLevel} />
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-lg text-on-surface-variant text-body-md">
      Belum ada pemeriksaan yang cocok.
    </div>
  );
}
