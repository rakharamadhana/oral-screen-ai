# Model Migration Handoff — ResNet50 → ResNeSt-50

> ⚠️ **SUPERSEDED — historical record only.** This migration is complete. The
> app already runs the ResNeSt-50 oral-referral model fully config-driven: the
> inference math lives in `src/lib/inference.ts` (not the long-gone
> `src/components/OralDiseaseDetector.tsx` this doc refers to), input size / CAM
> grid / decision threshold all come from `model_config.json` at runtime, and no
> code edit is needed on a retrain. The "What's left to do" steps below are DONE
> and describe files that no longer exist — kept for provenance only.
>
> The **Model facts** table below has been updated to the **current** retrained
> model (2026-07-29 retrain: 224px, threshold 0.1281, 7×7 features, AUC 0.908).
> For the authoritative values always read `public/assets/models/model_config.json`.

**Purpose:** Wire this Ionic app to the new ResNeSt-50 oral-referral model. The
model assets are already copied in; the remaining work is updating the React
component + locales. Pick up from **"What's left to do."**

> Context: the trained model, reports, and source pipeline live in the sibling
> folder `../oral-disease-detector`. This app is `oral-disease-detector-app`.

---

## TL;DR of the change

The app currently runs an **obsolete model** (ResNet50, benign/malignant, 224px,
threshold 0.62, fake heatmap). It must be switched to the **new model**
(ResNeSt-50, referral classes, 224px, threshold 0.1281, real Grad-CAM).

**Do NOT rewrite the component from scratch.** Keep all existing features
(camera, live scan, i18n, theming, consent). Only swap the model wiring.

---

## ✅ Already done

- Copied into `public/assets/models/`:
  - `oral_referral_resnest50d_quant.onnx` (25.8 MB) — the new INT8 model
  - `model_config.json` — threshold, imgSize, mean/std, class names
  - `fc_weights.json` — 2048 CAM weights for the positive class
- `vite.config.ts` already handles offline WASM (`viteStaticCopy` of `ort-wasm*`
  → `assets`, and COOP/COEP headers). **No change needed there.**
- `onnxruntime-web` already a dependency. **No change needed.**

---

## Model facts (from `model_config.json` + the ONNX graph)

| Property | Value |
|---|---|
| Model file | `assets/models/oral_referral_resnest50d_quant.onnx` |
| Input tensor name | `input_image` |
| Input shape | `[1, 3, 224, 224]` (imgSize from config) |
| Preprocessing | **full square resize** to 224×224, no center crop |
| mean / std | `[0.485,0.456,0.406]` / `[0.229,0.224,0.225]` |
| Outputs | `logits` `[1,1]`  **and**  `features` `[1,2048,7,7]` |
| Prob | `sigmoid(logits[0])` = P(PERLU RUJUKAN) |
| Threshold | **0.12808673083782196** (load from config; never hardcode) |
| Test AUC | **0.9077** (informational; was 0.9813) |
| TTA at training | `false` |
| Positive class | `PERLU RUJUKAN` (label 1) |
| Negative class | `TIDAK PERLU RUJUKAN` (label 0) |

The old model was single-output (`logits` only) and the component's CAM code
looks for `results.conv_out`, which never existed → the heatmap was fake. The
new model emits real `features`; combine with `fc_weights.json` for a true CAM.

---

## What's left to do

### 1. `src/components/OralDiseaseDetector.tsx`

Load the config once at startup, then drive everything from it. Current line
numbers are approximate — search for the strings.

- **Type (line ~33):** `type Diagnosis = 'Benign' | 'Malignant'`
  → referral classes. Suggest `type Referral = 'PERLU RUJUKAN' | 'TIDAK PERLU RUJUKAN'`.
  Update `diagnosticClass`, `liveClass` state types accordingly.

- **Load config + fc weights on init** (near the model-load effect, ~line 200):
  ```ts
  const cfg = await fetch('assets/models/model_config.json').then(r => r.json());
  const fc  = await fetch('assets/models/fc_weights.json').then(r => r.json());
  // store cfg + new Float32Array(fc.weights) in refs
  ```

- **Model URL (line ~203, ~214):**
  `assets/models/oral_disease_resnet50_quant.onnx`
  → `assets/models/oral_referral_resnest50d_quant.onnx`
  (or derive from `cfg.architecture`).

- **Preprocessing — BOTH paths** (photo ~line 611–672, live ~line 453–513):
  every hardcoded size → `cfg.imgSize` (currently 224). Canvas is `drawImage(src, 0, 0, S, S)`
  (already a full square resize — good, matches training). Tensor shape
  `[1, 3, S, S]`.

- **Threshold (lines ~521, ~687):** `const decisionThreshold = 0.62;`
  → `cfg.decisionThreshold`.

- **Decision + labels (lines ~522–523, ~688–689):**
  `isMalignant` → `needsReferral = prob >= cfg.decisionThreshold`;
  map to referral classes.

