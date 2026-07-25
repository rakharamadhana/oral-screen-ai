# Project Brief: OralDetect (Healthcare Portal)

## 1. Project Overview
**OralDetect** is an AI-driven healthcare platform designed for the early detection and prevention of oral cancer. The application allows users to perform self-screenings by uploading photos of specific oral regions, receive AI-powered risk assessments, and access educational resources for dental health.

### 1.1 Objectives
*   **Early Detection:** Provide an accessible tool for users to identify potential oral health risks early.
*   **Education:** Empower users with credible medical information regarding oral hygiene and cancer prevention.
*   **Cross-Platform Consistency:** Deliver a seamless experience across Android (mobile) and Web (desktop) environments.

---

## 2. Target Audience
*   **Primary Users:** Individuals seeking proactive oral health monitoring.
*   **Secondary Users:** Patients requiring regular follow-ups after initial screenings or those with high-risk factors (e.g., smokers).

---

## 3. Product Features

### 3.1 Core Functionality (The Scan Flow)
*   **Self-Examination:** A guided 6-step process for capturing high-quality images of:
    *   Lidah (Tongue)
    *   Gusi (Gums)
    *   Pipi Dalam (Inner Cheek)
    *   Langit-langit (Roof of Mouth)
*   **AI Analysis:** Instant risk assessment (Low/Medium/High Risk) based on uploaded imagery.
*   **Instructional Guidance:** Real-time tips on lighting, focus, and positioning to ensure medical-grade photo quality.

### 3.2 Dashboard & Monitoring
*   **Health Statistics:** Tracking total scans and consistency of check-ups.
*   **History (Riwayat):** A detailed log of previous examinations with risk status and image samples.
*   **Check-up Scheduling:** Reminders for upcoming routine dental visits.

### 3.3 Content & Support
*   **Education Hub:** A library of articles covering symptoms, prevention, nutrition, and technology in oral health.
*   **Profile Management:** Secure handling of personal data, medical IDs (e.g., OD-92831), and security preferences (Biometrics, 2FA).
*   **Help Center:** Access to medical assistance and technical support.

---

## 4. Design System: "Clinical Clarity"
The project follows the **Clinical Clarity** design language to evoke trust, precision, and hygiene.

*   **Primary Color:** Indigo/Royal Blue (#6366f1) for actions and navigation.
*   **Typography:** Inter (Sans-serif) for high readability across data-dense screens.
*   **Shape:** 8px corner radius (Round Eight) for a modern, approachable medical feel.
*   **Layout:** 
    *   **Web:** Fixed sidebar navigation with a top app bar for multi-tasking.
    *   **Mobile:** Bottom navigation bar for thumb-friendly interaction.

---

## 5. Technical Requirements
*   **Platform Support:** Responsive Web (Desktop) and Native-feel Mobile (Android).
*   **Security:** HIPAA-standard encryption for medical data.
*   **AI Integration:** Low-latency API for real-time image processing.

---

## 6. User Journey Map
1.  **Onboarding:** User registers and completes a risk-factor questionnaire.
2.  **Home:** User views their last result and decides to start a "Pemeriksaan Baru" (New Examination).
3.  **Scan:** User follows instructions to upload 4 primary oral photos.
4.  **Result:** User receives a "Risiko Rendah" (Low Risk) result with personalized health tips.
5.  **Education:** User reads an article on "5 Steps to Prevent Oral Cancer" suggested by the system.
