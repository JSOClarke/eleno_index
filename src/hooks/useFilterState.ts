import { useState, useCallback, useMemo } from "react";
import type {
  CatalogueFilterState,
  CommandTag,
  LengthBucket,
  ProfileFilterId,
} from "@/types/filter.types";

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

export function useFilterState() {
  const [searchText, setSearchText] = useState("");
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [levels, setLevels] = useState<Set<string>>(() => new Set());
  const [types, setTypes] = useState<Set<string>>(() => new Set());
  const [lengths, setLengths] = useState<Set<LengthBucket>>(() => new Set());
  const [profiles, setProfiles] = useState<Set<ProfileFilterId>>(() => new Set());
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

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const recordHistory = useCallback((id: string) => {
    setHistoryIds((prev) => new Set(prev).add(id));
  }, []);

  const tags = useMemo<CommandTag[]>(() => {
    const list: CommandTag[] = [];
    if (levels.size > 0) {
      list.push({ id: "levels", key: "level", value: Array.from(levels).join("–") });
    }
    types.forEach((t) => list.push({ id: `type:${t}`, key: "type", value: t }));
    lengths.forEach((l) =>
      list.push({ id: `length:${l}`, key: "length", value: LENGTH_LABELS[l] })
    );
    profiles.forEach((p) =>
      list.push({ id: `profile:${p}`, key: "profile", value: PROFILE_LABELS[p] })
    );
    customWords.forEach((w) => list.push({ id: `word:${w}`, key: "search", value: w }));
    return list;
  }, [levels, types, lengths, profiles, customWords]);

  const removeTag = useCallback((id: string) => {
    if (id === "levels") setLevels(new Set());
    else if (id.startsWith("type:")) {
      const val = id.slice(5);
      setTypes((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("length:")) {
      const val = id.slice(7) as LengthBucket;
      setLengths((prev) => { const n = new Set(prev); n.delete(val); return n; });
    } else if (id.startsWith("profile:")) {
      const val = id.slice(8) as ProfileFilterId;
      setProfiles((prev) => { const n = new Set(prev); n.delete(val); return n; });
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
    setLengths(new Set());
    setProfiles(new Set());
    setCustomWords([]);
    setSearchText("");
  }, []);

  const filters: CatalogueFilterState = useMemo(
    () => ({
      searchText: [searchText, ...customWords].join(" ").trim(),
      tags,
      levels,
      types,
      lengths,
      profiles,
    }),
    [searchText, customWords, tags, levels, types, lengths, profiles]
  );

  return {
    filters,
    searchText,
    setSearchText,
    savedIds,
    historyIds,
    toggleLevel,
    toggleType,
    toggleLength,
    toggleProfile,
    toggleSave,
    recordHistory,
    removeTag,
    addTag,
    clearAll,
  };
}
