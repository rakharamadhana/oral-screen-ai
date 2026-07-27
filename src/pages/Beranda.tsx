import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, BarChart3, TrendingUp, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ArticleCard } from '../components/ui/ArticleCard';
import { ArticleCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { RiskIcon } from '../components/ui/RiskBadge';
import { ARTICLES, SEED_PROFILE, UPCOMING_CHECKUP } from '../lib/mockData';
import { getProfile, listArticles, listScans } from '../lib/repository';
import { classifyRisk } from '../lib/risk';
import { useLang, type Lang } from '../lib/i18n';
import type { Article, Profile, ScanRecord } from '../lib/types';

function formatShortDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function Beranda() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [profile, setProfile] = useState<Profile>(SEED_PROFILE);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listScans().then(setScans).catch(() => setScans([])),
      getProfile().then(setProfile).catch(() => setProfile(SEED_PROFILE)),
      listArticles().then(setArticles).catch(() => setArticles(ARTICLES)),
    ]).finally(() => setLoading(false));
  }, []);

  const total = scans.length;
  const recent = scans.slice(0, 8);

  if (loading) return <BerandaSkeleton />;

  return (
    <div>
      {/* Greeting */}
      <section className="mb-lg">
        <h3 className="text-display-lg-mobile md:text-display-lg text-on-surface">
          {t('Halo', 'Hi')}, {profile.fullName}! <span className="hidden md:inline">👋</span>
        </h3>
        <p className="text-body-lg text-on-surface-variant">
          {t(
            'Pantau kesehatan mulut Anda secara rutin untuk pencegahan dini.',
            'Monitor your oral health regularly for early prevention.',
          )}
        </p>
      </section>

      {/* Mobile: single-column stack of carousels. Desktop (lg+): filled bento. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Hero CTA */}
        <div className="lg:col-span-8 bg-primary rounded-xl p-lg flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden relative group">
          <div className="z-10 text-on-primary">
            <h4 className="text-headline-md mb-xs font-semibold">
              {t('Mulai Pemeriksaan Baru', 'Start a New Scan')}
            </h4>
            <p className="text-body-md opacity-90 max-w-md mb-md">
              {t(
                'Lakukan pemindaian cepat dengan AI kami untuk mendeteksi potensi risiko kanker mulut dalam hitungan detik.',
                'Run a quick AI scan to detect potential oral cancer risk in seconds.',
              )}
            </p>
            <Button
              variant="secondary"
              className="!bg-surface !text-primary !font-bold !text-body-lg !px-lg !py-md shadow-lg hover:!shadow-xl hover:!-translate-y-0.5 transition-all"
              onClick={() => navigate('/pemeriksaan')}
            >
              <Camera size={20} />
              {t('Ambil Foto Sekarang', 'Take a Photo Now')}
              <ArrowRight size={18} />
            </Button>
          </div>
          <Camera
            size={160}
            className="hidden md:block absolute right-[-16px] top-[-16px] opacity-20 group-hover:scale-110 transition-transform duration-500 text-on-primary"
          />
        </div>

        {/* Health stats — mobile: full-bleed carousel; desktop: stacked beside hero */}
        <section className="lg:col-span-4 flex flex-col">
          <SectionHeader title={t('Statistik Kesehatan', 'Health Stats')} />
          <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs -mx-md px-md lg:mx-0 lg:px-0 lg:flex-col lg:flex-1 lg:overflow-visible">
            <div className="w-40 shrink-0 lg:w-auto">
              <StatBox
                icon={BarChart3}
                value={`${total}×`}
                label={t('Total Scan', 'Total Scans')}
                iconBg="bg-primary-container"
                iconColor="text-on-primary-container"
              />
            </div>
            <div className="w-40 shrink-0 lg:w-auto">
              <StatBox
                icon={TrendingUp}
                value={t('Sangat Baik', 'Excellent')}
                label={t('Konsistensi', 'Consistency')}
                iconBg="bg-tertiary-container"
                iconColor="text-on-tertiary-container"
              />
            </div>
            <div className="w-40 shrink-0 lg:w-auto">
              <StatBox
                icon={Calendar}
                value={recent[0] ? formatShortDate(recent[0].createdAt, lang) : '—'}
                label={t('Pemindaian Terakhir', 'Last Scan')}
                iconBg="bg-secondary-container"
                iconColor="text-on-secondary-container"
              />
            </div>
          </div>
        </section>

        {/* Recent results — full-bleed carousel, most recent highlighted */}
        <section className="lg:col-span-12">
          <SectionHeader
            title={t('Hasil Terakhir', 'Latest Results')}
            actionLabel={recent.length > 0 ? t('Lihat Semua', 'View All') : undefined}
            actionTo={recent.length > 0 ? '/riwayat' : undefined}
          />
          {recent.length > 0 ? (
            <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs -mx-md px-md md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
              {recent.map((s, i) => (
                // Mobile: horizontal scroll of all recent. Desktop: only the 4
                // most recent in a grid (no scroll).
                <div
                  key={s.id}
                  className={`w-44 shrink-0 md:w-auto ${i >= 4 ? 'md:hidden' : ''}`}
                >
                  <ResultCard scan={s} highlighted={i === 0} onClick={() => navigate('/riwayat')} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-md rounded-xl border border-outline-variant p-md">
              <CheckCircle2 size={22} className="text-tertiary shrink-0" />
              <p className="text-body-md text-on-surface-variant">
                {t(
                  'Mulai pemeriksaan pertama Anda untuk melihat hasil analisis kesehatan mulut di sini.',
                  'Start your first scan to see your oral health analysis here.',
                )}
              </p>
            </div>
          )}
        </section>

        {/* Upcoming checkup */}
        <Card className="lg:col-span-12 p-lg flex items-center gap-lg">
          <div className="w-20 h-20 bg-secondary-fixed text-on-secondary-fixed flex flex-col items-center justify-center rounded-xl shrink-0">
            <span className="text-xs font-bold uppercase">{UPCOMING_CHECKUP.monthLabel}</span>
            <span className="text-2xl font-extrabold">{UPCOMING_CHECKUP.day}</span>
          </div>
          <div className="flex-1">
            <h4 className="text-headline-md text-on-surface">{UPCOMING_CHECKUP.title}</h4>
            <p className="text-body-md text-on-surface-variant mb-base">{UPCOMING_CHECKUP.detail}</p>
            <div className="flex gap-sm flex-wrap">
              <Button variant="secondary" className="!py-base">
                {t('Atur Pengingat', 'Set Reminder')}
              </Button>
              <Button variant="outline" className="!py-base">
                {t('Reschedule', 'Reschedule')}
              </Button>
            </div>
          </div>
          <Calendar size={64} className="hidden sm:block text-outline-variant" />
        </Card>

        {/* Education */}
        <section className="lg:col-span-12">
          <SectionHeader
            title={t('Edukasi & Tips Kesehatan', 'Education & Health Tips')}
            actionLabel={t('Lihat Semua', 'View All')}
            actionTo="/edukasi"
          />
          {/* Horizontal carousel on mobile (cards peek), 3-up grid at md+. */}
          <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs -mx-md px-md md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
            {articles.slice(0, 3).map((a) => (
              <div key={a.id} className="w-[80%] max-w-xs shrink-0 md:w-auto md:max-w-none">
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/** A stat rectangle (icon + big value + label) for the Health Stats card. */
function StatBox({
  icon: Icon,
  value,
  label,
  iconBg,
  iconColor,
}: {
  icon: typeof BarChart3;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant p-md flex flex-col gap-sm">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-body-lg md:text-headline-md font-bold text-on-surface leading-tight">{value}</p>
        <p className="text-caption text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

/** A recent-scan mini card for the Latest Results carousel. */
function ResultCard({
  scan,
  highlighted,
  onClick,
}: {
  scan: ScanRecord;
  highlighted: boolean;
  onClick: () => void;
}) {
  const { t, lang } = useLang();
  const risk = classifyRisk(scan.topProbability, 0.1973);
  return (
    <button
      onClick={onClick}
      className={`w-full h-full text-left rounded-xl p-md border-2 transition-colors ${
        highlighted ? '' : 'border-outline-variant hover:border-primary/40'
      }`}
      style={highlighted ? { borderColor: risk.color, backgroundColor: `${risk.color}0f` } : {}}
    >
      <div className="flex items-center justify-between mb-sm h-6">
        <RiskIcon level={risk.level} size={22} />
        {highlighted && (
          <span
            className="text-[10px] font-bold uppercase px-sm py-xs rounded-full text-white"
            style={{ backgroundColor: risk.color }}
          >
            {t('Terbaru', 'Latest')}
          </span>
        )}
      </div>
      <p className="text-body-lg font-bold leading-tight" style={{ color: risk.color }}>
        {lang === 'en' ? risk.labelEn : risk.label}
      </p>
      <p className="text-caption text-on-surface-variant">{formatShortDate(scan.createdAt, lang)}</p>
    </button>
  );
}

function BerandaSkeleton() {
  return (
    <div>
      <section className="mb-lg space-y-sm">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Hero CTA */}
        <Skeleton className="lg:col-span-8 h-48 rounded-xl" />

        {/* Health stats carousel */}
        <div className="lg:col-span-4 space-y-md">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-md -mx-md px-md lg:mx-0 lg:px-0 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-40 h-24 shrink-0 lg:w-auto rounded-xl" />
            ))}
          </div>
        </div>

        {/* Recent results carousel */}
        <div className="lg:col-span-12 space-y-md">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-md -mx-md px-md md:mx-0 md:px-0 md:grid md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-44 h-32 shrink-0 md:w-auto rounded-xl" />
            ))}
          </div>
        </div>

        {/* Upcoming checkup */}
        <Card className="lg:col-span-12 p-lg flex items-center gap-lg">
          <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
          <div className="flex-1 space-y-sm">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-9 w-40" />
          </div>
        </Card>

        {/* Education */}
        <div className="lg:col-span-12 space-y-md">
          <Skeleton className="h-6 w-56" />
          <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs -mx-md px-md md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[80%] max-w-xs shrink-0 md:w-auto md:max-w-none">
                <ArticleCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
