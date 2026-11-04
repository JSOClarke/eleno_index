import React, { useState } from "react";

interface WordImageKeyControlProps {
  configured: boolean;
  onSave: (key: string) => void;
  onRemove: () => void;
}

/** Lets the reader supply their own Pixabay key; stored in this browser only. */
export const WordImageKeyControl: React.FC<WordImageKeyControlProps> = ({
  configured,
  onSave,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (configured) {
    return (
      <div className="mt-2 flex items-center justify-between border-t border-[#E2E2DF] pt-2 font-mono text-[10px] text-[#666666]">
        <span>PIXABAY KEY SAVED IN THIS BROWSER</span>
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
    <div className="mt-2 border-t border-[#E2E2DF] pt-2 font-mono text-[10px]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="font-bold text-[#111111] underline cursor-pointer"
      >
        + ADD PIXABAY API KEY
      </button>

      {open && (
        <div className="mt-1.5 space-y-1.5 border border-[#E2E2DF] bg-white p-2">
          <input
            type="password"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Pixabay API key"
            autoComplete="off"
            spellCheck={false}
            className="w-full border border-[#111111] px-2 py-1 font-mono text-[11px] outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <a
              href="https://pixabay.com/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="text-[#666666] underline"
            >
              GET A KEY ↗
            </a>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                onSave(draft);
                setDraft("");
                setOpen(false);
              }}
              className="border border-[#111111] bg-[#B8FF01] px-2 py-1 font-bold text-[#111111] disabled:opacity-40 cursor-pointer"
            >
              SAVE
            </button>
          </div>
          <p className="text-[#888888]">
            Stored only in this browser. It is sent directly to Pixabay.
          </p>
        </div>
      )}
    </div>
  );
};
