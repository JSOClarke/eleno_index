# InputHub (`inputhub /es`)

A Neo-Swiss brutalist **"Dense Faceted Index"** frontend for Spanish corpus-driven language acquisition, built with React 19, TypeScript, Tailwind CSS, and Supabase. Companion frontend to [`eleno_backend`](file:///c:/Users/drjopari/Documents/eleno_backend).

---

## 1. Visual & Design System ("Dense Faceted Index")
> See complete specification in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
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
│   ├── reader.api.ts          # Storage artifact manifest/chapter fetches & reading progress persistence
│   ├── sentence.api.ts        # Tokenized sentence_bank queries & i+1 RPC
│   └── vocabulary.api.ts      # User vocabulary status persistence & tracked words ledger queries
├── components/
│   ├── catalogue/             # FacetSidebar, CommandFilterBar, CatalogueTable, CatalogueCardsGrid, InlinePreviewDrawer
│   ├── inspector/             # InspectorSpecHeader, LinguisticProfileRow, ChapterPacingStrip, CanonicalPrimerTable/Row, SentenceBankDrawer/Token*
│   ├── layout/                # TopNavBar, BookCoverPlate, VocabTableSkeleton, WordContextDrawer, AuthModal
│   ├── reader/                # ReaderTopBar, ReaderBottomBar, ReaderCanvas, ReaderTokenSpan, ReaderWordDock, ReaderHighlightControls
│   └── views/                 # KnownWordsView & KnownWordRow (/known-words ledger)
├── hooks/
│   ├── useAuth.ts             # Supabase session & auth state
│   ├── useCatalogueData.ts    # 2-phase progressive catalogue loader + 0ms optimistic comprehension math
│   ├── useFacetCounts.ts      # Live cross-filtered facet counts
│   ├── useFilterState.ts      # URL/state filters, sorting, saved list, and recently viewed history
│   ├── useInspectorWordStatus.ts # Shared word/ token status toggle + optimistic book math
│   ├── useMediaInspector.ts   # Per-media vocabulary, chapter metrics, & 1.2s debounced RPC re-sync
│   ├── useReaderScroll.ts     # Viewport intersection observation & auto-resumption scrolling
│   ├── useReaderSession.ts    # Chapter loading, highlighting state, debounced Supabase progress saves
│   └── useUserVocabulary.ts   # LocalStorage-backed user_vocabulary statusMap ('known' | 'learning')
├── lib/
│   ├── coverArt.ts            # Deterministic fallback cover plates
│   ├── formatters.ts          # Number, percentage, and series/media subtype formatters
│   ├── grammarFormatters.ts   # SpaCy UD grammatical morphology formatter into natural English
│   ├── knownWordsCache.ts     # Signature-verified memory + localStorage cache for /known-words
│   ├── readerCache.ts         # IndexedDB / localStorage multi-chapter reader artifact cache
│   ├── readerHighlight.ts     # CEFR & Frequency rank color band definitions and class resolvers
│   ├── supabase.ts            # Singleton Supabase client
│   └── vocabSorting.ts        # Shared sorting & status-filtering logic for Canonical Primer & Known Words
├── pages/
│   ├── CataloguePage.tsx      # /, /saved, /history routes
│   ├── InspectorPage.tsx      # /media/:mediaId route
│   └── ReaderPage.tsx         # /read/:mediaId pre-tokenized book reader route
└── types/
    ├── filter.types.ts
    ├── media.types.ts
    ├── reader.types.ts
    ├── sentence.types.ts
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
3. **Neo-Swiss Pre-Tokenized Reader (`/read/:mediaId`)**:
   - Zero-delay reading canvas rendering pre-tokenized chapter artifacts directly from Supabase Storage.
   - **100% Token Interactivity**: Every single word is interactive; left-click opens the brutalist Word Dock; right-click toggles **Known** status instantly. Clicking in free space dismisses the dock.
   - **Static Typography & Zero Reflow**: Overhead floating hints sit in generous line headroom without stretching word kerning or causing lines to jump on toggle.
   - **Difficulty Underline Bands**: Toggleable **CEFR** (A1–C2) and **Frequency Rank** (1k–10k+) color bands with an **"Unknown only"** filter.
   - **POS-Filtered Ruby Hints**: Choose `ALL`, `NOUN`, `VERB`, `ADJ`, or `ADV`; only unknown/learning tokens matching that part of speech display an above-word hint.
   - **Persisted Reader Preferences**: Font size, Ruby toggle and POS filter, i+1 mode, underline band mode, unknown-only filter, and word-dock definition language are stored in `localStorage` and restored on the next visit.
   - **Reading Position Rail**: A sticky two-track rail shows token-weighted whole-book position and current-chapter block position, with a live playhead and a black tick for the last synced position.
   - **Word Dock**: Displays grammatical morphology (tense, mood, person, gender), IPA, source-labelled TubeLex rank, English/Spanish definition tabs, current-sentence phrase hints, native text-to-speech audio, and an expandable image strip from pluggable providers (Wikipedia by default; Pixabay when the reader supplies their own key).
   - **Debounced Progress Tracking**: Automatically records reading percentage and current chapter/block to Supabase, restoring scroll position on return. A live top-bar badge shows `NOT SYNCED`, `SAVING`, `SYNCED`, or `SAVE FAILED`.
4. **Vocabulary Ledger (`/known-words`)**:
   - Signature-cached (`0ms` repeat load) ledger of all `Known` and `Learning` canonical lemmas with `TUBELEX` / `ELELEX` toggle, `POS` & state filters, column sorting, and `<Quote />` definitions/sentences drawer.
   - **Vocabulary Packs**: Top 1k/2k/5k/10k, CEFR A1/A2/B1/B2, and a curated 429-word English Cognates pack from Paivio et al., with preview counts, additive bulk marking, preserved Learning/Ignored statuses, and undo of the last application.
5. **Open Tokenized Sentence Bank ($i+1$)**:
   - Each authentic sentence is ingested once per media item with a full token array (surface, character offsets, lemma, POS, morphology) and a GIN-indexed `canonical_ids UUID[]` array.
   - The `<Quote />` drawer renders every sentence token-by-token: Volt target word, dotted unknown words, Learning/known states, and click-through Kaikki definitions with Learn/Known toggles.
   - Segmented `All Examples | i+1 Comprehensible Only` filter calls `get_i_plus_one_sentences` to surface sentences where the target word is the only unknown.
   - Migration: [`eleno_backend/supabase/migrations/20261103090000_open_tokenized_sentence_bank.sql`](file:///c:/Users/drjopari/Documents/eleno_backend/supabase/migrations/20261103090000_open_tokenized_sentence_bank.sql).

---

## 4. Development & Build
```powershell
npm install
npm run dev      # Starts Vite dev server on http://localhost:3001
npm run build    # Runs tsc && vite build
```

Image providers are registered in `src/lib/imageProviders.ts`. Wikipedia works without credentials. Pixabay is opt-in: the reader adds their own API key from the image panel, and it is stored only in that browser's localStorage. Additional providers can be attached with `registerImageProvider(...)`.
