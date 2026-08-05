import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, BookOpen, ExternalLink, ZoomIn } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArticleCard } from '../components/ui/ArticleCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ImageZoomModal } from '../components/ui/ImageZoomModal';
import { getArticle, listArticles } from '../lib/repository';
import { DEFAULT_ARTICLE_BODY } from '../lib/mockData';
import type { Article } from '../lib/types';

/** Formats a raw citation string with APA 7 standards and turns URLs into clickable links. */
function renderApaCitation(text: string) {
  // Strip leading bullet characters like '• ', ' ', '- '
  const cleaned = text.replace(/^[\s•\-]+\s*/, '').trim();

  // URL matching regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = cleaned.split(urlRegex);

  return (
    <span className="text-body-sm text-on-surface-variant leading-relaxed">
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-0.5 break-all mx-1"
            >
              {part}
              <ExternalLink size={12} className="inline flex-shrink-0" />
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

/** Formats body paragraphs, gracefully supporting bullet items, numbered lists, and headers. */
function renderBodyParagraph(para: string, index: number) {
  const trimmed = para.trim();

  // Numbered items e.g. "1. Penggunaan Tembakau: ..."
  if (/^\d+\.\s/.test(trimmed)) {
    const match = trimmed.match(/^(\d+)\.\s*(.*)/);
    if (match) {
      return (
        <div key={index} className="flex items-start gap-md bg-surface-container-low/60 p-md rounded-xl border border-outline-variant/20 my-xs">
          <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-caption font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {match[1]}
          </span>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">{match[2]}</p>
        </div>
      );
    }
  }

  // Bullet items e.g. "• Leukoplakia: ..." or "- item"
  if (/^[•\-]\s/.test(trimmed)) {
    const content = trimmed.replace(/^[•\-]\s*/, '');
    return (
      <div key={index} className="flex items-start gap-sm pl-sm text-body-lg text-on-surface-variant leading-relaxed">
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2.5" />
        <p className="text-body-lg text-on-surface-variant leading-relaxed">{content}</p>
      </div>
    );
  }

  return (
    <p key={index} className="text-body-lg text-on-surface-variant leading-relaxed">
      {para}
    </p>
  );
}

export function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | undefined>();
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption?: string } | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([getArticle(slug), listArticles()])
      .then(([found, all]) => {
        if (cancelled) return;
        setArticle(found);
        setRelated(
          found
            ? all.filter((a) => a.id !== found.id && a.category === found.category).slice(0, 3)
            : [],
        );
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(undefined);
          setRelated([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-md">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24 rounded" />
        <Skeleton className="h-10 w-11/12" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-56 md:h-72 rounded-xl" />
        <div className="space-y-sm pt-sm">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-11/12" />
        </div>
      </div>
    );
  }

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

  const isImageCover = article.cover.startsWith('/') || article.cover.startsWith('http');

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

        {isImageCover ? (
          <div
            onClick={() => setZoomedImage({ url: article.cover, caption: article.title })}
            className="group relative rounded-xl overflow-hidden mb-lg shadow-sm border border-outline-variant/30 bg-surface-container-high max-h-[420px] flex items-center justify-center cursor-zoom-in"
          >
            <img src={article.cover} alt={article.title} className="w-full h-full object-cover max-h-[420px] group-hover:scale-102 transition-transform duration-300" />
            <div className="absolute bottom-sm right-sm bg-black/60 backdrop-blur-md text-white text-xs px-sm py-xs rounded-full flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={14} /> Klik untuk perbesar
            </div>
          </div>
        ) : (
          <div className={`h-56 md:h-72 rounded-xl bg-gradient-to-br ${article.cover} mb-lg`} />
        )}

        <div className="space-y-md">
          <p className="text-body-lg text-on-surface font-medium">{article.excerpt}</p>
          {body.map((para, i) => renderBodyParagraph(para, i))}
        </div>

        {article.images && article.images.length > 0 && (
          <div className="my-lg space-y-md">
            {article.images.map((img, i) => (
              <figure
                key={i}
                onClick={() => setZoomedImage({ url: img.url, caption: img.caption || article.title })}
                className="group relative rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest p-sm cursor-zoom-in hover:border-primary/40 transition-all"
              >
                <div className="relative">
                  <img src={img.url} alt={img.caption || article.title} className="w-full h-auto max-h-[450px] object-contain rounded-lg mx-auto group-hover:scale-101 transition-transform" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-sm py-xs rounded-full flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={14} /> Perbesar
                  </div>
                </div>
                {img.caption && (
                  <figcaption className="text-caption text-center text-on-surface-variant mt-xs italic">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {article.sources && article.sources.length > 0 && (
          <div className="mt-xl pt-lg border-t border-outline-variant/30">
            <h3 className="text-title-md font-bold text-on-surface flex items-center gap-xs mb-md">
              <BookOpen size={18} className="text-primary" /> Referensi
            </h3>
            <div className="space-y-sm">
              {article.sources.map((src, i) => (
                <div
                  key={i}
                  className="p-md rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 transition-all flex items-start gap-md"
                >
                  <span className="text-caption font-semibold text-primary/70 bg-primary-fixed/40 px-xs py-0.5 rounded text-xs mt-0.5 flex-shrink-0">
                    [{i + 1}]
                  </span>
                  <div className="flex-1">{renderApaCitation(src)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* Lightbox Image Zoom Modal with Mouse Wheel Scroll & Mobile Touch Pinch-to-Zoom */}
      {zoomedImage && (
        <ImageZoomModal
          url={zoomedImage.url}
          caption={zoomedImage.caption}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  );
}
