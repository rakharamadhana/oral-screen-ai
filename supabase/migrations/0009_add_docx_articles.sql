-- Migration 0009: Add/update educational articles and sources from public/konten oral screen ai.docx

alter table public.articles add column if not exists sources jsonb default '[]'::jsonb;

delete from public.articles where slug in (
  'mengenali-gejala-awal-kanker-mulut-sejak-dini',
  'diet-sehat-untuk-mulut-lebih-kuat',
  'sariawan-tak-kunjung-sembuh',
  'panduan-kebersihan-mulut-harian',
  'bagaimana-ai-membantu-deteksi-dini',
  'berhenti-merokok-untuk-kesehatan-mulut'
);

insert into public.articles (slug, category, title, excerpt, read_minutes, featured, cover, body, sources, sort_order) values
(
  'apa-itu-kanker-mulut-dan-mengapa-deteksi-dini-sangat-penting',
  'Gejala',
  'Apa itu Kanker Mulut & Mengapa Deteksi Dini Sangat Penting?',
  'Kanker mulut adalah keganasan pada jaringan rongga mulut. Ketahui gambaran umum, data insiden, dan alasan mengapa deteksi dini sangat menentukan keberhasilan terapi.',
  6,
  true,
  'from-secondary-container to-primary',
  '["Kanker mulut adalah keganasan yang berkembang pada jaringan rongga mulut, termasuk bibir, lidah, dasar mulut, mukosa pipi, gusi, langit-langit mulut, dan daerah retromolar. Sekitar 90% kasus merupakan Oral Squamous Cell Carcinoma (OSCC).","Sebagian besar kanker mulut berkembang dari Oral Potentially Malignant Disorders (OPMDs), yaitu kelainan yang memiliki risiko mengalami transformasi menjadi kanker apabila tidak terdeteksi dan ditangani secara dini.","Data yang dikumpulkan oleh Global Cancer Observatory (GCO) menunjukkan 389.846 kasus baru secara global pada tahun 2022 untuk kanker bibir atau rongga mulut, dengan 188.438 kematian. Penyakit ini jauh lebih umum terjadi pada pria, dengan angka kejadian (268.999) dan angka kematian (130.808) lebih dari dua kali lipat dibandingkan wanita.","Mengapa Deteksi Dini Sangat Penting? Deteksi dini memungkinkan kanker ditemukan pada stadium awal sehingga peluang keberhasilan terapi menjadi jauh lebih tinggi dibandingkan stadium lanjut.","Manfaat deteksi dini meliputi: (1) Meningkatkan angka kelangsungan hidup pasien; (2) Memungkinkan terapi yang lebih sederhana dan kurang invasif; (3) Mengurangi angka kecacatan pascaoperasi; (4) Meningkatkan kualitas hidup pasien; dan (5) Menurunkan biaya pengobatan.","Systematic review menunjukkan bahwa program skrining pada kelompok berisiko tinggi dapat menurunkan mortalitas akibat kanker mulut sekitar 26% dan mengurangi proporsi kasus stadium lanjut sekitar 19%."]'::jsonb,
  '["Niekra, P., & Adamska, P. (2026). The Role of Liquid Biopsy in the Diagnosis of Oral Squamous Cell Carcinoma: A Systematic Review. International Journal of Molecular Sciences, 27(2), 677. https://doi.org/10.3390/ijms27020677","Irani, S. (2020). New Insights into Oral Cancer Risk Factors and Prevention: A Review of Literature. Int. J. Prev. Med. 11, 202.","Global Cancer Observatory (GCO / IARC). (2022). Cancer Today: Oral Cavity Cancer Statistics.","Parak, U., Lopes Carvalho, A., Roitberg, F., & Mandrik, O. (2022). Effectiveness of screening for oral cancer and oral potentially malignant disorders (OPMD): A systematic review. Preventive Medicine Reports, 30, 101987."]'::jsonb,
  1
),
(
  'faktor-risiko-kanker-mulut-yang-perlu-diwaspadai',
  'Pencegahan',
  'Faktor Risiko Kanker Mulut yang Perlu Diwaspadai',
  'Beberapa faktor utama seperti penggunaan tembakau, konsumsi alkohol, infeksi HPV, hingga kebersihan mulut dapat meningkatkan risiko terjadinya kanker mulut.',
  5,
  false,
  'from-tertiary-container to-tertiary',
  '["Beberapa faktor yang terbukti meningkatkan risiko terjadinya kanker mulut meliputi penggunaan tembakau, konsumsi alkohol, infeksi virus tertentu, serta faktor kebersihan mulut.","1. Penggunaan Tembakau: Rokok, cerutu, dan tembakau kunyah merupakan faktor risiko terbesar yang berhubungan dengan terjadinya Oral Squamous Cell Carcinoma (OSCC).","2. Konsumsi Alkohol: Konsumsi alkohol meningkatkan risiko kanker mulut, terutama bila dikombinasikan dengan kebiasaan merokok.","3. Infeksi Human Papillomavirus (HPV): Infeksi HPV risiko tinggi, terutama tipe 16, berhubungan dengan sebagian kanker rongga mulut dan orofaring.","4. Paparan Sinar Ultraviolet: Terutama paparan sinar matahari berlebih pada jaringan bibir bawah.","5. Kebersihan Mulut yang Buruk: Adanya karang gigi, gigi patah, tepi gigi tajam, atau penggunaan gigi tiruan yang tidak pas dapat memicu iritasi kronis.","6. Riwayat Keluarga dan Pola Makan: Faktor genetik serta kurangnya konsumsi buah dan sayuran juga dapat berkontribusi terhadap peningkatan risiko kanker mulut."]'::jsonb,
  '["Coletta, R. D., Yeudall, W. A., & Salo, T. (2024). Current trends on prevalence, risk factors and prevention of oral cancer. Frontiers in Oral Health, 5, 1505833. https://doi.org/10.3389/froh.2024.1505833","Schröder, A., et al. (2024). Impact of lifestyle factors on oral cancer risk and prevention: Oral cancer epidemiology. Oral Oncology Reports, 9, 100259.","Shrivastava, R., Gupta, A., Mehta, N., Das, D., & Goyal, A. (2024). Dietary patterns and risk of oral and oropharyngeal cancers: A systematic review and meta-analysis. Cancer Epidemiology, 93, 102650.","Aghiorghiesei, O., Zanoaga, O., Nutu, A., et al. (2022). The World of Oral Cancer and Its Risk Factors Viewed from the Aspect of MicroRNA Expression Patterns. Genes, 13(4), 594."]'::jsonb,
  2
),
(
  'kenali-gejala-awal-dan-oral-potentially-malignant-disorders-opmd',
  'Gejala',
  'Kenali Gejala Awal & Oral Potentially Malignant Disorders (OPMD)',
  'Pahami jenis-jenis kelainan mukosa mulut seperti Leukoplakia, Eritroplakia, dan Lichen Planus yang berpotensi berkembang menjadi kanker.',
  7,
  false,
  'from-inverse-surface to-secondary',
  '["OPMD (Oral Potentially Malignant Disorders) merupakan kelompok kelainan mukosa mulut yang memiliki kemungkinan berkembang menjadi kanker apabila tidak dipantau secara berkala.","Jenis OPMD yang paling sering ditemukan meliputi:","• Leukoplakia: Bercak putih pada mukosa mulut yang tidak dapat dihilangkan dengan pengusapan dan tidak dapat dijelaskan sebagai penyakit lain.","• Eritroplakia: Bercak merah dengan risiko transformasi ganas lebih tinggi dibandingkan leukoplakia.","• Oral Lichen Planus: Kelainan inflamasi kronis yang dapat muncul sebagai garis putih, bercak merah, atau ulserasi.","• Oral Submucous Fibrosis: Pengerasan jaringan mulut yang menyebabkan keterbatasan membuka mulut, sering dikaitkan dengan kebiasaan mengunyah pinang.","Tanda dan Gejala yang Perlu Diwaspadai: Segera periksa ke dokter gigi apabila mengalami luka lebih dari 2 minggu, bercak putih/merah menetap, benjolan membesar, nyeri saat menelan, kesulitan membuka mulut, lidah kaku, gigi goyang tanpa sebab, atau pembengkakan leher."]'::jsonb,
  '["Warnakulasuriya, S., Kujan, O., Aguirre-Urizar, J. M., et al. (2021). Oral potentially malignant disorders: A consensus report from an international seminar on nomenclature and classification. Oral Diseases, 27(8), 1862–1880.","Lingen, M. W., Abt, E., Agrawal, N., et al. (2017). Evidence-based clinical practice guideline for the evaluation of potentially malignant disorders in the oral cavity: A report of the American Dental Association. JADA, 148(10), 712–727.e10.","American Dental Association (ADA). (2026). Living Evidence-Informed Guideline on the Early Detection of Oral Squamous Cell Carcinoma.","World Health Organization (WHO / IARC). (2024). WHO Classification of Tumours: Head and Neck Tumours (5th ed., Vol. 9).","van der Waal, I. (2019). Oral leukoplakia: present views on diagnosis, management, communication with patients, and research. Current Oral Health Reports, 6(1), 9-13."]'::jsonb,
  3
),
(
  'panduan-pemeriksaan-mandiri-rongga-mulut-samuri',
  'Perawatan',
  'Panduan Pemeriksaan Mandiri Rongga Mulut (SAMURI)',
  'Langkah-langkah sederhana melakukan pemeriksaan mandiri di rumah setiap bulan untuk mengenali perubahan pada jaringan mulut sejak dini.',
  4,
  false,
  'from-secondary to-primary-container',
  '["Lakukan pemeriksaan mandiri rongga mulut setiap bulan di depan cermin dengan pencahayaan yang cukup terang.","Area yang perlu diperiksa meliputi: bibir, pipi bagian dalam, gusi, lidah bagian atas, sisi kanan dan kiri lidah, bagian bawah lidah, dasar mulut, serta langit-langit mulut.","Amati dengan cermat apakah ada luka/sariawan yang tak kunjung sembuh, bercak putih, bercak merah, benjolan, atau pembengkakan yang tidak biasa.","Pemeriksaan mandiri tidak menggantikan pemeriksaan profesional oleh dokter gigi, namun sangat membantu dalam mengenali perubahan jaringan lebih awal."]'::jsonb,
  '["Elango, K. J., Anandkrishnan, N., Suresh, A., et al. (2011). Mouth self-examination to improve oral cancer awareness and early detection in a high-risk population. Oral Oncology, 47(7), 620–624.","Warnakulasuriya, S., Kujan, O., et al. (2021). Oral potentially malignant disorders: Consensus report. Oral Diseases, 27(8), 1862–1880.","Kerr, A. R., Lodi, G., et al. (2024). Management of oral potentially malignant disorders and early detection of oral squamous cell carcinoma. JADA.","International Agency for Research on Cancer (IARC). (2023). IARC Handbooks of Cancer Prevention, Vol 19: Oral Cancer Prevention."]'::jsonb,
  4
),
(
  'bagaimana-oral-screen-ai-bekerja-dan-cara-ambil-foto-yang-baik',
  'Teknologi',
  'Bagaimana Oral Screen AI Bekerja & Cara Ambil Foto yang Baik',
  'Pelajari panduan pengambil foto rongga mulut yang optimal dan bagaimana kecerdasan buatan membantu melakukan triase risiko.',
  5,
  false,
  'from-primary to-inverse-surface',
  '["Oral Screen AI merupakan platform skrining berbasis Artificial Intelligence (AI) yang membantu mengidentifikasi kemungkinan adanya lesi potensial ganas pada foto rongga mulut.","Alur Kerja Sistem: (1) Pengguna mengunggah foto rongga mulut; (2) AI melakukan analisis gambar; (3) Sistem mengenali pola yang menyerupai OPMD atau kanker mulut; (4) Pengguna memperoleh hasil berupa tingkat risiko; (5) Pengguna dengan risiko perlu rujukan dianjurkan berkonsultasi ke dokter gigi spesialis penyakit mulut.","Panduan Mengambil Foto yang Baik: Gunakan pencahayaan terang, bersihkan lensa kamera, hindari bayangan dan filter kamera, pastikan gambar fokus, ambil dari beberapa sudut, dan hindari foto buram.","Penting: Hasil Oral Screen AI merupakan skrining/triase awal, bukan diagnosis. Diagnosis pasti hanya dapat ditegakkan melalui pemeriksaan klinis oleh dokter dan biopsi (gold standard)."]'::jsonb,
  '["Schwendicke, F., Samek, W., & Krois, J. (2020). Artificial intelligence in dentistry: Chances and challenges. Journal of Dental Research, 99(7), 769–774.","Khanagar, S. B., et al. (2021). Developments, application, and performance of artificial intelligence in dentistry – A systematic review. Journal of Dental Sciences, 16(1), 508–522.","Fu, Q., Chen, Y., Li, Z., et al. (2024). Artificial intelligence for oral cancer detection and diagnosis: A systematic review and meta-analysis. Oral Oncology, 150, 106865.","Mello, F. W., et al. (2021). The performance of artificial intelligence in the detection of oral potentially malignant disorders and oral squamous cell carcinoma: A systematic review. OOOO, 131(2), 219–230."]'::jsonb,
  5
),
(
  'langkah-efektif-mencegah-risiko-kanker-mulut',
  'Gaya Hidup',
  'Langkah Efektif Mencegah Risiko Kanker Mulut',
  'Pencegahan primer dan pola hidup sehat merupakan strategi paling efektif untuk menjaga kesehatan jaringan rongga mulut.',
  5,
  false,
  'from-tertiary to-tertiary-container',
  '["Risiko kanker mulut dapat dikurangi secara signifikan dengan menerapkan langkah-langkah pencegahan primer dan pola hidup sehat.","Langkah-langkah pencegahan meliputi:","• Berhenti merokok dan menghindari produk tembakau lainnya.","• Menghindari konsumsi alkohol secara berlebihan.","• Menjaga kebersihan gigi dan mulut dengan menyikat gigi dua kali sehari.","• Memperbanyak konsumsi buah dan sayuran segar.","• Menggunakan pelindung bibir (lip balm ber-SPF) saat terpapar sinar matahari.","• Melakukan pemeriksaan gigi rutin ke dokter gigi setiap 6 bulan sekali.","• Melakukan pemeriksaan mandiri rongga mulut setiap bulan."]'::jsonb,
  '["World Health Organization (WHO). (2024). Oral cancer fact sheet. Geneva.","International Agency for Research on Cancer (IARC). (2023). IARC Handbooks of Cancer Prevention, Volume 19: Oral Cancer Prevention. Lyon: IARC.","Coletta, R. D., Yeudall, W. A., & Salo, T. (2024). Current trends on prevalence, risk factors and prevention of oral cancer. Frontiers in Oral Health, 5, 1505833.","American Cancer Society (ACS). (2025). Can Oral Cavity and Oropharyngeal Cancers Be Prevented?"]'::jsonb,
  6
)
on conflict (slug) do update set
  category = excluded.category,
  title = excluded.title,
  excerpt = excluded.excerpt,
  read_minutes = excluded.read_minutes,
  featured = excluded.featured,
  cover = excluded.cover,
  body = excluded.body,
  sources = excluded.sources,
  sort_order = excluded.sort_order;
