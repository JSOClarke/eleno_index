import { useState, useCallback, useMemo } from "react";
import type {
  CatalogueFilterState,
  CommandTag,
  FlowTier,
  LengthBucket,
  OriginFilter,
  ProfileFilterId,
} from "@/types/filter.types";

const ORIGIN_LABELS: Record<OriginFilter, string> = {
  native: "Native Original",
  translated: "Translated",
};

const LENGTH_LABELS: Record<LengthBucket, string> = {
  under25k: "<25k words",
  "25to80k": "25k–80k words",
  "80k+": "80k+ words",
};

const PROFILE_LABELS: Record<ProfileFilterId, string> = {
  dialogue20: "Dialogue 20%+",
  fh70: "F-H 70+",
  subj2: "Subjunctive rich",
};

const FLOW_LABELS: Record<FlowTier, string> = {
  all: "All Flow",
  fluent: "Fluent (95%+)",
  sweet_spot: "Sweet Spot (85–95%)",
  challenge: "Challenging (<85%)",
};

export function useFilterState() {
  const [searchText, setSearchText] = useState("");
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [levels, setLevels] = useState<Set<string>>(() => new Set());
  const [types, setTypes] = useState<Set<string>>(() => new Set());
  const [origins, setOrigins] = useState<Set<OriginFilter>>(() => new Set());
  const [lengths, setLengths] = useState<Set<LengthBucket>>(() => new Set());
  const [profiles, setProfiles] = useState<Set<ProfileFilterId>>(() => new Set());
  const [genres, setGenres] = useState<Set<string>>(() => new Set());
  const [publishers, setPublishers] = useState<Set<string>>(() => new Set());
  const [years, setYears] = useState<Set<string>>(() => new Set());
  const [hasAudio, setHasAudio] = useState(false);
  const [flowTier, setFlowTier] = useState<FlowTier>("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [historyIds, setHistoryIds] = useState<Set<string>>(() => new Set());

  const toggleLevel = useCallback((lvl: string) => {
    setLevels((prev) => {
      const next = new Set(prev);
      next.has(lvl) ? next.delete(lvl) : next.add(lvl);
      return next;
    });
  }, []);

  const toggleType = useCallback((t: string) => {
    setTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }, []);

  const toggleOrigin = useCallback((o: OriginFilter) => {
    setOrigins((prev) => {
      const next = new Set(prev);
      next.has(o) ? next.delete(o) : next.add(o);
      return next;
    });
  }, []);

  const toggleLength = useCallback((b: LengthBucket) => {
    setLengths((prev) => {
      const next = new Set(prev);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });
  }, []);

  const toggleProfile = useCallback((p: ProfileFilterId) => {
    setProfiles((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }, []);

  const toggleGenre = useCallback((g: string) => {
    setGenres((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }, []);

  const togglePublisher = useCallback((p: string) => {
    setPublishers((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }, []);

  const toggleYear = useCallback((y: string) => {
    setYears((prev) => {
      const next = new Set(prev);
      next.has(y) ? next.delete(y) : next.add(y);
      return next;
    });
  }, []);

  const toggleHasAudio = useCallback(() => setHasAudio((prev) => !prev), []);
  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const recordHistory = useCallback((id: string) => setHistoryIds((p) => new Set(p).add(id)), []);

  const tags = useMemo<CommandTag[]>(() => {
    const list: CommandTag[] = [];
    if (levels.size > 0) list.push({ id: "levels", key: "level", value: Array.from(levels).join("–") });
    types.forEach((t) => list.push({ id: `type:${t}`, key: "type", value: t }));
    origins.forEach((o) => list.push({ id: `origin:${o}`, key: "origin", value: ORIGIN_LABELS[o] }));
    lengths.forEach((l) => list.push({ id: `length:${l}`, key: "length", value: LENGTH_LABELS[l] }));
    profiles.forEach((p) => list.push({ id: `profile:${p}`, key: "profile", value: PROFILE_LABELS[p] }));
    genres.forEach((g) => list.push({ id: `genre:${g}`, key: "genre", value: g }));
    publishers.forEach((p) => list.push({ id: `publisher:${p}`, key: "publisher", value: p }));
    years.forEach((y) => list.push({ id: `year:${y}`, key: "year", value: y }));
    if (hasAudio) list.push({ id: "audio:yes", key: "audio", value: "Narration" });
    if (flowTier !== "all") list.push({ id: `flow:${flowTier}`, key: "flow", value: FLOW_LABELS[flowTier] });
    customWords.forEach((w) => list.push({ id: `word:${w}`, key: "search", value: w }));
    return list;
  }, [levels, types, origins, lengths, profiles, genres, publishers, years, hasAudio, flowTier, customWords]);

  const removeTag = useCallback((id: string) => {
    if (id === "levels") setLevels(new Set());
    else if (id === "audio:yes") setHasAudio(false);
    else if (id.startsWith("flow:")) setFlowTier("all");
    else if (id.startsWith("type:")) {
      const val = id.slice(5);
      setTypes((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("origin:")) {
      const val = id.slice(7) as OriginFilter;
      setOrigins((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("length:")) {
      const val = id.slice(7) as LengthBucket;
      setLengths((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("profile:")) {
      const val = id.slice(8) as ProfileFilterId;
      setProfiles((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("genre:")) {
      const val = id.slice(6);
      setGenres((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("publisher:")) {
      const val = id.slice(10);
      setPublishers((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("year:")) {
      const val = id.slice(5);
      setYears((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("word:")) {
      const w = id.slice(5);
      setCustomWords((prev) => prev.filter((x) => x !== w));
    }
  }, []);

  const addTag = useCallback((_key: string, value: string) => {
    setCustomWords((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  const clearAll = useCallback(() => {
    setLevels(new Set());
    setTypes(new Set());
    setOrigins(new Set());
    setLengths(new Set());
    setProfiles(new Set());
    setGenres(new Set());
    setPublishers(new Set());
    setYears(new Set());
    setHasAudio(false);
    setFlowTier("all");
    setCustomWords([]);
    setSearchText("");
  }, []);

  const filters: CatalogueFilterState = useMemo(() => ({
    searchText: [searchText, ...customWords].join(" ").trim(),
    tags, levels, types, origins, lengths, profiles, genres, publishers, years, hasAudio, flowTier,
  }), [searchText, customWords, tags, levels, types, origins, lengths, profiles, genres, publishers, years, hasAudio, flowTier]);

  return {
    filters, searchText, setSearchText, savedIds, historyIds,
    toggleLevel, toggleType, toggleOrigin, toggleLength, toggleProfile, toggleGenre, togglePublisher, toggleYear,
    toggleHasAudio, setFlowTier,
    toggleSave, recordHistory, removeTag, addTag, clearAll,
  };
}
