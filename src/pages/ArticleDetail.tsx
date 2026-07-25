import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArticleCard } from '../components/ui/ArticleCard';
import { ARTICLES, getArticleById, DEFAULT_ARTICLE_BODY } from '../lib/mockData';

export function ArticleDetail() {
  const { id } = useParams();
  const article = id ? getArticleById(id) : undefined;

  if (!article) {
    return (
      <div className="py-xl text-center">
        <p className="text-body-lg text-on-surface-variant mb-md">Artikel tidak ditemukan.</p>
        <Link to="/edukasi">
          <Button variant="outline">
            <ArrowLeft size={18} /> Kembali ke Edukasi
          </Button>
        </Link>
      </div>
    );
  }

  const body = article.body ?? DEFAULT_ARTICLE_BODY;
  const related = ARTICLES.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/edukasi"
        className="inline-flex items-center gap-xs text-label-md font-semibold text-primary hover:underline mb-md"
      >
        <ArrowLeft size={16} /> Kembali ke Edukasi
      </Link>

      <article>
        <span className="inline-block bg-primary-fixed text-on-primary-fixed-variant text-[10px] px-sm py-xs rounded font-bold uppercase mb-sm">
          {article.category}
        </span>
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface mb-sm">{article.title}</h1>
        <div className="flex items-center gap-md text-caption text-on-surface-variant mb-md">
          <span className="flex items-center gap-xs">
            <Clock size={14} /> {article.readMinutes} mnt baca
          </span>
          <button className="flex items-center gap-xs hover:text-primary">
            <Share2 size={14} /> Bagikan
          </button>
        </div>

        <div className={`h-56 md:h-72 rounded-xl bg-gradient-to-br ${article.cover} mb-lg`} />

        <div className="space-y-md">
          <p className="text-body-lg text-on-surface font-medium">{article.excerpt}</p>
          {body.map((para, i) => (
            <p key={i} className="text-body-lg text-on-surface-variant leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </article>

      <Card className="bg-surface-container-low border-none p-lg mt-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h4 className="text-headline-md font-bold text-on-surface mb-xs">Pantau kesehatan mulut Anda</h4>
          <p className="text-body-md text-on-surface-variant">
            Lakukan skrining cepat dengan AI untuk deteksi dini.
          </p>
        </div>
        <Link to="/pemeriksaan">
          <Button>Mulai Pemeriksaan</Button>
        </Link>
      </Card>

      {related.length > 0 && (
        <div className="mt-lg">
          <h4 className="text-headline-md font-semibold text-on-surface mb-md">Artikel Terkait</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
