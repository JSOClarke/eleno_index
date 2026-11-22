import React, { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Eye, Volume2 } from "lucide-react";
import { speakSpanish } from "@/lib/epub/epubParseClient";
import type { SelectedWordContext } from "@/types/epubReader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface EpubActionWheelProps {
  wheel: { ctx: SelectedWordContext; x: number; y: number } | null;
  language: string;
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onInspect: (ctx: SelectedWordContext) => void;
  onClose: () => void;
}

function hitDirection(clientX: number, clientY: number, cx: number, cy: number): number {
  const dx = clientX - cx;
  const dy = clientY - cy;
  if (Math.hypot(dx, dy) < 22) return -1;
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 0 : 2;
  return dx > 0 ? 1 : 3;
}

export const EpubActionWheel: React.FC<EpubActionWheelProps> = ({
  wheel, language, statusMap, onSetWordStatus, onInspect, onClose,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number>(-1);
  const doneRef = useRef(false);

  const pad = 94;
  const cx = wheel ? Math.round(Math.max(pad, Math.min(window.innerWidth - pad, wheel.x))) : 0;
  const cy = wheel ? Math.round(Math.max(pad, Math.min(window.innerHeight - pad, wheel.y))) : 0;

  const can = wheel?.ctx.token.canonical;
  const lemma = can?.lemma || wheel?.ctx.token.surface || "";
  const canonicalId = can?.canonical_id || can?.id || "";
  const status = (canonicalId ? statusMap[canonicalId] : undefined) || wheel?.ctx.token.user_status || null;

  const actions = wheel ? [
    {
      label: status === "known" ? "Known" : "Know",
      Icon: CheckCircle2,
      left: "50%", top: "14%",
      activeCls: status === "known" ? "bg-[#0F172A] text-white" : "bg-white text-[#0F172A]",
      run: () => { if (canonicalId) onSetWordStatus(canonicalId, status === "known" ? null : "known"); onClose(); },
    },
    {
      label: "Audio",
      Icon: Volume2,
      left: "86%", top: "50%",
      activeCls: "bg-white text-[#0F172A]",
      run: () => { speakSpanish(lemma, language); onClose(); },
    },
    {
      label: status === "learning" ? "Learning" : "Learn",
      Icon: Eye,
      left: "50%", top: "86%",
      activeCls: status === "learning" ? "bg-[#E2E8F0] text-[#0F172A]" : "bg-white text-[#0F172A]",
      run: () => { if (canonicalId) onSetWordStatus(canonicalId, status === "learning" ? null : "learning"); onClose(); },
    },
    {
      label: "Inspect",
      Icon: BookOpen,
      left: "14%", top: "50%",
      activeCls: "bg-white text-[#0F172A]",
      run: () => { const c = wheel.ctx; onClose(); onInspect(c); },
    },
  ] : [];

  useEffect(() => {
    if (!wheel) return;
    doneRef.current = false;
    setHoveredIdx(-1);
    const fire = (idx: number) => {
      if (doneRef.current || idx < 0 || !actions[idx]) return;
      doneRef.current = true;
      actions[idx].run();
    };
    const onMove = (e: MouseEvent) => setHoveredIdx(hitDirection(e.clientX, e.clientY, cx, cy));
    const onUp = (e: MouseEvent) => { if (e.button === 2) fire(hitDirection(e.clientX, e.clientY, cx, cy)); };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) { e.preventDefault(); setHoveredIdx(hitDirection(t.clientX, t.clientY, cx, cy)); }
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const idx = hitDirection(t.clientX, t.clientY, cx, cy);
      if (idx >= 0) { e.preventDefault(); fire(idx); } else setHoveredIdx(-1);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [wheel, cx, cy]);

  if (!wheel) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div
        style={{ left: `${cx - 88}px`, top: `${cy - 88}px` }}
        onClick={(e) => e.stopPropagation()}
        className="fixed h-[176px] w-[176px] animate-[wheelPop_0.14s_cubic-bezier(0.2,0.9,0.3,1)] select-none"
      >
        <div className="pointer-events-none absolute inset-[18px] rounded-full border border-dashed border-slate-400/45" />
        <button
          type="button"
          onClick={onClose}
          title="Close (Esc)"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[78px] truncate rounded-full bg-[#0A0A0C] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)] cursor-pointer"
        >
          {lemma}
        </button>
        {actions.map((act, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <button
              key={act.label}
              type="button"
              onClick={(e) => { e.stopPropagation(); if (!doneRef.current) { doneRef.current = true; act.run(); } }}
              style={{ left: act.left, top: act.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 inline-flex flex-col items-center justify-center gap-0.5 h-[54px] w-[54px] rounded-full text-[9.5px] font-semibold shadow-[0_8px_20px_rgba(15,23,42,0.16),0_2px_6px_rgba(15,23,42,0.08)] transition duration-100 cursor-pointer ${
                isHovered ? "scale-110 bg-[#0F172A] text-white" : `${act.activeCls} hover:scale-110 hover:bg-[#0F172A] hover:text-white`
              }`}
            >
              <act.Icon className="h-[15px] w-[15px]" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
