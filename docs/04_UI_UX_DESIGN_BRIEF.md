# Document 04 — UI/UX Design Brief & Visual Interaction Guide

**System Name:** Agricultural Crop Insurance and Loss Assessment System  
**Document Version:** 1.0  
**Design Philosophy:** Modern Enterprise, High Trust, Accessible & Responsive  

---

## 1. Design Philosophy & Overall Aesthetic

The Agricultural Crop Insurance portal is designed for high trustworthiness, efficiency, and clarity across diverse user personas—ranging from farmers using mobile devices in rural fields to insurance managers and state officers operating complex desktop dashboards.

### Aesthetic Highlights
* **Vibe:** Modern Agri-Tech SaaS (inspired by Linear, Vercel, and modern gov-tech portals).
* **Theme:** Dark Mode Primary (#0F172A slate background) with crisp high-contrast light mode toggle.
* **Layout Grid:** Dynamic 12-column CSS Grid (1-column on mobile `< 768px`, 2-column on tablet, 3-column / 4-column on desktop `> 1024px`).
* **Visual Hierarchy:** Bold geometric headers, subtle glowing glassmorphic cards (`backdrop-blur-md`), status indicator pills, and clear visual indicators for operational states.

---

## 2. Color System & Typography

### Color Palette (Design Tokens)

```css
:root {
  /* Brand Colors */
  --color-primary: #10B981;        /* Emerald Green (Growth & Security) */
  --color-primary-hover: #059669;  /* Dark Emerald */
  --color-accent: #6366F1;         /* Indigo (Tech & Trust) */
  --color-warning: #F59E0B;        /* Amber Gold (Pending Review / Claim Filed) */
  --color-danger: #EF4444;         /* Crimson Red (Rejections / SLA Breaches) */
  --color-info: #3B82F6;           /* Sky Blue (Survey Assigned) */

  /* Neutral Dark Theme */
  --bg-main: #0F172A;              /* Slate 900 */
  --bg-card: #1E293B;              /* Slate 800 */
  --bg-input: #334155;             /* Slate 700 */
  --border-color: #334155;         /* Subtle card border */

  /* Typography */
  --text-primary: #F8FAFC;        /* Slate 50 */
  --text-secondary: #94A3B8;      /* Slate 400 */
  --text-muted: #64748B;          /* Slate 500 */
}
```

### Typography Hierarchy
* **Primary UI Font:** `'Inter'`, `'Plus Jakarta Sans'`, sans-serif (Clean legibility at all font sizes).
* **Monospace Code/ID Font:** `'JetBrains Mono'`, `'Fira Code'`, monospace (For Policy IDs, Loss Notification IDs, Geo-coordinates, and DBT UTR numbers).
* **Scale:**
  * `H1 (Page Titles):` 32px / 2.25rem, SemiBold (600)
  * `H2 (Section Headers):` 24px / 1.5rem, SemiBold (600)
  * `H3 (Card Titles):` 18px / 1.125rem, Medium (500)
  * `Body Text:` 14px / 0.875rem, Regular (400)
  * `Caption / Labels:` 12px / 0.75rem, Medium (500)

---

## 3. UI Component System & Patterns

### 1. Status Badges & Pills
Operational statuses feature distinct color coding with subtle background tints:
* `ENROLLED / ACTIVE:` Green Pill (`bg-emerald-900/50 text-emerald-300 border-emerald-700`)
* `SUBMITTED / UNDER_REVIEW:` Yellow Pill (`bg-amber-900/50 text-amber-300 border-amber-700`)
* `SURVEYOR_ASSIGNED:` Blue Pill (`bg-blue-900/50 text-blue-300 border-blue-700`)
* `APPROVED / PAID:` Emerald Glow Pill (`bg-emerald-500/20 text-emerald-400 border-emerald-500`)
* `REJECTED / LAPSED:` Red Pill (`bg-red-900/50 text-red-300 border-red-700`)

### 2. Form Inputs & Live Validation
* **Default State:** Dark slate background, 1px border (`#334155`), 8px border radius (`rounded-lg`).
* **Focus State:** 2px glowing primary green focus ring (`ring-2 ring-emerald-500`).
* **Error State:** Red border (`border-red-500`) with instant inline helper text:
  * Name field: *"Name must contain alphabetic characters and spaces only"*
  * Phone field: *"Phone Number must be exactly 10 digits long"*
* **Buttons:** Primary CTA buttons feature a subtle gradient (`bg-gradient-to-r from-emerald-500 to-teal-600`), smooth hover transform (`hover:scale-[1.02] active:scale-[0.98]`), and loading state spinners.

### 3. Metric KPI Cards (Dashboard.jsx)
```
+-------------------------------------------------------+
|  TOTAL CLAIMS DISBURSED                              |
|  ₹ 14,85,00,000                      [ +12.4% MoM ]   |
|  ---------------------------------------------------  |
|  9,420 Farmers Benefitted  |  Avg Settlement: 4.2 Days|
+-------------------------------------------------------+
```

---

## 4. Role-Specific UX Guidelines

### Farmer View
* **Simplicity First:** Minimal clutter, large touch targets (minimum 48px height), prominent "File Loss Claim" action card.
* **Geo-Location Integration:** Interactive map widget displaying current GPS coordinates (`Lat`, `Lng`) automatically filled when capturing crop damage photos.

### Surveyor Field View
* **Mobile-Optimized:** Optimized for 360px–430px smartphone viewports with offline-aware sync indicator.
* **Camera Integration:** One-tap photo upload container supporting up to 5 loss assessment photos with instant compression and preview.

### Insurance & State Officer Dashboard
* **Data Density:** Rich data tables with column sorting, filter drawer (by season, crop, district, status), batch approval buttons, and PDF report export actions.
* **Modal Dialogs:** Side-by-side comparison modal displaying Farmer Loss Notification vs Surveyor Yield Assessment for quick actuarial verification.

---

## 5. Accessibility & Responsiveness Checklist

* **WCAG 2.1 Level AA Compliance:** High contrast ratios (minimum 4.5:1 for body text, 3:1 for headers).
* **Keyboard Navigation:** Full `Tab` focus ring support across all interactive inputs, buttons, and modals.
* **Screen Reader Support:** Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) with explicit `aria-label` attributes on icons and control buttons.
* **Responsive Breakpoints:**
  * Mobile: `360px - 767px`
  * Tablet: `768px - 1023px`
  * Desktop: `1024px - 1440px+`
