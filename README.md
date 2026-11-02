# Eleno Index (`index /es`)

A Neo-Swiss brutalist **"Dense Faceted Index"** frontend for Spanish corpus-driven language acquisition, built with React 19, TypeScript, Tailwind CSS, and Supabase. Companion frontend to [`eleno_backend`](file:///c:/Users/drjopari/Documents/eleno_backend).

---

## 1. Visual & Design System ("Dense Faceted Index")
- **Palette**: Pure paper (`#FFFFFF`), structural stone (`#F4F4F2` / `#F8F8F6`), crisp `1px solid #111111` ink hairlines, and electric volt (`#B8FF01`) accents for active states and comprehension highlights.
- **Typography**: `Plus Jakarta Sans` (body), `Newsreader` (editorial headings), `JetBrains Mono` (tabular metrics, CEFR badges, IPA, and corpus ranks).

---

## 2. Directory & Module Architecture (All Files Strictly `<= 150` Lines)

```
src/
├── api/
│   ├── catalogue.api.ts       # Base media_item + media_work + media_metrics fetch & RPC batch enrichment
│   ├── inspector.api.ts       # Media vocabulary, chapter comprehension, quarantine, & sentence_bank queries
│   ├── normalizers.ts         # BIGINT/NUMERIC -> Number() coercion at the API boundary
│   └── vocabulary.api.ts      # User vocabulary status persistence & tracked words ledger queries
├── components/
│   ├── catalogue/             # FacetSidebar, CommandFilterBar, CatalogueTable, CatalogueCardsGrid, InlinePreviewDrawer
│   ├── inspector/             # InspectorSpecHeader, LinguisticProfileRow, ChapterPacingStrip, CanonicalPrimerTable/Row
│   ├── layout/                # TopNavBar, BookCoverPlate, VocabTableSkeleton, WordContextDrawer, AuthModal
│   └── views/                 # KnownWordsView & KnownWordRow (/known-words ledger)
├── hooks/
│   ├── useAuth.ts             # Supabase session & auth state
│   ├── useCatalogueData.ts    # 2-phase progressive catalogue loader + 0ms optimistic comprehension math
│   ├── useFacetCounts.ts      # Live cross-filtered facet counts
│   ├── useFilterState.ts      # URL/state filters, sorting, saved list, and recently viewed history
│   ├── useMediaInspector.ts   # Per-media vocabulary, chapter metrics, & 1.2s debounced RPC re-sync
│   └── useUserVocabulary.ts   # LocalStorage-backed user_vocabulary statusMap ('known' | 'learning')
├── lib/
│   ├── coverArt.ts            # Deterministic fallback cover plates
│   ├── formatters.ts          # Number, percentage, and series/media subtype formatters
│   ├── knownWordsCache.ts     # Signature-verified memory + localStorage cache for /known-words
│   ├── supabase.ts            # Singleton Supabase client
│   └── vocabSorting.ts        # Shared sorting & status-filtering logic for Canonical Primer & Known Words
├── pages/
│   ├── CataloguePage.tsx      # /, /saved, /history routes
│   └── InspectorPage.tsx      # /media/:mediaId route
└── types/
    ├── filter.types.ts
    ├── media.types.ts
    └── vocabulary.types.ts
```

---

## 3. Key Features
1. **Catalogue Index (`/`, `/saved`, `/history`)**:
   - Table view & Card Grid view with live faceted filtering (Media Type, CEFR Level, Comprehension Bracket, Length/Word Count, Reading Flow %).
   - Expandable **Inline Preview Drawer** showing synopsis, top unknown content lemmas (`get_user_media_preview_words`), and 1-click `Mark Known`.
2. **Media Details Inspector (`/media/:mediaId`)**:
   - **Linguistic Profile Row**: Adaptive metrics for Books (`Dialogue Ratio`, `Coverage 90%/95%/98%`, `Verb Profile`) vs Movies & TV Series (`Speaking Speed WPM`, `Speech Density %`, `Active Speaking Time / Total Runtime`).
   - **Chapter / Episode Pacing Strip**: Interactive cumulative stacked bar chart where outline height = chapter/episode length, solid ink (`#111111`) = Known Flow %, and stacked volt cap (`#B8FF01`) = Learning Flow %. Clicking any bar filters the Canonical Primer Table to words debuting in that chapter/episode.
   - **Canonical Primer Table**:
     - Filter by word state (`ALL`, `UNKNOWN`, `LEARNING`, `KNOWN`), `POS`, and search query.
     - Sort by `LEMMA`, `POS`, `CEFR`, `FREQ`, `TUBELEX / ELELEX` rank, or `DEBUT CHAPTER / EPISODE`.
     - Expandable `<Quote />` **Word Context Drawer** displaying numbered Kaikki English definitions (`0ms`) alongside authentic sentences from `sentence_bank`.
3. **Vocabulary Ledger (`/known-words`)**:
   - Signature-cached (`0ms` repeat load) ledger of all `Known` and `Learning` canonical lemmas with `TUBELEX` / `ELELEX` toggle, `POS` & state filters, column sorting, and `<Quote />` definitions/sentences drawer.

---

## 4. Development & Build
```powershell
npm install
npm run dev      # Starts Vite dev server on http://localhost:3001
npm run build    # Runs tsc && vite build
```
