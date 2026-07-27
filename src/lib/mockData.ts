// Static demo content (articles, checkup, seed profile + seed history).
// Article covers use CSS gradients as placeholders so nothing depends on remote
// images (which COEP would block) — swap for real assets later.

import type { Article, Checkup, Profile, ScanRecord } from './types';

/** Turns a title into a URL-safe slug, e.g. "Gejala Awal?" -> "gejala-awal". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SEED_PROFILE: Profile = {
  // Must match the seeded profiles row uuid (supabase/migrations/0003) so
  // saveProfile() upserts target a valid uuid PK and actually persist.
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Andi Setiawan',
  email: 'andi.setiawan@email.com',
  medicalId: 'OD-92831',
  phone: '+62 812 3456 7890',
  birthDate: '15 Maret 1990',
  memberSince: 'Jan 2024',
  avatarUrl: null,
  verified: true,
  notifications: { exams: true, education: true, updates: false },
  riskFactors: [],
};

/**
 * Blank profile used as the initial/loading and error-fallback state for real
 * users, so a signed-in account never briefly renders the demo persona's name.
 */
export const EMPTY_PROFILE: Profile = {
  id: '',
  fullName: '',
  email: '',
  medicalId: '',
  phone: '',
  birthDate: '',
  memberSince: '',
  avatarUrl: null,
  verified: false,
  notifications: { exams: true, education: true, updates: false },
  riskFactors: [],
};

export const UPCOMING_CHECKUP: Checkup = {
  monthLabel: 'MEI',
  day: '24',
  title: 'Cek Rutin Mendatang',
  detail: 'Pukul 09:00 WIB • Klinik Gigi Sehat',
};

// Slugs are derived from the title (see slugify) so the fallback stays in sync
// with the DB's stored slugs without hand-maintaining them here.
const RAW_ARTICLES: Omit<Article, 'slug'>[] = [
  {
    id: 'a1',
    category: 'Gejala',
    title: 'Mengenali Gejala Awal Kanker Mulut Sejak Dini',
    excerpt:
      'Penting untuk mengetahui perubahan kecil di area mulut yang bisa menjadi indikasi awal masalah serius.',
    readMinutes: 12,
    featured: true,
    cover: 'from-secondary-container to-primary',
    body: [
      'Kanker mulut sering kali berkembang tanpa gejala yang menonjol pada tahap awal. Justru karena itulah deteksi dini menjadi sangat penting: semakin cepat ditemukan, semakin besar peluang penanganan yang berhasil.',
      'Beberapa tanda yang perlu diwaspadai antara lain luka atau sariawan yang tidak sembuh dalam dua minggu, bercak putih atau merah pada lidah, gusi, atau pipi bagian dalam, serta benjolan atau penebalan jaringan yang tidak biasa. Rasa nyeri saat menelan, mati rasa, atau perdarahan tanpa sebab yang jelas juga patut diperhatikan.',
      'Faktor risiko seperti kebiasaan merokok, konsumsi alkohol berlebih, serta paparan sinar matahari berkepanjangan pada bibir dapat meningkatkan kemungkinan terjadinya kelainan. Riwayat keluarga dan infeksi HPV tertentu juga berperan.',
      'Lakukan pemeriksaan mandiri secara rutin di depan cermin dengan pencahayaan yang baik, dan gunakan Oral Screen AI sebagai alat bantu triase untuk memantau perubahan dari waktu ke waktu. Bila menemukan tanda yang mencurigakan, segera konsultasikan ke dokter gigi atau spesialis. Ingat, hasil skrining bukanlah diagnosis.',
    ],
  },
  {
    id: 'a2',
    category: 'Pencegahan',
    title: 'Diet Sehat untuk Mulut Lebih Kuat',
    excerpt:
      'Bagaimana asupan nutrisi tertentu dapat melindungi jaringan mukosa dan memperkuat gusi.',
    readMinutes: 5,
    cover: 'from-tertiary-container to-tertiary',
  },
  {
    id: 'a3',
    category: 'Gejala',
    title: 'Sariawan Tak Kunjung Sembuh?',
    excerpt:
      'Bedakan sariawan biasa dengan lesi pra-kanker. Kenali tanda-tanda yang perlu diwaspadai.',
    readMinutes: 8,
    cover: 'from-inverse-surface to-secondary',
  },
  {
    id: 'a4',
    category: 'Perawatan',
    title: 'Panduan Kebersihan Mulut Harian',
    excerpt:
      'Langkah-langkah sederhana namun efektif untuk menjaga kesehatan rongga mulut setiap hari.',
    readMinutes: 4,
    cover: 'from-secondary to-primary-container',
  },
  {
    id: 'a5',
    category: 'Teknologi',
    title: 'Bagaimana AI Membantu Deteksi Dini',
    excerpt:
      'Peran kecerdasan buatan dalam skrining kanker oral dan bagaimana model kami dilatih.',
    readMinutes: 10,
    cover: 'from-primary to-inverse-surface',
  },
  {
    id: 'a6',
    category: 'Gaya Hidup',
    title: 'Berhenti Merokok untuk Kesehatan Mulut',
    excerpt:
      'Manfaat langsung yang Anda rasakan setelah 30 hari tanpa rokok bagi jaringan mulut.',
    readMinutes: 7,
    cover: 'from-tertiary to-tertiary-container',
  },
];

export const ARTICLES: Article[] = RAW_ARTICLES.map((a) => ({ ...a, slug: slugify(a.title) }));

/** Generic body used for articles that don't define their own. */
export const DEFAULT_ARTICLE_BODY: string[] = [
  'Menjaga kesehatan mulut adalah bagian penting dari kesehatan tubuh secara keseluruhan. Kebiasaan sederhana yang dilakukan secara konsisten dapat memberi dampak besar dalam jangka panjang.',
  'Artikel ini membahas langkah-langkah praktis yang dapat Anda terapkan sehari-hari, mulai dari perawatan dasar hingga pola hidup yang mendukung kesehatan rongga mulut.',
  'Selalu konsultasikan kondisi spesifik Anda dengan tenaga medis profesional. Informasi di sini bersifat edukatif dan bukan pengganti pemeriksaan langsung.',
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

// A little seed history so Riwayat looks populated on first run. Real scans from
// the scan flow are prepended to these via the repository.
export const SEED_HISTORY: ScanRecord[] = [
  {
    id: 'seed-1',
    refCode: '#OSA-9821-XP',
    createdAt: '2023-10-24T14:32:00',
    riskLevel: 'Rujukan',
    topProbability: 0.88,
    regionResults: [],
    thumbnail: null,
  },
  {
    id: 'seed-2',
    refCode: '#OSA-9755-LQ',
    createdAt: '2023-10-22T09:15:00',
    riskLevel: 'TidakRujukan',
    topProbability: 0.04,
    regionResults: [],
    thumbnail: null,
  },
  {
    id: 'seed-3',
    refCode: '#OSA-9610-ZA',
    createdAt: '2023-10-18T16:45:00',
    riskLevel: 'TidakRujukan',
    topProbability: 0.07,
    regionResults: [],
    thumbnail: null,
  },
  {
    id: 'seed-4',
    refCode: '#OSA-9544-ML',
    createdAt: '2023-09-28T09:15:00',
    riskLevel: 'Rujukan',
    topProbability: 0.42,
    regionResults: [],
    thumbnail: null,
  },
];
