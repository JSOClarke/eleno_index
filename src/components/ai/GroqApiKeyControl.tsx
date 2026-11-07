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
  onClose?: () => void;
}

export const GroqApiKeyControl: React.FC<GroqApiKeyControlProps> = ({
  configured,
  selectedModel,
  onSave,
  onRemove,
  onSelectModel,
  onClose,
}) => {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-1.5 border border-[#111111] bg-white p-2 font-mono text-[10px]">
      <div className="flex items-center justify-between text-[#666666] border-b border-[#E2E2DF] pb-1">
        <span className="font-bold text-[#111111]">GROQ CONFIGURATION</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-[#111111] underline cursor-pointer"
          >
            CLOSE
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[#888888] uppercase text-[9px]">MODEL:</span>
        <select
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
          className="w-full border border-[#111111] bg-[#F8F8F6] px-1 py-0.5 text-[9px] font-bold text-[#111111] outline-none cursor-pointer"
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {configured ? (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-[#555555]">KEY SAVED IN BROWSER</span>
          <button
            type="button"
            onClick={onRemove}
            className="font-bold text-red-600 underline cursor-pointer text-[9px]"
          >
            REMOVE KEY
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 pt-0.5">
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste gsk_... key"
            autoComplete="off"
            spellCheck={false}
            className="w-full border border-[#111111] px-1.5 py-0.5 text-[10px] outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[#666666] underline text-[9px]"
            >
              GET FREE KEY
            </a>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                onSave(draft);
                setDraft("");
                if (onClose) onClose();
              }}
              className="border border-[#111111] bg-[#B8FF01] px-2 py-0.5 font-bold text-[#111111] disabled:opacity-40 cursor-pointer text-[9px]"
            >
              SAVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