- **Real Grad-CAM** — replace the fake Gaussian (search `results.conv_out`,
  and the `prob >= 0.62 ? ... : ...` blob at ~541, ~748):
  ```ts
  // results.features.dims = [1, 2048, H, W] (H=W=7; read from dims, never hardcode)
  // CAM[y][x] = ReLU( Σ_c fcWeights[c] * features[c][y][x] ), then min-max normalise
  ```
  Reference implementation already written and verified in
  `../oral-disease-detector/OralDiseaseDetector.tsx` (functions `computeCAM`
  and `renderCAMOverlay`) and in `../oral-disease-detector/local_demo.html`.
  Copy the CAM math from there.

- **Badge colors / UI (lines ~1035, 1041, 1064, 1118–1119):**
  `=== 'Malignant'` → `=== 'PERLU RUJUKAN'`.

- **Score label:** the UI shows a raw % as a "score". Calibration is decent now,
  but consider showing a band (rendah/sedang/tinggi) instead of false-precision.

### 2. Locales — `src/locales/en.json` and `id.json`

Keys `benign`, `malignant`, `malignantAdvice`, `benignAdvice` are
benign/malignant wording. Replace with referral wording, e.g.:

- id: `"malignant": "PERLU RUJUKAN"`, `"benign": "TIDAK PERLU RUJUKAN"`
  - `malignantAdvice`: "Citra menunjukkan ciri yang sebaiknya diperiksa dokter gigi. Ini sinyal triase, bukan diagnosis."
  - `benignAdvice`: "Tidak ditemukan ciri yang memerlukan rujukan. Tetap periksakan bila ada nyeri, pendarahan, atau luka yang tak sembuh dalam 2 minggu."
- Keep the key names if renaming is too invasive; just change the values.
- (Optional) rename keys to `refer`/`noRefer` for clarity later.

### 3. Cleanup (do LAST, after component works)

- Delete stale model: `public/assets/models/oral_disease_resnet50_quant.onnx` (24 MB).

---

## Decision needed before starting

**Live-scan path.** Per-frame classification at 224px on a mid-range phone is
slow (~1–2 s/frame in WASM) and will strobe between classes. Options:
- **(a)** Update both photo-scan and live-scan to the new model as-is.
- **(b, recommended)** Update photo-scan properly; gate live-scan behind a
  "beta/experimental" note (or downscale live to 224 with a visible caveat).

See `../oral-disease-detector` reports for why per-frame live inference is
problematic (prevalence + strobing). Decide (a) or (b) before editing the live path.

---

## How to test after the change

```bash
npm run dev          # vite dev server on :3000
```

1. Open the app, load the model — log should read the new filename + threshold.
2. Photo-scan a known **PERLU RUJUKAN** test image from
   `../oral-disease-detector/dataset_split/test/perlu_rujukan/` → expect high
   score, "PERLU RUJUKAN", CAM heat over the lesion.
3. Photo-scan a **tidak_perlu_rujukan** image → low score, "TIDAK PERLU RUJUKAN".
4. Sanity vs Python: the same image scored via
   `../oral-disease-detector` should match within ~0.02 (canvas vs PIL resize).
   Reference numbers (already verified in-browser):
   - `perlu_rujukan_00318.jpg` → ~0.85
   - `perlu_rujukan_00319.jpg` → ~0.92
   - `tidak_perlu_rujukan_00005.jpg` → ~0.02
   - `tidak_perlu_rujukan_00007.jpg` → ~0.09

Then Android build check:
```bash
npm run build
npx cap sync android
```
If the model fails to load into WASM memory on Android, add
`android:largeHeap="true"` to `android/app/src/main/AndroidManifest.xml`.

---

## Gotchas

- **Input size comes from `cfg.imgSize` (currently 224).** Any hardcoded size = wrong tensor shape on the next retrain.
- **Threshold from config.** The old 0.62 was fabricated from a synthetic run;
  the real value is 0.1281 (tuned for high sensitivity — expect more positives).
- **CAM needs `results.features`**, not `results.conv_out`. Different name.
- **Don't gzip the .onnx** in any build step — it's already compressed.
- The model is a **rule-out / triage aid**, not a diagnosis. Keep the consent
  copy and framing accordingly.

---

## File map

| What | Where |
|---|---|
| New model assets | `public/assets/models/oral_referral_resnest50d_quant.onnx` (+ `model_config.json`, `fc_weights.json`) |
| Component to update | `src/components/OralDiseaseDetector.tsx` |
| Locales to update | `src/locales/en.json`, `src/locales/id.json` |
| Reference CAM impl | `../oral-disease-detector/OralDiseaseDetector.tsx`, `../oral-disease-detector/local_demo.html` |
| Trained model + reports | `../oral-disease-detector/output/`, `../oral-disease-detector/*.docx` |
| Stale model to delete (last) | `public/assets/models/oral_disease_resnet50_quant.onnx` |
