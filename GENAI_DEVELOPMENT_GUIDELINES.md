# GenAI Development Guidelines — Oral Screen AI

> **Target Audience:** AI Assistants (Gemini / Antigravity / ChatGPT / Claude) and Developers working on the `oral-disease-detector-app` codebase.
> **Purpose:** Maintain strict code consistency, medical safety standards, i18n rules, and architectural integrity across all AI-driven codebase modifications.

---

## 1. Project Overview & Tech Stack

- **Framework:** React 18 + TypeScript + Vite.
- **Styling:** Tailwind CSS + Lucide React Icons + Material 3 Design Tokens.
- **Mobile Runtime:** Capacitor 6 (Android & iOS wrapper).
- **AI Inference Engine:** ONNX Runtime Web (`onnxruntime-web`) running quantized INT8 ResNeSt-50 models offline in WASM.
- **Backend / Database:** Supabase (Postgres + Auth + Storage) with a local-first `localStorage` fallback for offline / demo mode.

---

## 2. Core Development Rules

### Rule A: Single Source of Truth for App Version
- The version string lives **exclusively in `package.json`** (`"version"` field).
- `vite.config.ts` automatically exposes this as the compile-time constant `__APP_VERSION__`.
- **Never** hardcode version strings in React components. To bump the app version, edit `package.json` only.

### Rule B: AI Model & Inference Rules
- **Model Files:** `public/assets/models/oral_referral_resnest50d_quant.onnx`, `model_config.json`, and `fc_weights.json`.
- **Never Hardcode Parameters:** Read `imgSize`, `mean`, `std`, and `classNames` dynamically from `model_config.json` via `loadModelConfig()`.
- **4-Class Softmax Output:** The model predicts across 4 distinct classes:
  1. `SUSPECT MULUT NORMAL` (Normal)
  2. `SUSPECT SARIAWAN` (Suspected Canker Sore)
  3. `SUSPECT KELAINAN MULUT` (Suspected Oral Abnormality)
  4. `SUSPECT KANKER MULUT` (Suspected Oral Cancer)
- Prediction is derived via `argmax(softmax(logits))`. There is **no single scalar threshold** to hardcode.

### Rule C: Language & Terminology Standards
- **Default Language:** Bahasa Indonesia (`id`).
- All user-facing medical terminology must default to Bahasa Indonesia (`Mulut Normal`, `Diduga Sariawan`, `Diduga Kelainan Mulut`, `Diduga Kanker Mulut`).
- Do **not** hardcode `variant="en"` on `RiskBadge` or other UI elements unless explicitly requested by the user.

### Rule D: Handling Unready / In-Development Features
Whenever adding or editing UI components that are mock, not fully connected to a live backend, or in development (e.g., Live Chat, 2FA, Biometric Login, Newsletter Email Sending, Account Deletion):
1. **Add a Badge:** Display a prominent badge or pill labeled **`Belum Tersedia`** or **`Fitur Belum Tersedia`**.
2. **Disable Interactions:** Apply `disabled` attributes to `<input>`, `<button>`, and toggle switches.
3. **Muted Visuals:** Apply `opacity-60 cursor-not-allowed` to indicate unready status clearly to testers.

### Rule E: Local-First Data & Asset Handling
- **Static Asset Resolution:** Local sample photos in `public/assets/samples/` must be referenced using direct local paths (`/assets/samples/${filename}`) so they load reliably offline without depending on external Supabase storage buckets.
- **Repository Pattern:** `src/lib/repository.ts` handles data access. `saveProfile` must write to `localStorage` (`writeLocal`) immediately to keep offline and demo modes reactive across page reloads.

---

## 3. Maintenance & Update Workflow for GenAI

When an AI assistant makes changes to this project, it **MUST** perform the following steps:

1. **Verify Code Build:** Run `npm run build` (`tsc && vite build`) via `run_command` and ensure exit code `0` with zero compilation errors.
2. **Update `CHANGELOG.md`:** Add an entry under the appropriate version header in `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) standards.
3. **Update `walkthrough.md`:** Update the conversation artifact `walkthrough.md` summarizing the technical changes and verification results.
4. **Synchronize Mobile Assets:** If web assets or plugins were modified, notify the user or run `npx cap sync android`.

---

## 4. Key File Map

| File | Purpose |
|---|---|
| `package.json` | Single source of truth for dependencies and app version |
| `src/lib/inference.ts` | ONNX WASM loading, tensor preprocessing, and Grad-CAM math |
| `src/lib/risk.ts` | Mapping predicted model classes to UI labels, colors, and advice |
| `src/lib/repository.ts` | Data access layer (Supabase + local storage fallback) |
| `src/pages/Pemeriksaan.tsx` | Scan workflow (Camera / Upload / Live scan + Result screen) |
| `src/pages/Profil.tsx` | User profile, risk factor questionnaire, and app settings |
| `src/pages/Riwayat.tsx` | Scan history table and detailed scan modal |
| `public/assets/models/` | ONNX model graph, model config, and CAM weights |
