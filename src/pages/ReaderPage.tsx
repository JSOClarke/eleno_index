import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchReaderManifest } from "@/api/reader.api";
import { ComicReaderView } from "@/components/comic/ComicReaderView";
import { BookReaderView } from "@/components/reader/BookReaderView";
import { loadLocalElenocbz } from "@/lib/elenocbzLocal";
import type { ElenoComicManifest } from "@/types/comicReader.types";
import type { ElenoReaderManifest } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ReaderPageProps {
  statusMap: Record<string, UserVocabStatus>;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({ statusMap, onSetWordStatus }) => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const navigate = useNavigate();
  const [bookManifest, setBookManifest] = useState<ElenoReaderManifest | null>(null);
  const [comicManifest, setComicManifest] = useState<ElenoComicManifest | null>(null);
  const [manifestErr, setManifestErr] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId || mediaId === "local") return;
    fetchReaderManifest(mediaId)
      .then((raw) => {
        const anyManifest = raw as unknown as { format?: string; pages?: any[] };
        if (anyManifest.format === "elenocbz" || Array.isArray(anyManifest.pages)) {
          setComicManifest(raw as unknown as ElenoComicManifest);
        } else {
          setBookManifest(raw);
        }
      })
      .catch((err) => setManifestErr(err.message || "Failed to load reader"));
  }, [mediaId]);

  const handleOpenLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const manifest = await loadLocalElenocbz(file);
      setComicManifest(manifest);
    } catch (err: any) {
      setManifestErr(err.message || "Failed to open local comic package");
    }
  };

  if (manifestErr) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white p-4 text-center font-mono">
        <h2 className="text-xl font-bold font-serif text-red-600">Failed to load reader</h2>
        <p className="mt-2 text-sm text-[#666666]">{manifestErr}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 border border-[#111111] px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  if (mediaId === "local" && !comicManifest) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#F8F8F6] p-6 text-center font-mono text-[#111111]">
        <div className="border border-[#111111] bg-white p-8 shadow-[4px_4px_0px_#111111] max-w-md w-full">
          <div className="flex items-center justify-center gap-1 font-mono text-base font-bold tracking-tight mb-4">
            <span>index</span>
            <span className="border border-[#111111] bg-[#B8FF01] px-1.5 py-0.5 text-xs font-bold text-[#111111]">
              /es
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#111111]">Open Local Comic Package</h2>
          <p className="mt-2 text-xs text-[#666666]">Select an enriched .elenocbz file to read</p>
          <label className="mt-6 inline-block cursor-pointer border border-[#111111] bg-[#B8FF01] px-5 py-2.5 text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#a6e600] transition-colors">
            Select .elenocbz File
            <input type="file" accept=".elenocbz,application/zip" onChange={handleOpenLocalFile} className="hidden" />
          </label>
        </div>
      </div>
    );
  }

  if (comicManifest) {
    return (
      <ComicReaderView
        mediaItemId={mediaId || "local"}
        manifest={comicManifest}
        statusMap={statusMap}
        onSetWordStatus={onSetWordStatus}
        onBack={() => navigate(mediaId === "local" ? "/" : `/media/${mediaId}`)}
      />
    );
  }

  if (bookManifest) {
    return (
      <BookReaderView
        mediaId={mediaId || ""}
        manifest={bookManifest}
        statusMap={statusMap}
        onSetWordStatus={onSetWordStatus}
      />
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-white font-mono text-xs text-neutral-500 animate-pulse">
      Loading reader manifest...
    </div>
  );
};

export default ReaderPage;
