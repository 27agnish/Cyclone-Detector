---
name: Obsidian Telemetry
colors:
  surface: '#0e131e'
  surface-dim: '#0e131e'
  surface-bright: '#343945'
  surface-container-lowest: '#090e18'
  surface-container-low: '#171c26'
  surface-container: '#1b202a'
  surface-container-high: '#252a35'
  surface-container-highest: '#303540'
  on-surface: '#dee2f1'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dee2f1'
  inverse-on-surface: '#2c303c'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#a8ffd2'
  on-tertiary: '#003824'
  tertiary-container: '#5be9ad'
  on-tertiary-container: '#006645'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0e131e'
  on-background: '#dee2f1'
  surface-variant: '#303540'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.05em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system embodies an authoritative, mission-critical command-and-control intelligence platform. Engineered for meteorological tacticians, maritime routing directors, and disaster-response commanders, the interface projects absolute precision, calm authority, and high-stakes clarity under duress.

The visual direction merges **High-Contrast Dark Command** with **Tactical Glassmorphism**:
- Deep obsidian and abyssal oceanic navy foundations create zero-fatigue observation environments for continuous 24/7 monitoring.
- High-luminance spectral accents (electric cyan, atmospheric emerald, storm warning amber, and kinetic cyclone crimson) provide immediate cognitive hierarchy and situational triage.
- Laser-focused micro-glows, calibrated telemetry borders, and translucent composite panels echo precision heads-up instrumentation (HUD) without visual clutter or decorative bloat.

## Colors
The color architecture relies on a luminous-on-abyssal structure designed to maximize legibility and visual urgency:

- **Primary Canvas & Surfaces**: Deep midnight navy `#030712` (void background), `#090e18` (recessed canvas / card baseline), and `#0b1528` (elevated telemetry panels and HUD overlays).
- **Primary & Secondary Dynamics (`#00e5ff` / `#38bdf8`)**: Electric cyan and aerial azure anchor primary state indications, vector trajectories, radar sweeps, active system links, and interactive focal points.
- **Meteorological Semantic Accents**:
  - Safe / Telemetry Nominal: `#10b981` (Luminous Radar Emerald)
  - Atmospheric Disturbance / Advisory: `#f59e0b` (Kinetic Warning Amber)
  - High-Risk Cyclone / Critical Intercept: `#ff3366` to `#ef4444` (Neon Crimson / Category Hazard)
- **Neutral Boundaries & Typography**: High-contrast cold white `#f8fafc` for primary data, `#94a3b8` for tertiary labeling, and hair-line border channels rendered in `rgba(56, 189, 248, 0.14)` to maintain architectural boundaries without visual noise.

## Typography
The typographic hierarchy merges mathematical rigor with instant optical recognition:

- **Space Grotesk** commands display titles, cyclone category counters, and major panel headers. Its geometric personality and technical incisions reinforce engineering precision.
- **Inter** provides neutral, distortion-free structural prose, ensuring analytical readability across complex tabular data and real-time situational briefs.
- **JetBrains Mono** governs all dynamic metrics, coordinates, pressure readings, barometric telemetry, and pill badge indicators. Tabular numerals maintain columnar alignment across real-time data streams.

## Layout & Spacing
The layout follows a modular 12-column grid engine tuned for multi-screen operations, responsive command dashboards, and split-screen geospatial visualization:

- **Desktop (1440px+)**: Multi-pane command view featuring fixed-dock telemetry sidebars, variable-span central radar displays (6–8 columns), and contextual right-side tactical panels (4 columns). Standard gutter is `1.5rem` (`gutter-md`) with `3rem` canvas margins.
- **Tablet (768px – 1439px)**: Flexibly collapses secondary telemetry below primary tracking maps into an 8-column layout. Gutter scales to `1rem` with `2rem` margins.
- **Mobile (Below 768px)**: Stacks into a unified 4-column flow with persistent top-tier alert bars, full-width geospatial viewports, and modal-based telemetry sheets. Outer margins compress to `1rem`.

