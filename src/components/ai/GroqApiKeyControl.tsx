import React, { useState } from "react";

const AVAILABLE_MODELS = [
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Default)" },
  { id: "openai/gpt-oss-120b", label: "GPT OSS 120B" },
  { id: "openai/gpt-oss-20b", label: "GPT OSS 20B" },
];

interface GroqApiKeyControlProps {
  configured: boolean;
  selectedModel: string;
  onSave: (key: string) => void;
  onRemove: () => void;
  onSelectModel: (model: string) => void;
}

/** Controls user's BYOK Groq API key and model selection. */
export const GroqApiKeyControl: React.FC<GroqApiKeyControlProps> = ({
  configured,
  selectedModel,
  onSave,
  onRemove,
  onSelectModel,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (configured) {
    return (
      <div className="space-y-1.5 border-t border-[#E2E2DF] pt-1.5 font-mono text-[10px]">
        <div className="flex items-center justify-between text-[#666666]">
          <span>GROQ KEY ACTIVE</span>
          <button
            type="button"
            onClick={onRemove}
            className="font-bold text-[#111111] underline cursor-pointer"
          >
            REMOVE
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#888888] uppercase text-[9px]">MODEL:</span>
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="border border-[#111111] bg-white px-1 py-0.5 text-[10px] font-bold text-[#111111] outline-none cursor-pointer"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#E2E2DF] pt-1.5 font-mono text-[10px]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="font-bold text-[#111111] underline cursor-pointer"
      >
        {open ? "CANCEL" : "+ ADD GROQ API KEY TO ENABLE AI"}
      </button>

      {open && (
        <div className="mt-1.5 space-y-1.5 border border-[#111111] bg-white p-2">
          <input
            type="password"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="gsk_..."
            autoComplete="off"
            spellCheck={false}
            className="w-full border border-[#111111] px-2 py-1 font-mono text-[11px] outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[#666666] underline text-[10px]"
            >
              GET FREE GROQ KEY ↗
            </a>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                onSave(draft);
                setDraft("");
                setOpen(false);
              }}
              className="border border-[#111111] bg-[#B8FF01] px-2 py-0.5 font-bold text-[#111111] disabled:opacity-40 cursor-pointer"
            >
              SAVE KEY
            </button>
          </div>
          <p className="text-[9px] text-[#888888] leading-tight">
            Stored locally in browser localStorage. Uses llama-3.1-8b-instant.
          </p>
        </div>
      )}
    </div>
  );
};
