---
name: Clinical Clarity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#006b2d'
  on-tertiary: '#ffffff'
  tertiary-container: '#00873b'
  on-tertiary-container: '#f7fff3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built on the principles of **Clinical Clarity**—a philosophy that balances the sterile precision of medical technology with the approachable warmth of patient care. The visual language is designed to evoke trust, reliability, and calm, essential for healthcare applications where users may be feeling anxious.

The style is **Modern Corporate**, utilizing a high-degree of "Information White Space" to prevent cognitive overload. It borrows elements from **Minimalism** to ensure that diagnostic data remains the focal point, while utilizing soft transitions and subtle depth to guide the user through complex multi-step medical workflows. 

**Core Tenets:**
- **Trust through Precision:** Perfectly aligned grids and consistent iconography.
- **Accessibility First:** High contrast ratios and legible typography for all age groups.
- **Supportive Navigation:** Clear progress indicators to reduce the "black box" feeling of medical assessments.

## Colors

The palette is anchored by **Clinical Indigo**, a color that bridge the gap between traditional medical blue and modern tech purple. This primary color is used for call-to-action elements and active navigational states.

- **Primary (Indigo):** Used for primary buttons, active sidebar states, and brand-critical icons.
- **Secondary (Sky Blue):** Utilized for secondary actions and background washes to distinguish different information modules.
- **Success (Emerald):** A high-visibility green reserved for "Low Risk" results and completed steps.
- **Neutral (Slate/Gray):** A sophisticated range of grays used for typography and borders to maintain a soft, low-fatigue interface.
- **Surface:** The background uses a slightly cool off-white to reduce screen glare compared to pure #FFFFFF.

## Typography

The design system utilizes **Inter** for all layers. Its high x-height and narrow apertures make it exceptionally legible for technical data and medical terminology, even at small sizes on mobile devices.

- **Headlines:** Use a Semi-Bold (600) or Bold (700) weight with slight negative letter spacing to create a sturdy, authoritative presence.
- **Body Text:** Standardized at 14px and 16px to ensure readability for elderly users. 
- **Labels:** Uppercase styling is used sparingly for category headers and table labels to provide clear visual hierarchy without shouting.
- **Mobile Adaption:** Headlines scale down significantly to prevent awkward word breaks in narrow port-views.

## Layout & Spacing

The layout follows an **8px Linear Grid** to maintain mathematical harmony.

- **Grid System:** A 12-column fluid grid for desktop and a single-column fluid layout for mobile. On tablet, a 6-column grid is preferred.
- **Sectioning:** Content is housed in "Modules" (Cards). Large 32px padding is used within desktop cards to maintain the "Clinical" airy feel.
- **Sidebar:** On desktop, a fixed 240px sidebar is used for navigation. On mobile, this transitions to a bottom navigation bar or a hamburger menu depending on depth.
- **Margins:** Page margins are set to 24px on mobile and 48px+ on desktop to ensure content doesn't feel cramped against the bezel.

## Elevation & Depth

This design system avoids heavy shadows to maintain a flat, modern medical aesthetic. Instead, it uses **Tonal Layering** and **Soft Contours**.

- **Level 0 (Background):** The base canvas (#f8fafc).
- **Level 1 (Cards):** Surface white (#ffffff) with a 1px solid border (#e2e8f0). No shadow.
- **Level 2 (Active/Hover):** A very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to indicate interactivity or focus.
- **Modals:** Use a 20% opacity black backdrop blur to pull the user's focus during critical diagnostic confirmation steps.

## Shapes

The shape language is **Rounded**, using an 8px (0.5rem) base radius. This softens the interface, making the medical experience feel less intimidating and more user-friendly.

- **Standard Elements:** Input fields, checkboxes, and informational cards use the `rounded` (8px) token.
- **Buttons & Chips:** Use `rounded-xl` (24px or fully rounded) to create a distinct interactive silhouette that contrasts against the rectangular structure of the data cards.
- **Icons:** Should feature slightly rounded terminals and corners to match the UI's softness.

## Components

### Buttons
- **Primary:** Solid Clinical Indigo with white text. Pill-shaped.
- **Secondary:** Outlined with a 1px Indigo border or a soft blue background wash.
- **Ghost:** No border, Indigo text; used for low-priority actions like "Back" or "Cancel."

### Input Fields
- **Default State:** White background, 1px Gray-300 border. Labels are positioned above the field for clarity.
- **Focus State:** 2px Indigo border with a soft Indigo outer glow.

### Medical Progress Tracker
- A horizontal stepper on desktop, vertical on mobile.
- **Completed:** Indigo circle with a checkmark.
- **Active:** Indigo circle with a white number.
- **Inactive:** Gray outline with a gray number.

### Status Cards
- Diagnostic results are housed in cards with thick left-hand borders (4px) color-coded by status (Green for low risk, Red for high risk) to provide instant visual feedback.

### Sidebar Navigation
- Vertical stack. Active items feature a solid Indigo background with a white icon, while inactive items use gray text and transparent backgrounds.