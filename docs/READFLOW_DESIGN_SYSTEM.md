# Readflow / Threshold Design System Philosophy

## 1. Core Aesthetic
**Flat Editorial Print meets Corpus Telemetry.**
Instead of SaaS shadows, gradients, or heavy card chrome, depth is created strictly through:
- **Crisp `1px` hairlines** (`#ECECEF`)
- **Generous rounded geometry** (`rounded-3xl` / `24px` outer cards, `rounded-2xl` / `16px` inner panels, `rounded-xl` / `12px` controls)
- **Stark typographic contrast** pairing condensed editorial serif display type with geometric sans-serif UI labels.

---

## 2. Color Tokens
| Role | Hex | Usage |
| :--- | :--- | :--- |
| **Canvas** | `#FAFAFA` | Primary page background + subtle `44px` architectural grid on hero |
| **Surface** | `#FFFFFF` | Cards, inputs, inspector tables, filter bars |
| **Ink** | `#040404` | Primary headlines, active pills, primary CTA buttons, progress bars |
| **Muted** | `#5A595C` | Metadata labels, author names, secondary descriptions |
| **Hairline** | `#ECECEF` | `1px` structural borders & horizontal/vertical dividers |
| **Lime** | `#E2F59B` | Ready/effortless (`95%+`) badges, active focus highlights |
| **Lavender** | `#D8D6FA` | Corpus tags, `learning` word tokens, stretch readiness bands |
| **Periwinkle** | `#9A99F6` | Telemetry dots, sub-95% progress bars, unknown count highlights |
| **Blush** | `#F3E1E6` | `unknown` word tokens, intensive study bands |

---

## 3. Typography Hierarchy
- **Display Serif (`Instrument Serif`)**:
  - Used for page headlines (`42px–86px`), book titles (`30px–44px`), and hero numeric readouts (`32px–48px` coverage %).
  - Tight tracking (`-0.025em`) and tight leading (`0.96–1.0`).
- **UI Sans (`Plus Jakarta Sans`)**:
  - Used for navigation, buttons, filter pills, table rows, and metadata (`11px–14px`, `font-semibold` / `font-extrabold`).
  - Uppercase `10px–11px` `tracking-wider` muted labels above bold numeric values.

---

## 4. Signature Components
1. **`.lexya-btn` CTA**: Solid `#040404` button (`rounded-xl`, `6px 6px 6px 14px` padding) housing a crisp `24x24` white inner square (`rounded-[7px]`) with a diagonal arrow icon.
2. **`.poster-frame`**: Dark `#09090B` full-bleed cover container with a subtle `6px` radial halftone grain overlay, top-left frosted `LANG · FORMAT` pill, and bottom-left Lime/Lavender CEFR/readiness badge.
3. **Hairline Telemetry Strip**: `grid divide-x divide-[#ECECEF]` displaying 4 compact metrics (`Tokens`, `Lemmas`, `Hapax`, `Avg Sent.`).
4. **Interactive Token Pills**:
   - **Known**: Plain ink text, subtle hover highlight.
   - **Learning (`.token-target`)**: Lavender `#D8D6FA` background with solid `#040404` bottom underline.
   - **Unknown (`.token-unknown`)**: Blush `#F3E1E6` background with dashed `#040404` bottom underline.
5. **Stroke-Free Pastel Pills & Zonal Cards**:
   - Colored pastel pills (`#E2F59B`, `#D8D6FA`, `#F3E1E6`) and zonal cards have **no outer border stroke** — color contrast alone defines them.
   - Poster frames sit flush against their content panel with no vertical divider border between image and text.
6. **Header & Navigation**:
   - Uses the Readflow wave-swallow icon badge + `readflow` wordmark with tilted periwinkle `f`, paired with Threshold's core navigation (`Catalogue`, `Saved`, `Known Words` with Lavender count badge), language selector, and `.lexya-btn` Sign-in CTA.

