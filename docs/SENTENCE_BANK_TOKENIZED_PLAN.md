# Implementation Plan: Open Tokenized Sentence Bank & Mathematical $i+1$ Harvesting

**Status**: Ready for AI / Developer Execution  
**Target Architecture**: Supabase (PostgreSQL 15+), Python Pipeline (`eleno_backend`), React 19 Frontend (`eleno_index`)  
**Design System**: Neo-Swiss Green (`#B8FF01` Volt accent, `#111111` black ink, `#FFFFFF`/`#F8F8F6` canvas)

---

## 1. Executive Summary & Architectural Motivation

### Current Bottlenecks (Legacy `sentence_bank`)
* **Single-Word Coupling**: Each row in `sentence_bank` is anchored to a single `canonical_id`. If a sentence contains three interesting words (*casa*, *perro*, *correr*), the database only links it to the single word that triggered the harvest.
* **Blind to Surrounding Complexity**: Because the database only knows about one word per sentence, it cannot evaluate sentence comprehension or calculate whether a sentence represents **$i+1$ comprehensible input** without dynamically re-parsing and re-lemmatizing raw text on the fly.
* **Duplication**: The same sentence may be inserted multiple times for different words.

### The New Architecture: Open, Tokenized Sentence Bank
1. **First-Class Sentences**: A sentence is ingested once per media item.
2. **GIN-Indexed Canonical Array (`canonical_ids UUID[]`)**:
   Contains every canonical lexical entity ID present in the sentence. With a PostgreSQL GIN index, queries finding all sentences containing any word $X$ execute in $O(1)$ time.
3. **Rich Token JSONB (`tokens JSONB`)**:
   Stores the full array of tokens with exact character start/end offsets, canonical headword IDs, surface text, UPOS tags, and morphological descriptors.
4. **Mathematical $i+1$ Querying**:
   In second-language acquisition (Krashen), an **$i+1$ sentence** contains **exactly one** unknown word, with all other words known to the learner. With `canonical_ids UUID[]` and a user's known vocabulary IDs, $i+1$ candidate sentences can be identified instantly at the database layer via PostgreSQL set operations:
   $$\text{Unknown Words in Sentence} = \text{canonical\_ids} \setminus \text{user\_known\_ids} = \{\text{target\_word}\}$$

---

## 2. Database Schema & Migration Specification

> **Immutability Rule**: Never edit existing migration files in-place. Create a new, sequentially timestamped migration file.

### Migration File: `supabase/migrations/20261103090000_open_tokenized_sentence_bank.sql`

