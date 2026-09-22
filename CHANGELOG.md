# Changelog

All notable changes to the **Oral Screen AI / Oral Disease Detector** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-22

### Added
- **AI Suspect Category Display**: The scan result screen (`Pemeriksaan.tsx`) now displays the exact 4-class AI model prediction heading (`SUSPECT MULUT NORMAL`, `SUSPECT SARIAWAN`, `SUSPECT KELAINAN MULUT`, `SUSPECT KANKER MULUT`).
- **AI Confidence Rate Meter**: Added an explicit confidence rate box displaying the calculated model confidence percentage (e.g. `85.4%`) with a visual progress bar.
- **Unready Feature Indicators & Badges**: Added standardized `"Belum Tersedia"` and `"Fitur Belum Tersedia"` status badges and disabled states for mock/in-development features:
  - **Profil Page**: `Ubah Kata Sandi`, `Biometrik Login`, `Otentikasi Dua Faktor`, `Notifikasi Pemeriksaan`, `Edukasi Kesehatan`, `Pembaruan Versi`, and `Hapus Akun`.
  - **Edukasi Page**: `Dapatkan Update Mingguan` (Newsletter email input & subscription button) and Consult CTAs (`Buat Janji Temu`, `Tanya Dokter`).
  - **Bantuan Page**: `Live Chat`, `Email`, `Telepon` cards and `Hubungi Dukungan` CTA button.
- **Fresh Generated Sample Images**: Generated 5 high-resolution oral reference images (`ok-01.jpeg`, `ok-02.jpeg`, `ok-03.jpeg`, `bad-01.jpeg`, `bad-02.png`) stored in `public/assets/samples/`.

### Changed
- **Version Realignment**: Reset project version in `package.json` from `2.0.0` to pre-release `0.1.0` to reflect actual development phase. `vite.config.ts` automatically propagates `__APP_VERSION__` into the footer.
- **Indonesian Language Standardization**: Standardized all UI risk badges, table rows, and status chips in `Riwayat.tsx`, `RiskBadge.tsx`, and `risk.ts` to Bahasa Indonesia (`Mulut Normal`, `Diduga Sariawan`, `Diduga Kelainan Mulut`, `Diduga Kanker Mulut`).
- **Scan Result Layout Clean-up**: Streamlined the **Langkah Selanjutnya (Next Steps)** section by removing inner card container borders so advice text reads cleanly without visual clutter.
- **Interactive Profile Data Rows**: Updated personal data rows under **Data Pribadi** (`Nama Lengkap`, `Tanggal Lahir`, `Nomor Telepon`) to be directly clickable, opening the **Edit Profile** modal on interaction.

### Fixed
- **Broken Sample Image Assets**: Changed image source URLs in `Pemeriksaan.tsx` from remote storage helpers to direct local static assets (`/assets/samples/...`), resolving broken image alt box placeholders.
- **Date Picker Input Bug in Profile Modal**: Fixed `SEED_PROFILE.birthDate` in `mockData.ts` from non-standard string `'15 Maret 1990'` to ISO format `'1990-03-15'`, enabling HTML5 `<input type="date">` parsing.
- **Offline Profile Persistence**: Updated `saveProfile` in `repository.ts` to immediately sync local storage, ensuring profile updates persist reliably across page reloads in demo and offline modes.
