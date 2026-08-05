import { Link } from 'react-router-dom';
import type { Article } from '../../lib/types';

const CATEGORY_CHIP: Record<Article['category'], string> = {
  Gejala: 'bg-error-container text-on-error-container',
  Pencegahan: 'bg-primary-fixed text-on-primary-fixed-variant',
  Perawatan: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  'Gaya Hidup': 'bg-secondary-fixed text-on-secondary-fixed-variant',
  Teknologi: 'bg-secondary-fixed text-on-secondary-fixed-variant',
};

export function ArticleCard({ article }: { article: Article }) {
  const isImageCover = article.cover.startsWith('/') || article.cover.startsWith('http');

  return (
    <Link
      to={`/edukasi/${article.slug}`}
      className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
    >
      <div className={`h-40 ${isImageCover ? 'bg-surface-container-high' : `bg-gradient-to-br ${article.cover}`} relative overflow-hidden`}>
        {isImageCover && (
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <span
          className={`absolute top-sm left-sm text-[10px] px-sm py-xs rounded font-bold uppercase ${
            CATEGORY_CHIP[article.category]
          }`}
        >
          {article.category}
        </span>
      </div>
      <div className="p-md flex flex-col flex-1">
        <h5 className="text-body-lg font-semibold text-on-surface mb-xs">{article.title}</h5>
        <p className="text-body-md text-on-surface-variant line-clamp-2 mb-md">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-caption text-on-surface-variant">{article.readMinutes} mnt baca</span>
          <span className="text-label-md font-semibold text-primary group-hover:underline">
            Baca Artikel
          </span>
        </div>
      </div>
    </Link>
  );
}
