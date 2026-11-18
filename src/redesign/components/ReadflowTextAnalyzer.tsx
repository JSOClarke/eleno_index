import React, { useMemo, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { parseTextSnippet, type ParseResponse, type ParsedToken } from "@/api/parse.api";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ReadflowTextAnalyzerProps {
  activeLanguage: string;
  userId?: string;
  statusMap: Record<string, UserVocabStatus>;
  onRequireAuth: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

const DEFAULT_SAMPLE =
  "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.";

export const ReadflowTextAnalyzer: React.FC<ReadflowTextAnalyzerProps> = ({
  activeLanguage, userId, statusMap, onRequireAuth, onSetWordStatus,
}) => {
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenStatus = (t: ParsedToken): UserVocabStatus | "unknown" => {
    if (!t.canonical) return "known";
    return statusMap[t.canonical.id] ?? (t.user_status === "known" || t.user_status === "learning" ? t.user_status : "unknown");
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parseTextSnippet({ text, language: activeLanguage, userId });
      setResult(data);
      const idx = data.tokens.findIndex((t) => !t.is_punct && t.canonical && tokenStatus(t) !== "known");
      setSelectedIdx(idx >= 0 ? idx : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse text");
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!result) return { pct: "—", total: "—", unique: "—", unknown: "—" };
    const content = result.tokens.filter((t) => !t.is_punct && t.canonical);
    const known = content.filter((t) => tokenStatus(t) === "known").length;
    const unknown = content.filter((t) => tokenStatus(t) === "unknown").length;
    const unique = new Set(content.map((t) => t.canonical!.id)).size;
    return { pct: content.length ? `${((known / content.length) * 100).toFixed(1)}%` : "100%", total: String(content.length), unique: String(unique), unknown: String(unknown) };
  }, [result, statusMap]);

  const selected = selectedIdx !== null && result ? result.tokens[selectedIdx] : null;
  const selectedStatus = selected ? tokenStatus(selected) : null;

  return (
    <section id="text-analyzer" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
      <div className="bg-white rounded-3xl border border-[#ECECEF] p-6 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2F59B] text-[#040404] text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /><span>Live GPU Text Analyzer</span>
            </div>
            <h2 className="font-editorial text-[40px] sm:text-[52px] text-[#040404]">Paste any passage to score it</h2>
          </div>
          <button type="button" onClick={handleAnalyze} disabled={loading} className="lexya-btn h-11 shrink-0 disabled:opacity-60">
            <span>{loading ? "Analyzing..." : "Analyze Passage"}</span>
            <span className="lexya-btn-icon"><ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} /></span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <textarea
              value={text} onChange={(e) => setText(e.target.value)} rows={7} placeholder="Paste Spanish text here..."
              className="w-full rounded-2xl bg-[#FAFAFA] border border-[#ECECEF] p-4 text-[14px] leading-relaxed text-[#040404] focus:outline-none focus:border-[#040404] resize-y"
            />
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Comprehension", val: metrics.pct, accent: "text-[#040404]" },
                { label: "Tokens", val: metrics.total, accent: "text-[#040404]" },
                { label: "Unique Lemmas", val: metrics.unique, accent: "text-[#040404]" },
                { label: "Unknowns", val: metrics.unknown, accent: "text-[#9A99F6]" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl bg-[#FAFAFA] border border-[#ECECEF] p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A595C]">{m.label}</span>
                  <p className={`font-editorial text-3xl sm:text-4xl mt-0.5 ${m.accent}`}>{m.val}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#FAFAFA] border border-[#ECECEF] p-4 min-h-[140px] text-[16px] leading-[1.9]">
              {!result ? (
                <p className="text-sm text-[#5A595C]">Click <strong>Analyze Passage</strong> to tokenize with the live Spanish GPU pipeline and highlight unknown words.</p>
              ) : (
                <div className="flex flex-wrap gap-x-1 gap-y-1">
                  {result.tokens.map((tok, i) => {
                    if (tok.is_punct || !tok.canonical) return <span key={i} className="text-[#040404]">{tok.surface}</span>;
                    const st = tokenStatus(tok);
                    const cls = st === "known" ? "token-known" : st === "learning" ? "token-target" : "token-unknown";
                    return <button key={i} type="button" onClick={() => setSelectedIdx(i)} className={`${cls} ${selectedIdx === i ? "selected" : ""}`}>{tok.surface}</button>;
                  })}
                </div>
              )}
            </div>

            {selected?.canonical && (
              <div className="pt-3 border-t border-[#ECECEF] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-extrabold text-[#040404] text-sm">{selected.canonical.lemma}</span>
                  <span className="text-[#5A595C] ml-2">
                    {selected.pos} · {selected.canonical.cefr || "—"}
                    {selected.canonical.tubelex_rank ? ` · Rank #${selected.canonical.tubelex_rank.toLocaleString()}` : ""}
                    {selected.canonical.definitions[0] ? ` — ${selected.canonical.definitions[0]}` : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => (!userId ? onRequireAuth() : onSetWordStatus(selected.canonical!.id, selectedStatus === "known" ? null : "known"))}
                  className="px-3 py-1.5 rounded-xl bg-[#040404] text-white text-[11px] font-bold hover:bg-[#1c1c1e] cursor-pointer"
                >
                  {selectedStatus === "known" ? "Known ✓ (Undo)" : "Mark Known"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
