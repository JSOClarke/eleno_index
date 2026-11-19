import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { fetchWordSentencesFast, searchDictionaryWords } from "@/api/dictionary.api";
import { DictionarySentenceList } from "@/components/dictionary/DictionarySentenceList";
import { DictionaryWordCard } from "@/components/dictionary/DictionaryWordCard";
import type { DictionarySentence, DictionaryWord } from "@/types/dictionary.types";
import type { SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface DictionaryPageProps {
  activeLanguage: string;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  onRequireAuth: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

const PAGE_SIZE = 15;

export const DictionaryPage: React.FC<DictionaryPageProps> = ({
  activeLanguage, userId, statusMap, onRequireAuth, onSetWordStatus,
}) => {
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [sentences, setSentences] = useState<DictionarySentence[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [iPlusOne, setIPlusOne] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setWordsLoading(true);
      const res = await searchDictionaryWords(activeLanguage, query, 25);
      if (cancelled) return;
      setWords(res);
      setWordsLoading(false);
      if (res.length > 0 && (!selectedWord || !res.some((w) => w.id === selectedWord.id))) {
        setSelectedWord(res[0]);
      } else if (res.length === 0) {
        setSelectedWord(null);
      }
    }, query ? 180 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [activeLanguage, query]);

  useEffect(() => {
    if (!selectedWord) { setSentences([]); setHasMore(false); return; }
    let cancelled = false;
    setSentLoading(true);
    fetchWordSentencesFast({ canonicalId: selectedWord.id, userId, iPlusOne, offset: 0, limit: PAGE_SIZE }).then((res) => {
      if (cancelled) return;
      setSentences(res);
      setHasMore(res.length === PAGE_SIZE);
      setSentLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedWord?.id, userId, iPlusOne]);

  const handleLoadMore = async () => {
    if (!selectedWord || loadingMore) return;
    setLoadingMore(true);
    const next = await fetchWordSentencesFast({ canonicalId: selectedWord.id, userId, iPlusOne, offset: sentences.length, limit: PAGE_SIZE });
    setSentences((prev) => [...prev, ...next]);
    setHasMore(next.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleSelectToken = (token: SentenceToken) => {
    if (token.lemma) setQuery(token.lemma);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${activeLanguage.toUpperCase()} definitions & sentence bank...`}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-16 text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-xs focus:border-slate-900"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")}
            className="absolute right-3 rounded-full px-2 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs max-h-[540px] overflow-y-auto space-y-1">
          {wordsLoading ? (
            [1, 2, 3, 4, 5].map((n) => <div key={n} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)
          ) : words.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No matching words found.</div>
          ) : (
            words.map((w) => {
              const active = selectedWord?.id === w.id;
              const st = statusMap[w.id];
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWord(w)}
                  className={`w-full rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                    active ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{w.lemma}</span>
                    <span className={`text-[10px] font-semibold uppercase ${active ? "text-white/75" : "text-slate-400"}`}>
                      {w.pos}{st ? ` · ${st}` : ""}
                    </span>
                  </div>
                  {w.definitions[0] && (
                    <div className={`truncate text-xs mt-0.5 ${active ? "text-white/80" : "text-slate-500"}`}>
                      {w.definitions[0]}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </aside>

        <div className="lg:col-span-8 space-y-4">
          {selectedWord && (
            <>
              <DictionaryWordCard word={selectedWord} status={statusMap[selectedWord.id]} isAuthenticated={Boolean(userId)} onRequireAuth={onRequireAuth} onSetStatus={onSetWordStatus} />
              <DictionarySentenceList canonicalId={selectedWord.id} sentences={sentences} loading={sentLoading} loadingMore={loadingMore} hasMore={hasMore} iPlusOne={iPlusOne} isAuthenticated={Boolean(userId)} statusMap={statusMap} onToggleIPlusOne={() => setIPlusOne((v) => !v)} onLoadMore={handleLoadMore} onSelectToken={handleSelectToken} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
