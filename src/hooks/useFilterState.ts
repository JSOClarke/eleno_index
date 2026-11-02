import { useState, useCallback, useMemo } from "react";
import type {
  CatalogueFilterState,
  CommandTag,
  LengthBucket,
  ProfileFilterId,
} from "@/types/filter.types";

export function useFilterState() {
  const [searchText, setSearchText] = useState("");
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [levels, setLevels] = useState<Set<string>>(() => new Set(["A2", "B1"]));
  const [types, setTypes] = useState<Set<string>>(
    () => new Set(["Reader / book", "Short story", "Lore / guide"])
  );
  const [lengths, setLengths] = useState<Set<LengthBucket>>(
    () => new Set(["under25k", "25to80k", "80k+"])
  );
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
    const list: CommandTag[] = [
      { id: "author", key: "author", value: "J.K. Rowling" },
    ];
    if (levels.size > 0) {
      list.push({ id: "levels", key: "level", value: Array.from(levels).join("–") });
    }
    if (profiles.has("dialogue20")) {
      list.push({ id: "dialogue20", key: "dialogue", value: "20%+" });
    }
    if (profiles.has("fh70")) {
      list.push({ id: "fh70", key: "readability", value: "F-H 70+" });
    }
    customWords.forEach((w) => list.push({ id: `word:${w}`, key: "word", value: w }));
    return list;
  }, [levels, profiles, customWords]);

  const removeTag = useCallback((id: string) => {
    if (id === "levels") setLevels(new Set());
    else if (id === "dialogue20" || id === "fh70") {
      setProfiles((prev) => {
        const next = new Set(prev);
        next.delete(id as ProfileFilterId);
        return next;
      });
    } else if (id.startsWith("word:")) {
      const w = id.slice(5);
      setCustomWords((prev) => prev.filter((x) => x !== w));
    }
  }, []);

  const addTag = useCallback((_key: string, value: string) => {
    setCustomWords((prev) => [...prev, value]);
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
