# `index /es` — Design System & Visual Specification

> **Audience**: AI agents, engineers, and designers extending or maintaining the `eleno_index` frontend.  
> **Scope**: The complete visual language, design system, component hierarchy, and architectural axioms of the `eleno_index` ("Dense Faceted Index") application.

---

## 1. Design Ethos & Philosophy: "Neo-Swiss Brutalism meets Bibliothèque"

`index /es` is a specialized, data-dense web application for corpus-driven Spanish language acquisition. It is engineered to give serious language learners an authoritative, transparent index of real-world Spanish media (novels, TV series, movies, non-fiction) cross-referenced against their personal vocabulary acquisition ledger.

### Core Visual Principles
1. **Utilitarian Density over Decorative Fluff**:
   - Every pixel, border, and badge conveys linguistic data. There are no decorative illustrations, empty rounded bubble cards, gradients, or gamified cartoon avatars.
   - Information density is high, but disciplined: rigorous typographic scale, consistent tabular numbers, and sharp grid alignment keep it scannable and calm.
2. **High-Contrast Monochromatic Canvas**:
   - The primary canvas is high-contrast black ink (`#111111`) on pure paper (`#FFFFFF`) and architectural stone (`#F4F4F2`, `#F8F8F6`).
   - Structural boundaries are razor-sharp `1px solid #111111` or `#E2E2DF` hairlines.
3. **Single Semantic Accent — Electric Volt (`#B8FF01`)**:
   - Volt (`#B8FF01`) is strictly reserved for **pedagogical momentum and active state**:
     - Words the user is actively **Learning** (vs Known ink `#111111`).
     - The **Learning delta** cap on comprehension stacked bar charts.
     - Active command filter chips (`lime-chip`).
     - Selected interactive chapter/episode pacing bars.
     - The brand lockup mark (`/es`).
   - Never use Volt as generic decorative background filler.
4. **Authenticity & Provenance**:
   - No placeholder or fake data. All metrics, corpus rankings (TubeLex, ELELex), CEFR ratings, authentic sentence snippets, and definitions originate strictly from the backend relational schema and 127k FreeLing lexicon.

---

## 2. Color Palette & Semantic Tokens

```
Canvas / Paper:
  #FFFFFF         Pure White       Primary page background, active card interiors, table row base
  #F8F8F6         Soft Bone        Table headers, card header bars, filter container background
  #F4F4F2         Muted Stone      Secondary containers, nested panels, preview drawer backgrounds
  #E2E2DF         Hairline Rule    Secondary dividers, facet category borders, subtle row borders

Ink & Structure:
  #111111         Espresso Ink     Primary text, heavy 1px borders, solid Known progress fills, primary action buttons
  #222222         Deep Charcoal    Hover button states, dark pill tags
  #555555         Subtle Ink       Secondary labels, metadata prefixes, inactive tab text
  #666666         Muted Caption    Micro-labels, total token counts, F-H readability captions
  #888888         Facet Counter    Counts in facet sidebars, trailing metadata

Semantic Accent:
  #B8FF01         Electric Volt    Active brand mark (/es), 'Learning' vocabulary status, active filter chips, chart volt caps
  #9FE000         Volt Border      Border for active volt chips and buttons
  #000000         Pure Black       High-contrast text on Volt badges
```

### Tactile Shadows
Selected cards and hero plates utilize hard-edge brutalist offset drop-shadows rather than blurry box-shadows:
- Card Hover/Selected: `shadow-[4px_4px_0px_#111111]`
- Small Plate / Mini Cover: `shadow-[1px_1px_0px_#111111]` or `shadow-[2px_2px_0px_#111111]`
- Hero Cover: `shadow-[3px_3px_0px_#111111]`

---

## 3. Typographic Hierarchy (The Tri-Font System)

The design system strictly pairs three distinct typefaces to distinguish **UI controls**, **editorial literary prose**, and **technical corpus metrics**:

| Role | Font Family | TailWind Class | Usage Examples |
| :--- | :--- | :--- | :--- |
| **UI Sans** | `Plus Jakarta Sans`, system-ui, sans-serif | `font-sans` | Top navigation, button text, facet labels, table column headers, general UI controls. |
| **Editorial Serif** | `Newsreader`, `Georgia`, `Merriweather`, serif | `font-serif` | Book and media titles, authentic literary sample snippets, quote blocks, Kaikki glosses. |
| **Technical Mono** | `JetBrains Mono`, `ui-monospace`, monospace | `font-mono` | CEFR badges (`A2`, `B1`), corpus ranks (`#4820`), word counts (`79.4k`), percentages (`89%`), search input, debut chapter badges. |

