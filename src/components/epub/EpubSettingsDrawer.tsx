import React from "react";
import { X } from "lucide-react";
import { getProficiencySystemLabel } from "@/lib/proficiencyScale";
import type { EpubHighlightMode, EpubScrollMode, EpubSettings, EpubTheme } from "@/types/epubReader.types";

interface EpubSettingsDrawerProps {
  open: boolean;
  settings: EpubSettings;
  language?: string;
  onChange: (next: EpubSettings) => void;
  onClose: () => void;
}

const THEMES: { id: EpubTheme; label: string; preview: string }[] = [
  { id: "light", label: "Light", preview: "bg-white text-slate-900 border-slate-200" },
  { id: "sepia", label: "Sepia", preview: "bg-[#FAF4E8] text-stone-900 border-amber-200" },
  { id: "dark", label: "Dark", preview: "bg-[#0A0A0C] text-zinc-100 border-zinc-800" },
];

export const EpubSettingsDrawer: React.FC<EpubSettingsDrawerProps> = ({
  open,
  settings,
  language,
  onChange,
  onClose,
}) => {
  if (!open) return null;

  const highlightModes: { id: EpubHighlightMode; label: string }[] = [
    { id: "status", label: "Status" },
    { id: "i1", label: "i+1" },
    { id: "cefr", label: language ? getProficiencySystemLabel(language) : "Level" },
    { id: "rank", label: "Rank" },
    { id: "off", label: "Off" },
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="w-80 max-w-[90vw] bg-white p-5 shadow-2xl border-l border-slate-200 space-y-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Reader Settings</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Paper Theme</div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ ...settings, theme: t.id })}
                className={`rounded-xl border py-2 text-xs font-medium cursor-pointer transition ${t.preview} ${
                  settings.theme === t.id ? "ring-2 ring-slate-900" : "opacity-80 hover:opacity-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Reading Mode</div>
          <div className="grid grid-cols-2 gap-2">
            {(["scroll", "paged"] as EpubScrollMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ ...settings, scrollMode: mode })}
                className={`rounded-xl border py-2 text-xs font-medium cursor-pointer transition ${
                  settings.scrollMode === mode
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {mode === "scroll" ? "Vertical Scroll" : "Horizontal Paged"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>Font Size</span>
            <span className="tabular-nums text-slate-900">{settings.fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...settings, fontSize: Math.max(14, settings.fontSize - 2) })}
              className="flex-1 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...settings, fontSize: Math.min(26, settings.fontSize + 2) })}
              className="flex-1 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              A+
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Highlight Mode</div>
          <div className="grid grid-cols-5 gap-1.5">
            {highlightModes.map((hm) => (
              <button
                key={hm.id}
                type="button"
                onClick={() => onChange({ ...settings, highlightMode: hm.id, highlightUnknown: hm.id !== "off" })}
                className={`rounded-lg border py-1.5 text-[11px] font-medium cursor-pointer transition ${
                  (settings.highlightMode || "status") === hm.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {hm.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 cursor-pointer">
          <div>
            <div className="text-xs font-semibold text-slate-900">Automatic Parsing</div>
            <div className="text-[11px] text-slate-500">Parse pages automatically as you read</div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoParse !== false}
            onChange={(e) => onChange({ ...settings, autoParse: e.target.checked })}
            className="h-4 w-4 accent-slate-900 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