```sql
-- Migration: Upgrade sentence_bank to open tokenized JSONB with GIN indexing
-- Description: Adds canonical_ids UUID[] and tokens JSONB to sentence_bank,
-- creates GIN indexing, and defines an atomic i+1 query RPC.

-- 1. Upgrade sentence_bank schema
ALTER TABLE public.sentence_bank
  ADD COLUMN IF NOT EXISTS canonical_ids UUID[] DEFAULT '{}'::UUID[],
  ADD COLUMN IF NOT EXISTS tokens JSONB DEFAULT '[]'::JSONB;

-- Make canonical_id nullable so sentences can exist independently of a single target word
ALTER TABLE public.sentence_bank
  ALTER COLUMN canonical_id DROP NOT NULL;

-- 2. Drop legacy restrictive unique constraint if present
ALTER TABLE public.sentence_bank
  DROP CONSTRAINT IF EXISTS sentence_bank_canonical_id_sentence_key;

-- 3. Add composite unique constraint per media item and sentence text
ALTER TABLE public.sentence_bank
  ADD CONSTRAINT sentence_bank_media_sentence_key UNIQUE (media_item_id, sentence);

-- 4. Create GIN index on canonical_ids for ultra-fast subset/containment queries
CREATE INDEX IF NOT EXISTS idx_sentence_bank_canonical_ids_gin
  ON public.sentence_bank USING GIN (canonical_ids);

CREATE INDEX IF NOT EXISTS idx_sentence_bank_media_item_id
  ON public.sentence_bank (media_item_id);

-- 5. Define RPC: get_i_plus_one_sentences
-- Finds sentences containing target_canonical_id where the user knows all other words in the sentence
CREATE OR REPLACE FUNCTION public.get_i_plus_one_sentences(
    p_user_id UUID,
    p_canonical_id UUID,
    p_media_item_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    media_item_id UUID,
    sentence TEXT,
    token_count INT,
    source_context TEXT,
    canonical_ids UUID[],
    tokens JSONB,
    unknown_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_known_ids UUID[];
BEGIN
    -- Fetch array of user's known canonical IDs
    SELECT COALESCE(array_agg(canonical_id), '{}'::UUID[])
    INTO v_known_ids
    FROM public.user_vocabulary
    WHERE user_id = p_user_id AND status = 'known';

    RETURN QUERY
    WITH candidate_sentences AS (
        SELECT
            sb.id,
            sb.media_item_id,
            sb.sentence,
            sb.token_count,
            sb.source_context,
            sb.canonical_ids,
            sb.tokens,
            -- Calculate count of unknown words in this sentence
            (
                SELECT count(*)::INT
                FROM unnest(sb.canonical_ids) AS cid
                WHERE cid != p_canonical_id
                  AND NOT (cid = ANY(v_known_ids))
            ) AS other_unknown_count
        FROM public.sentence_bank sb
        WHERE sb.canonical_ids @> ARRAY[p_canonical_id]
          AND (p_media_item_id IS NULL OR sb.media_item_id = p_media_item_id)
    )
    SELECT
        cs.id,
        cs.media_item_id,
        cs.sentence,
        cs.token_count,
        cs.source_context,
        cs.canonical_ids,
        cs.tokens,
        (cs.other_unknown_count + 1) AS unknown_count
    FROM candidate_sentences cs
    WHERE cs.other_unknown_count = 0 -- Exactly i+1 (target word is the ONLY unknown word)
    ORDER BY cs.token_count ASC
    LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_i_plus_one_sentences IS
  'Returns authentic sentences where all words except p_canonical_id are already known by p_user_id.';
```

---

## 3. Backend Pipeline Specification (`eleno_backend`)

### 3.1. Data Model Update: `src/loaders/models.py`
Update `SentenceBankItem` to include token arrays and canonical UUID lists:

```python
class SentenceTokenItem(BaseModel):
    surface: str
    start_char: int
    end_char: int
    canonical_id: Optional[str] = None
    lemma: Optional[str] = None
    pos: Optional[str] = None
    morph: Optional[str] = None

class SentenceBankItem(BaseModel):
    sentence: str
    token_count: int
    source_context: str
    canonical_ids: List[str] = Field(default_factory=list)
    tokens: List[SentenceTokenItem] = Field(default_factory=list)
    # Deprecated fields retained for backward compatibility during migration
    canonical_lemma: Optional[str] = None
    pos: Optional[str] = None
    target_form: Optional[str] = None
    target_start_char: Optional[int] = None
    target_end_char: Optional[int] = None
```

### 3.2. Harvester Engine Update: `src/pipeline.py`
In `TextIngestionPipeline.process_document`:
1. Iterate through `spacy_doc.sents`.
2. Apply pedagogical filters:
   - Word count: `6 <= len(words_in_sent) <= 45`
   - Valid termination: `clean_sent_text.endswith(('.', '!', '?', '…', '"', '»', '”'))`
3. For each token in the sentence:
   - Verify canonical headword via `self.verifier.verify(lemma, pos)` / `verify_inflection`.
   - Calculate exact character bounding boxes: `start = tok.idx - sent.start_char`, `end = start + len(tok.text)`.
   - Extract morphology: `tok.morph.to_json()` or string representation.
   - Record token in `tokens` array.
   - If verified, add `(entity.lemma, entity.pos)` to the sentence's canonical set.
