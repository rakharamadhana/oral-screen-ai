-- Education articles moved from a hardcoded array (src/lib/mockData.ts) into the
-- DB. Covers stay as CSS gradient class strings (no image upload needed).

create table if not exists public.articles (
  id           text primary key,
  category     text not null,
  title        text not null,
  excerpt      text not null,
  read_minutes integer not null default 5,
  featured     boolean not null default false,
  cover        text not null,
  body         jsonb not null default '[]'::jsonb,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.articles enable row level security;

-- Articles are public content: anon read-only. No anon writes.
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
  for select using (true);

insert into public.articles (id, category, title, excerpt, read_minutes, featured, cover, body, sort_order) values
(
  'a1', 'Gejala', 'Mengenali Gejala Awal Kanker Mulut Sejak Dini',
  'Penting untuk mengetahui perubahan kecil di area mulut yang bisa menjadi indikasi awal masalah serius.',
  12, true, 'from-secondary-container to-primary',
  '["Kanker mulut sering kali berkembang tanpa gejala yang menonjol pada tahap awal. Justru karena itulah deteksi dini menjadi sangat penting: semakin cepat ditemukan, semakin besar peluang penanganan yang berhasil.","Beberapa tanda yang perlu diwaspadai antara lain luka atau sariawan yang tidak sembuh dalam dua minggu, bercak putih atau merah pada lidah, gusi, atau pipi bagian dalam, serta benjolan atau penebalan jaringan yang tidak biasa. Rasa nyeri saat menelan, mati rasa, atau perdarahan tanpa sebab yang jelas juga patut diperhatikan.","Faktor risiko seperti kebiasaan merokok, konsumsi alkohol berlebih, serta paparan sinar matahari berkepanjangan pada bibir dapat meningkatkan kemungkinan terjadinya kelainan. Riwayat keluarga dan infeksi HPV tertentu juga berperan.","Lakukan pemeriksaan mandiri secara rutin di depan cermin dengan pencahayaan yang baik, dan gunakan Oral Screen AI sebagai alat bantu triase untuk memantau perubahan dari waktu ke waktu. Bila menemukan tanda yang mencurigakan, segera konsultasikan ke dokter gigi atau spesialis. Ingat, hasil skrining bukanlah diagnosis."]'::jsonb,
  1
),
('a2', 'Pencegahan', 'Diet Sehat untuk Mulut Lebih Kuat', 'Bagaimana asupan nutrisi tertentu dapat melindungi jaringan mukosa dan memperkuat gusi.', 5, false, 'from-tertiary-container to-tertiary', '[]'::jsonb, 2),
('a3', 'Gejala', 'Sariawan Tak Kunjung Sembuh?', 'Bedakan sariawan biasa dengan lesi pra-kanker. Kenali tanda-tanda yang perlu diwaspadai.', 8, false, 'from-inverse-surface to-secondary', '[]'::jsonb, 3),
('a4', 'Perawatan', 'Panduan Kebersihan Mulut Harian', 'Langkah-langkah sederhana namun efektif untuk menjaga kesehatan rongga mulut setiap hari.', 4, false, 'from-secondary to-primary-container', '[]'::jsonb, 4),
('a5', 'Teknologi', 'Bagaimana AI Membantu Deteksi Dini', 'Peran kecerdasan buatan dalam skrining kanker oral dan bagaimana model kami dilatih.', 10, false, 'from-primary to-inverse-surface', '[]'::jsonb, 5),
('a6', 'Gaya Hidup', 'Berhenti Merokok untuk Kesehatan Mulut', 'Manfaat langsung yang Anda rasakan setelah 30 hari tanpa rokok bagi jaringan mulut.', 7, false, 'from-tertiary to-tertiary-container', '[]'::jsonb, 6)
on conflict (id) do nothing;
