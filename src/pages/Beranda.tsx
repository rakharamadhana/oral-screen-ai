import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, BarChart3, TrendingUp, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ArticleCard } from '../components/ui/ArticleCard';
import { RiskIcon } from '../components/ui/RiskBadge';
import { ARTICLES, SEED_PROFILE, UPCOMING_CHECKUP } from '../lib/mockData';
import { getLatestScan, listScans } from '../lib/repository';
import { classifyRisk } from '../lib/risk';
import type { ScanRecord } from '../lib/types';

export function Beranda() {
  const navigate = useNavigate();
  const [latest, setLatest] = useState<ScanRecord | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getLatestScan().then(setLatest).catch(() => setLatest(null));
    listScans().then((s) => setTotal(s.length)).catch(() => setTotal(0));
  }, []);

  const latestCopy = latest ? classifyRisk(latest.topProbability, 0.1973) : null;

  return (
    <div>
      {/* Greeting */}
      <section className="mb-lg">
        <h3 className="text-display-lg-mobile md:text-display-lg text-on-surface">
          Halo, {SEED_PROFILE.fullName}! <span className="hidden md:inline">👋</span>
        </h3>
        <p className="text-body-lg text-on-surface-variant">
          Pantau kesehatan mulut Anda secara rutin untuk pencegahan dini.
        </p>
      </section>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-md">
        {/* Hero CTA */}
        <div className="col-span-12 lg:col-span-8 bg-primary rounded-xl p-lg flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden relative group">
          <div className="z-10 text-on-primary">
            <h4 className="text-headline-md mb-xs font-semibold">Mulai Pemeriksaan Baru</h4>
            <p className="text-body-md opacity-90 max-w-md mb-md">
              Lakukan pemindaian cepat dengan AI kami untuk mendeteksi potensi risiko kanker mulut
              dalam hitungan detik.
            </p>
            <Button
              variant="secondary"
              className="!bg-surface !text-primary hover:!shadow-lg"
              onClick={() => navigate('/pemeriksaan')}
            >
              <Camera size={18} />
              Ambil Foto Sekarang
            </Button>
          </div>
          <Camera
            size={160}
            className="hidden md:block absolute right-[-16px] top-[-16px] opacity-20 group-hover:scale-110 transition-transform duration-500 text-on-primary"
          />
        </div>

        {/* Health stats */}
        <Card className="col-span-12 lg:col-span-4 p-lg flex flex-col justify-between">
          <div>
            <h4 className="text-label-md text-on-surface-variant uppercase tracking-widest mb-md">
              Statistik Kesehatan
            </h4>
            <div className="space-y-md">
              <StatTile icon={BarChart3} label="Total Scan" value={`${total} Kali`} />
              <StatTile
                icon={TrendingUp}
                label="Konsistensi"
                value="Sangat Baik"
                iconBg="bg-tertiary-container"
                iconColor="text-on-tertiary-container"
              />
            </div>
          </div>
          <div className="mt-md pt-md border-t border-outline-variant">
            <p className="text-caption text-on-surface-variant">Update terakhir: 2 hari yang lalu</p>
          </div>
        </Card>

        {/* Last result */}
        <Card
          className="col-span-12 lg:col-span-5 p-lg"
          accent={latestCopy?.color ?? '#006b2d'}
        >
          <div className="flex items-start justify-between mb-md">
            <div>
              <h4
                className="text-label-md uppercase font-bold mb-xs"
                style={{ color: latestCopy?.color ?? '#006b2d' }}
              >
                Hasil Terakhir
              </h4>
              <p className="text-headline-md text-on-surface">
                {latestCopy?.label ?? 'Belum ada pemindaian'}
              </p>
            </div>
            {latestCopy ? (
              <RiskIcon level={latestCopy.level} />
            ) : (
              <CheckCircle2 size={20} className="text-tertiary" />
            )}
          </div>
          <p className="text-body-md text-on-surface-variant mb-lg">
            {latestCopy?.advice ??
              'Mulai pemeriksaan pertama Anda untuk melihat hasil analisis kesehatan mulut di sini.'}
          </p>
          <button
            onClick={() => navigate('/riwayat')}
            className="text-label-md font-semibold text-primary flex items-center gap-xs hover:underline"
          >
            Lihat Detail Riwayat <ArrowRight size={14} />
          </button>
        </Card>

        {/* Upcoming checkup */}
        <Card className="col-span-12 lg:col-span-7 p-lg flex items-center gap-lg">
          <div className="w-20 h-20 bg-secondary-fixed text-on-secondary-fixed flex flex-col items-center justify-center rounded-xl shrink-0">
            <span className="text-xs font-bold uppercase">{UPCOMING_CHECKUP.monthLabel}</span>
            <span className="text-2xl font-extrabold">{UPCOMING_CHECKUP.day}</span>
          </div>
          <div className="flex-1">
            <h4 className="text-headline-md text-on-surface">{UPCOMING_CHECKUP.title}</h4>
            <p className="text-body-md text-on-surface-variant mb-base">{UPCOMING_CHECKUP.detail}</p>
            <div className="flex gap-sm flex-wrap">
              <Button variant="secondary" className="!py-base">
                Atur Pengingat
              </Button>
              <Button variant="outline" className="!py-base">
                Reschedule
              </Button>
            </div>
          </div>
          <Calendar size={64} className="hidden sm:block text-outline-variant" />
        </Card>

        {/* Education */}
        <div className="col-span-12 mt-lg">
          <SectionHeader title="Edukasi & Tips Kesehatan" actionLabel="Lihat Semua" actionTo="/edukasi" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {ARTICLES.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