### Font Sizes & Micro-Typography
- **Tabular Numerals**: Always apply `font-mono tabular-nums` to numbers, counts, and percentages so column figures align vertically without horizontal jitter.
- **Micro-Labels**: `font-mono text-xs uppercase tracking-wider text-[#666666]` for section eyebrows (e.g. `01 / READING FLOW`, `NEW WORDS FOR YOU`, `DEBUT CHAPTER`).

---

## 4. Comprehension Metrics & Stacked Visualization

A core pedagogical insight of `index /es` is that language comprehension cannot be collapsed into a single vanity percentage. The UI separates comprehension into two independent axes and visualizes them using a distinct stacked bar pattern:

### 4.1 The Two Independent Comprehension Axes
1. **Reading Flow % (`text_coverage_percentage`)**:
   - Percentage of total running word occurrences in the text that the user knows.
   - Measures immediate reading comfort and fluency (e.g. 95%+ enables painless extensive reading).
2. **Vocab Mastery % (`comprehension_percentage`)**:
   - Percentage of unique canonical dictionary headwords in the media that the user knows.
   - Measures absolute vocabulary acquisition breadth.

### 4.2 The Cumulative Known + Learning Stacked Bar
Whenever comprehension is displayed (in Catalogue cards, Catalogue table rows, and the Inspector header), it renders as a cumulative dual-tone stacked bar:
- **Base Layer (Known)**: Solid `#111111` ink width = `knownPct%`.
- **Top Cap (Learning)**: Electric Volt `#B8FF01` width = `learningPct%` (stacked immediately adjacent to the known bar, with a subtle border divider).
- **Delta Badge**: When `learningPct > 0`, an explicit Volt chip renders alongside the number: `+3.4% learn` (computed without clipping via `formatLearningDelta`).

```html
<!-- Example Dual-Tone Stacked Bar -->
<div class="w-full h-2.5 border border-[#111111] bg-white flex overflow-hidden">
  <div class="h-full bg-[#111111]" style="width: 82%"></div>
  <div class="h-full bg-[#B8FF01] border-l border-[#111111]/40" style="width: 6%"></div>
</div>
```

---

## 5. Core Layouts & Component Patterns

### 5.1 Top Navigation Bar (`TopNavBar.tsx`)
- Sticky top header (`h-14 bg-white border-b border-[#E2E2DF]`).
- Brand lockup: `index` (black bold sans) + `/es` (Volt `#B8FF01` badge with `#111111` bold mono text).
- Primary tabs:
  - `Catalogue`
  - `Saved (n)`
  - `History`
  - `Known words (n)` (direct link to the `/known-words` ledger)
- Right metadata: `Spanish · target level B1 · [127k Dictionary RO] · User profile / Sign in`.

### 5.2 Command Filter Bar (`CommandFilterBar.tsx`)
- High-contrast command bar at the top of the catalogue (`border border-[#111111] bg-white px-3.5 py-2.5`).
- Prefix: Monospace `/` symbol.
- Active filters rendered as Volt chips (`bg-[#B8FF01] border border-[#9fe000] text-[#111111] font-mono text-xs px-2.5 py-0.5`) with an interactive `×` removal button.
- Clean text input allowing instant keyword search across titles, creators, and vocabulary words.
- Trailing `clear all` link when filters are active.