4. Filter out sentences where canonical density is below threshold (e.g. at least 70% of content words must be resolved).
5. Append single deduplicated `SentenceBankItem` per sentence to `global_sentences`.

### 3.3. Supabase Client Upsert: `src/db/supabase_client.py`
In `SupabaseLexicalClient.sync_document_analysis`:
1. Map `(token.lemma, token.pos)` keys in each `SentenceBankItem` to their authoritative Supabase UUIDs using `id_map`.
2. Construct database rows:
   ```python
   sentence_rows.append({
       "media_item_id": document_id,
       "sentence": s.sentence,
       "token_count": s.token_count,
       "source_context": s.source_context,
       "canonical_ids": list(set(mapped_cids)),
       "tokens": [t.dict() for t in s.tokens],
   })
   ```
3. Batch-upsert with `on_conflict="media_item_id, sentence"` in chunks of 500.

---

## 4. Frontend Integration Specification (`eleno_index`)

> **Frontend Constraint**: Every file in `eleno_index/src/` must remain strictly `<= 150` lines.

### 4.1. TypeScript Types: `src/types/sentence.types.ts`
```typescript
export interface SentenceToken {
  surface: string;
  start_char: number;
  end_char: number;
  canonical_id?: string | null;
  lemma?: string | null;
  pos?: string | null;
  morph?: string | null;
}

export interface BankSentence {
  id: string;
  media_item_id: string;
  sentence: string;
  token_count: number;
  source_context: string;
  canonical_ids: string[];
  tokens: SentenceToken[];
  unknown_count?: number; // Present in i+1 query results
}
```

### 4.2. API Client: `src/api/sentence.api.ts`
* `fetchCanonicalSentences(canonicalId: string, limit?: number)`: Queries `sentence_bank` via `.contains("canonical_ids", [canonicalId])`.
* `fetchIPlusOneSentences(canonicalId: string, limit?: number)`: Calls RPC `get_i_plus_one_sentences`.

### 4.3. Interactive Component: `SentenceTokenSpan.tsx`
Renders individual tokens inside the Sentence Bank drawer:
* If token matches the target word: Highlights with Neo-Swiss Volt background (`bg-[#B8FF01] text-[#111111] font-bold`).
* If token is another known word: Normal text (`text-[#111111]`).
* If token is an unknown word: Dotted underline (`border-b border-dotted border-[#888888]`).
* Clicking any token opens its definition or allows marking as Known/Learning directly from the example sentence.

### 4.4. Drawer Component: `SentenceBankDrawer.tsx`
* Top segmented filter: `[All Examples | i+1 Comprehensible Only]`.
* When `i+1` is active, displays only sentences where the user knows 100% of the surrounding words, tagged with an `i+1 MATCH` badge.

---

## 5. Execution Steps & Verification Checklist

1. [ ] **Database Migration**:
   - Create `supabase/migrations/20261103090000_open_tokenized_sentence_bank.sql`.
   - Apply migration to Supabase.
2. [ ] **Backend Pipeline**:
   - Update `SentenceBankItem` and `SentenceTokenItem` in `src/loaders/models.py`.
   - Update `_harvest_sentences` in `src/pipeline.py`.
   - Update batch upsert in `src/db/supabase_client.py`.
   - Run unit test on a sample chapter to verify JSONB token format and `canonical_ids` array.
3. [ ] **Backfill Script**:
   - Create `scripts/backfill_tokenized_sentence_bank.py` to re-harvest sentences for ingested media items.
4. [ ] **Frontend**:
   - Add `src/types/sentence.types.ts` (`<= 150` lines).
   - Add `src/api/sentence.api.ts` (`<= 150` lines).
   - Create `src/components/inspector/SentenceTokenSpan.tsx` (`<= 150` lines).
   - Update `SentenceBankDrawer.tsx` with $i+1$ toggle.
   - Verify `tsc && vite build` passes with zero errors.
