# Oral Screen AI

An on-device AI screening tool for **oral cancer triage**. Users capture or upload
a photo of the oral cavity and an offline neural network returns a referral
verdict — **PERLU RUJUKAN** ("needs referral") or **TIDAK PERLU RUJUKAN** — with a
Grad-CAM heatmap highlighting the region that drove the decision.

> ⚠️ **Oral Screen AI is a triage aid, not a diagnosis.** Results are a screening
> signal only and never replace examination by a dental or medical professional.

The app is a bilingual (Indonesian / English) healthcare portal that runs as a
web app (Vercel) and as a native Android/iOS app (Capacitor). All image inference
happens **on-device**; photos never leave the device.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [The model](#the-model)
- [Privacy](#privacy)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Database & migrations](#database--migrations)
- [Deployment](#deployment)
- [Related docs](#related-docs)

---

## Features

- **AI oral screening** — capture (camera), upload (with drag-and-drop), or **live
  detection**; on-device ONNX inference; real Grad-CAM heatmap + tight bounding box
  over the most-activated region.
- **Six-section portal** — Home (Beranda), Scan (Pemeriksaan), Education (Edukasi),
  History (Riwayat), Profile (Profil), Help (Bantuan).
- **Per-user accounts** — Supabase Auth (email/password); each user sees only their
  own profile and scan history (enforced by row-level security).
- **Offline-friendly** — falls back to browser `localStorage` when Supabase isn't
  configured, and a built-in **demo account** works with no backend at all.
- **Bilingual** — Indonesian (default) and English, toggled in-app.
- **Responsive** — desktop sidebar layout and mobile bottom-nav / bottom-sheet
  layout, light/dark aware, "Clinical Clarity" design system.

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 18 + TypeScript, Vite 5 |
| Styling | Tailwind CSS 3 ("Clinical Clarity" design system — indigo `#4648d4`, Inter) |
| Routing | React Router 6 |
| ML runtime | `onnxruntime-web` (WASM, multi-threaded when cross-origin isolated) |
| Backend | Supabase (Postgres + Auth), with `localStorage` fallback |
| Native | Capacitor 6 (Android / iOS) |
| Tooling | Node 20, ESLint |

---

## Architecture

**Data layer ([`src/lib/repository.ts`](src/lib/repository.ts))** — a single API for
profiles, scans, and articles. It transparently chooses a source:

- **Supabase** when `VITE_SUPABASE_*` env vars are set *and* a real user is signed in
  → per-user reads/writes scoped by `auth.uid()`.
- **`localStorage` + seed data** otherwise (demo account or no backend configured).

Pages never branch on the source; they just call `getProfile()`, `listScans()`, etc.

**Auth ([`src/lib/auth.tsx`](src/lib/auth.tsx))** — real Supabase email/password auth,
plus a **demo bypass** (`user@example.com` / `user123`, [`src/lib/demo.ts`](src/lib/demo.ts))
that runs fully offline against local seed data. A new signup auto-creates a profile
row via a database trigger.

**Inference ([`src/lib/inference.ts`](src/lib/inference.ts))** — loads the model +
config once, runs the forward pass in WASM, computes the Grad-CAM, and draws the
overlay. Everything (threshold, image size, normalization) is read from
`model_config.json` at runtime — never hardcoded.

**Routes ([`src/App.tsx`](src/App.tsx))** — `/login` is public; everything else is
behind `RequireAuth`:

| Path | Page |
|---|---|
| `/` | Beranda (home / dashboard) |
| `/pemeriksaan` | Pemeriksaan (scan flow) |
| `/edukasi`, `/edukasi/:slug` | Edukasi (articles) |
| `/riwayat` | Riwayat (scan history) |
| `/profil` | Profil (profile & settings) |
| `/bantuan` | Bantuan (help / FAQ) |

---

## The model

A quantized **ResNeSt-50** binary referral classifier, run on-device. Assets live in
[`public/assets/models/`](public/assets/models/):

| File | Purpose |
|---|---|
| `oral_referral_resnest50d_quant.onnx` | INT8 model (~25 MB) |
| `model_config.json` | Threshold, image size, normalization, class names, architecture |
| `fc_weights.json` | Grad-CAM weights for the positive class |

Key facts (from `model_config.json` + the ONNX graph):

- **Input:** `input_image`, shape `[1, 3, 384, 384]` (full square resize, no crop)
- **Outputs:** `logits` `[1, 1]` and `features` `[1, 2048, 12, 12]`
- **Probability:** `sigmoid(logits[0])` = P(PERLU RUJUKAN)
- **Decision threshold:** `0.1973` (tuned for high sensitivity; read from config)
- **Grad-CAM:** `ReLU(Σ fc_weights · features)`, min-max normalized

Training is done in a **separate project** (`../oral-disease-detector`); this app only
runs inference. To swap in a retrained model, see **[RETRAINING.md](RETRAINING.md)**.

---

## Privacy

- **Scan photos never leave the device.** Full-resolution images are used only for
  in-browser inference and are never uploaded.
- **Thumbnails stay local.** Small history thumbnails are stored only in browser
  `localStorage` (`osa:thumbs:v1`), never in the database — the `scans` table has no
  image column.
- Only non-image scan metadata (referral verdict, probability, timestamp, and the
  patient identity from the profile) is persisted per user.

---

## Getting started

Requirements: **Node 20+**.

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:3000**. Sign in with the demo account to
explore with no backend:

- **Email:** `user@example.com`
- **Password:** `user123`

> The dev/preview servers set `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`
> headers — these are **required** for multi-threaded WASM (`SharedArrayBuffer`) used by
> ONNX Runtime. Production sets the same headers via `vercel.json`.

---

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase values (both optional — the
app runs on `localStorage` when they're absent). `.env` is git-ignored.

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **publishable/anon** key (safe client-side; access is guarded by RLS) |

> Never expose the Supabase `service_role`/secret key — it must never be `VITE_`-prefixed
> or shipped to the browser.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Type-check (`tsc`) then production build to `dist/` |
| `npm run preview` | Serve the production build on port 4173 (mirrors prod COOP/COEP headers) |
| `npm run lint` | ESLint over `.ts`/`.tsx` |

> The app version shown in the profile footer is injected from `package.json` at build
> time — bump `"version"` there to update it.

---

## Project structure

```
src/
  App.tsx                 # routes + providers
  components/
    layout/               # AppShell, Sidebar, BottomNav, TopBar, PageTransition
    scan/                 # CameraCapture, LiveInference
    ui/                   # Card, Button, Modal, Skeleton, etc.
  hooks/
    useOnnxModel.ts       # model loading + progress
  lib/
    inference.ts          # ONNX inference + Grad-CAM
    repository.ts         # data access (Supabase or localStorage)
    auth.tsx              # Supabase auth + demo bypass
    demo.ts               # demo-account constants
    supabase.ts           # Supabase client (null when unconfigured)
    i18n.tsx              # ID/EN language provider
    risk.ts               # referral verdict from probability
    countries.ts          # phone dial codes
    types.ts, mockData.ts # domain types + seed/fallback data
  pages/                  # Beranda, Pemeriksaan, Edukasi, ArticleDetail,
                          # Riwayat, Profil, Bantuan, Login
public/assets/models/     # ONNX model + config + CAM weights
supabase/migrations/      # database schema (versioned SQL)
android/                  # Capacitor Android project
```

---

## Database & migrations

Schema lives in [`supabase/migrations/`](supabase/migrations/) as versioned SQL and is
safe to commit (schema only — no secrets). Highlights:

- `profiles` and `scans` are **per-user**, keyed to `auth.users`, with row-level
  security scoped to `auth.uid()` (migration `0008`).
- A `handle_new_user` trigger auto-creates a profile row on signup.
- `articles` are served from the DB (with a static fallback in `mockData.ts`).

Apply migrations via the Supabase SQL editor or the Supabase CLI.

---

## Deployment

- **Web (Vercel):** `vercel.json` configures the Vite build, SPA rewrites (except
  `/assets/`), and the COOP/COEP headers needed for WASM. Set `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` in the Vercel project's **Production** environment, then
  redeploy (Vite inlines `VITE_*` at build time).
- **Android (Capacitor):**
  ```bash
  npm run build
  npx cap sync android
  ```
  The model is bundled into the app, so shipping a new model to installed apps
  requires an app update (see [RETRAINING.md](RETRAINING.md)). If the model fails to
  load into WASM memory on Android, add `android:largeHeap="true"` to
  `android/app/src/main/AndroidManifest.xml`.

---

## Related docs

| Doc | What's in it |
|---|---|
| [RETRAINING.md](RETRAINING.md) | How to swap in a newly trained model (the 3 files, filename rule, tensor contract) |
| [DESIGN.md](DESIGN.md) | Design system / UI guidelines |
| [MODEL_MIGRATION_HANDOFF.md](MODEL_MIGRATION_HANDOFF.md) | History of the ResNet50 → ResNeSt-50 model migration |