### 5.3 Facet Sidebar (`FacetSidebar.tsx`)
- Standardized 210px left sidebar with clear category dividers (`border-b border-[#E2E2DF] pb-1.5 mb-2.5`).
- Native checkboxes with `accent-color: #111111`.
- Clean label + trailing tabular count (`tabular-nums text-[#888888]`).
- Facet categories:
  - `LEVEL`: CEFR levels (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
  - `TYPE`: Media types (`Reader / book`, `Short story`, `Lore / guide`, `TV Series`, `Movie`).
  - `COMPREHENSION`: Flow brackets (`95%+ High flow`, `90-95% Target`, `<90% Challenging`).
  - `LENGTH`: Word count / duration buckets (`<25k words`, `25k-80k words`, `80k+ words`, `<45 min`, `45-90 min`, `90+ min`).
  - `LINGUISTIC PROFILE`: Special corpus facets (`High dialogue 20%+`, `High readability F-H 70+`, `Low subjunctive <2%`).

### 5.4 Catalogue Card (`CatalogueCard.tsx`)
- Container: `border border-[#111111] bg-white flex flex-col justify-between`.
- Top metadata ribbon: `bg-[#F8F8F6] border-b border-[#111111]` showing Subtype (`NOVEL · VOL. 1`) · Creator, with white boxed badges for `CEFR Level` and `F-H readability score`.
- Body:
  - Hero thumbnail (`BookCoverPlate`).
  - Serif title (bold link to `/media/:mediaId`).
  - Total tokens, dialogue speed / ratio, and subjunctive percentage.
  - Stacked Known + Learning Flow bar.
  - Authentic literary quote snippet in serif italic.
  - `NEW WORDS FOR YOU`: Up to 6 interactive word chips showing `lemma` + frequency. Clicking any chip toggles its status instantly (`0ms`).
- Footer: Unique lemmas count, `Save` button, and `Inspect →` primary action button.

### 5.5 Media Inspector (`InspectorPage.tsx`)
Mounted at `/media/:mediaId`, the Inspector serves as the deep analytical cockpit for a specific work:

1. **`InspectorSpecHeader.tsx`**:
   - Hero cover plate with CEFR badge.
   - Reading Flow % and Vocab Mastery % dual gauges with learning volt chips.
   - Readability score (Fernández-Huerta / Flesch-Szigriszt) and dialogue or WPM speed.
2. **`LinguisticProfileRow.tsx`**:
   - Context-adaptive technical spec boxes.
   - For Books: `Dialogue Ratio`, `Coverage 90%/95%/98% Lemmas`, `Verb Profile` (Subjunctive load, Past tense density).
   - For TV Shows & Movies: `Speaking Speed (WPM)`, `Speech Density %`, `Active Speaking Time vs Runtime`.
3. **`ChapterPacingStrip.tsx`**:
   - Interactive SVG/Canvas bar chart mapping every chapter or episode across the work.
   - Bar height = chapter word count / length.
   - Bar fill = Known Flow % (ink `#111111`) + Learning Flow % (volt `#B8FF01`).
   - Clicking any bar sets the chapter filter, immediately scoping the vocabulary primer table below to words debuting in that specific chapter/episode.
4. **`CanonicalPrimerTable.tsx` & `CanonicalPrimerRow.tsx`**:
   - Comprehensive tabular ledger of all canonical headwords in the work.
   - Filters: State (`ALL`, `UNKNOWN`, `LEARNING`, `KNOWN`), Part of Speech (`NOUN`, `VERB`, `ADJ`, `ADV`), Search.
   - Sortable Columns: `LEMMA`, `IPA`, `POS`, `CEFR`, `FREQ`, `TUBELEX / ELELEX` ranking, `DEBUT CHAPTER`.
   - Actions: 3-state toggle buttons (`Learn`, `Known`) with immediate optimistic visual updates.
   - **`<Quote />` Word Context Drawer**: Clicking the quote icon expands an inline drawer displaying authentic Kaikki English glosses and example sentences from `sentence_bank`.
5. **`QuarantineGrid.tsx`**:
   - Authoritative breakdown of quarantined tokens filtered out from trackable vocabulary, split into:
     - `Proper Nouns & Characters` (e.g. *Harry*, *Dobby*, *Hagrid*).
     - `Noise, Typo & Slang Interjections` (e.g. *psss*, *aaah*, *cloc*).

### 5.6 Vocabulary Ledger (`KnownWordsView.tsx`)
Mounted at `/known-words`:
- Personal vocabulary ledger listing all words marked `Known` or `Learning` by the user.
- Signature-verified caching in `localStorage` for `0ms` instantaneous loading.
- Includes the full primer table functionality: searching, POS filtering, TubeLex/ELELex corpus rank toggles, and expandable definition/sentence drawers.

---

## 6. Interaction & State Axioms for AI Coding Assistants

When extending or maintaining `eleno_index`, all code must comply with these engineering rules:

1. **Strict `<= 150` Lines Per File Ceiling**:
   - Every file in `src/` must remain strictly `<= 150` lines.
   - If a component or hook grows near the limit, split sub-components (e.g. row components, drawers, helper hooks, or formatters) into separate files.
2. **Strict API & Supabase Boundary**:
   - Never import `@supabase/supabase-js` or `@/lib/supabase` outside `src/lib/supabase.ts` and `src/api/*.api.ts`.
   - Components and hooks must always consume domain APIs from `@/api/*.api.ts`.
3. **`BIGINT` & `NUMERIC` Coercion**:
   - Postgres `BIGINT` and `NUMERIC` fields returned by Supabase RPCs must always be coerced via `Number()` inside `src/api/normalizers.ts` before reaching React state.
4. **Optimistic UI with Debounced Reconciliation**:
   - When the user toggles a word (`Learn` or `Known`):
     - Update local cache (`useUserVocabulary.statusMap`) immediately (`0ms`).
     - Optimistically recompute catalogue comprehension percentages.
     - Reconcile with Supabase RPC via a debounced background call (`1.2s`) to prevent rate-limiting or UI stutter.
5. **Zero Hardcoded Mock Data**:
   - All media items, titles, cover URLs, metrics, and definitions must be driven strictly by live Supabase relational tables. Fallback placeholders (like `coverArt.ts`) must only generate deterministic CSS plates when external cover images are null.
