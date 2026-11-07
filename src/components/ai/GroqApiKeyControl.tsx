import React, { useState } from "react";

interface GroqApiKeyControlProps {
  configured: boolean;
  onSave: (key: string) => void;
  onRemove: () => void;
}

/** Controls user's BYOK Groq API key in local storage. */
export const GroqApiKeyControl: React.FC<GroqApiKeyControlProps> = ({
  configured,
  onSave,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (configured) {
    return (
      <div className="flex items-center justify-between border-t border-[#E2E2DF] pt-1.5 font-mono text-[10px] text-[#666666]">
        <span>GROQ API KEY SAVED</span>
        <button
          type="button"
          onClick={onRemove}
          className="font-bold text-[#111111] underline cursor-pointer"
        >
          REMOVE
        </button>
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
            Stored locally in browser localStorage. Requests go directly to Groq.
          </p>
        </div>
      )}
    </div>
  );
};
