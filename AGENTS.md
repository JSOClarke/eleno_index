# InputHub (`inputhub /es`) — Agent Guidelines & Architectural Rules

- **Strict Approval Before Coding**: Do NOT write code, create files, edit files, or execute implementation commands without the user explicitly asking to do so.
- **Collaborate First**: Discuss architectural decisions, explain concepts, answer questions, and propose plans first. Wait for specific confirmation and instruction from the user before executing changes.
- **Strict `<= 150` Lines Per File Ceiling**:
  - Every single file in `src/` MUST be `<= 150` lines.
  - Never create monolithic components, hooks, or API files. Extract sub-components or utility modules before exceeding 150 lines.
- **Strict API & Database Boundary**:
  - Never import `@supabase/supabase-js` or `@/lib/supabase` outside `src/lib/supabase.ts` and `src/api/*.api.ts`.
  - All Postgres `BIGINT` and `NUMERIC` fields returned by Supabase RPCs must be coerced via `Number()` in `src/api/normalizers.ts`.
- **Zero Hardcoded Mock Data**:
  - All media items, series labels, cover art, dictionary definitions, and linguistic metrics come strictly from Supabase (`c:\Users\drjopari\Documents\eleno_backend`).
- **Optimistic UI & Caching**:
  - Marking a word as `Known`, `Learning`, or `Unknown` must apply a `0ms` optimistic update to local state (`useUserVocabulary`, `useCatalogueData`, `useMediaInspector`) followed by a debounced (`1.2s`) RPC reconciliation.