## Elevation & Depth
Depth is constructed through back-lit atmospheric translucency and tinted edge-refraction rather than conventional diffuse drop-shadows:

- **Level 0 (Abyss)**: The base environment (`#030712`) acts as the absolute bottom canvas.
- **Level 1 (Sub-Panel / Canvas Card)**: Background `rgba(9, 14, 24, 0.75)` combined with `backdrop-filter: blur(16px)` and a subtle interior border `1px solid rgba(56, 189, 248, 0.12)`.
- **Level 2 (Active Console & Modals)**: Background `rgba(11, 21, 40, 0.85)` with `backdrop-filter: blur(24px)`, framed by `1px solid rgba(0, 229, 255, 0.28)` and elevated by an atmospheric ambient glow `box-shadow: 0 0 32px -8px rgba(0, 229, 255, 0.18)`.
- **Level 3 (Tactical Threat Overlays & Critical Alerts)**: High-luminance tinted borders (crimson `rgba(255, 51, 102, 0.5)` or warning amber `rgba(245, 158, 11, 0.5)`) paired with concentrated peripheral halos `box-shadow: 0 0 24px -4px rgba(255, 51, 102, 0.35)`.

## Shapes
A disciplined balanced geometry (`roundedness: 2`) underpins all UI elements:

- Standard structural panels, modular cards, and alert containers employ `0.5rem` (8px) corners, presenting clean, technical containment.
- Larger map viewports and composite operational blocks utilize `rounded-lg` (`1rem`) to soften high-density displays.
- Floating command widgets and status alerts use `rounded-xl` (`1.5rem`).
- Telemetry indicators, category badges, risk tags, and action triggers adopt pill-shaped geometry (`rounded-full`), visually distinguishing tactical status chips from structural containers.

## Components

### Buttons & Triggers
- **Primary Kinetic**: Electric cyan background (`#00e5ff`) with dark obsidian text (`#030712`), semibold weight, paired with an intense ambient backlight (`box-shadow: 0 0 20px rgba(0, 229, 255, 0.4)`). On hover, brightness escalates with a zero-delay transition.
- **Tactical Ghost**: Transparent fill, hair-line border `rgba(56, 189, 248, 0.3)`, text in `#38bdf8`. Hover triggers a translucent cyan wash (`rgba(0, 229, 255, 0.08)`) and border glow.
- **Critical / Threat Trigger**: Neon crimson fill (`#ff3366`) with crisp white typography, wrapped in a pulsing emergency halo (`rgba(255, 51, 102, 0.3)`).

### Telemetry Badges & Chips
- Designed as condensed pill-badges with uppercase monospaced labels (`JetBrains Mono`, `label-sm`).
- Incorporates a live animated status beacon (3px glowing circle) on the leading edge:
  - *Nominal*: Emerald green glow (`#10b981`).
  - *Advisory*: Pulsing amber glow (`#f59e0b`).
  - *Critical Hurricane*: Fast strobe neon crimson (`#ff3366`).

### Input Fields & Controls
- Low-profile inputs set on `rgba(9, 14, 24, 0.8)` with a `1px` crisp border in `rgba(56, 189, 248, 0.2)`.
- Active focus ignites a cyan border (`#00e5ff`) and a tight inner neon bleed (`box-shadow: inset 0 0 8px rgba(0, 229, 255, 0.15)`). Placeholders sit in muted slate (`#475569`).

### Telemetry Cards & HUD Panels
- Translucent obsidian glass surfaces with subtle radial gradients radiating from upper borders.
- Top-right panel metadata displays coordinates or refresh intervals in `label-sm`.
- Dividers within cards are single-pixel fissures rendered in `rgba(56, 189, 248, 0.08)`.

### Risk Gauges & Vortex Meters
- Concentric circular meters and gradient progress bars utilizing directional sweeps from luminous emerald (`#10b981`) through warning amber (`#f59e0b`) to neon crimson (`#ff3366`).
- Integrated vector ticks and degree marks rendered in tabular JetBrains Mono.