import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { ArticleCard } from '../components/ui/ArticleCard';
import { ArticleCardSkeleton, FeaturedArticleSkeleton } from '../components/ui/Skeleton';
import { listArticles } from '../lib/repository';
import { ARTICLES } from '../lib/mockData';
import type { Article } from '../lib/types';

const CATEGORIES = ['Semua', 'Gejala', 'Pencegahan', 'Perawatan', 'Gaya Hidup'] as const;

export function Edukasi() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Semua');
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listArticles()
      .then(setArticles)
      .catch(() => setArticles(ARTICLES))
      .finally(() => setLoading(false));
  }, []);

  const featured = articles.find((a) => a.featured);
  const rest = useMemo(
    () =>
      articles
        .filter((a) => !a.featured)
        .filter(
          (a) =>
            (category === 'Semua' || a.category === category) &&
            a.title.toLowerCase().includes(query.toLowerCase()),
        ),
    [articles, category, query],
  );

  return (
    <div className="space-y-md">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-md">
        <div>
          <h3 className="text-display-lg-mobile md:text-display-lg text-on-surface">Pusat Edukasi Kesehatan</h3>
          <p className="text-body-lg text-on-surface-variant max-w-xl">
            Panduan terpercaya untuk kesehatan mulut dan deteksi dini kanker oral dari para ahli medis.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel kesehatan..."
            className="w-full h-11 pl-11 pr-4 rounded-full border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-sm overflow-x-auto no-scrollbar pb-xs">
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      {/* Featured */}
      {loading && <FeaturedArticleSkeleton />}
      {!loading && featured && (category === 'Semua' || featured.category === category) && (
        <Link to={`/edukasi/${featured.slug}`} className="block group">
          <Card className="overflow-hidden grid grid-cols-1 md:grid-cols-2 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`h-56 md:h-auto bg-gradient-to-br ${featured.cover}`} />
            <div className="p-lg flex flex-col justify-center">
              <span className="self-start bg-tertiary text-on-tertiary text-[10px] px-sm py-xs rounded font-bold uppercase mb-sm">
                Utama
              </span>
              <h4 className="text-headline-md md:text-display-lg-mobile font-bold text-on-surface mb-sm">
                {featured.title}
              </h4>
              <p className="text-body-md text-on-surface-variant mb-md">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-caption text-on-surface-variant flex items-center gap-xs">
                  <Clock size={14} /> {featured.readMinutes} mnt baca
                </span>
                <span className="text-label-md font-semibold text-primary flex items-center gap-xs group-hover:underline">
                  Baca Selengkapnya <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Grid + newsletter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)
          : rest.map((a) => <ArticleCard key={a.id} article={a} />)}
        <div className="bg-primary rounded-xl p-lg flex flex-col items-center text-center text-on-primary justify-center">
          <Mail size={40} className="mb-sm" />
          <h4 className="text-headline-md font-semibold mb-xs">Dapatkan Update Mingguan</h4>
          <p className="text-body-md opacity-90 mb-md">
            Terima artikel kesehatan pilihan langsung di email Anda setiap minggu.
          </p>
          <input
            placeholder="Email Anda"
            className="w-full px-md py-sm rounded-lg text-on-surface mb-sm bg-surface focus:outline-none"
          />
          <Button variant="secondary" fullWidth className="!bg-primary-container">
            Langganan Gratis
          </Button>
        </div>
      </div>

      {/* Consult CTA */}
      <Card className="bg-surface-container-low border-none p-lg flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h4 className="text-headline-md md:text-display-lg-mobile font-bold text-on-surface mb-xs">
            Ingin konsultasi lebih lanjut?
          </h4>
          <p className="text-body-md text-on-surface-variant max-w-lg">
            Hubungi tim medis kami atau jadwalkan pemeriksaan rutin untuk memastikan kesehatan mulut
            Anda tetap prima.
          </p>
        </div>
        <div className="flex gap-sm">
          <Button>Buat Janji Temu</Button>
          <Button variant="outline">Tanya Dokter</Button>
        </div>
      </Card>

      <p className="text-caption text-on-surface-variant text-center pt-sm">
        © 2026 Oral Screen AI. Informasi medis hanya untuk tujuan edukasi dan bukan pengganti saran
        dokter profesional.
      </p>
    </div>
  );
}
