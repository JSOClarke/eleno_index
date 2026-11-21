import path from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { apkgFilename, buildApkgBytes } from "../ankiApkgExport";
import type { VocabularyWord } from "@/types/vocabulary.types";

describe("ankiApkgExport", () => {
  it("builds a valid .apkg zip containing collection.anki2 and media", async () => {
    const sample: VocabularyWord[] = [
      {
        canonical_id: "11111111-2222-3333-4444-555555555555",
        lemma: "lechuza",
        pos: "NOUN",
        definitions: ["owl", "barn owl"],
        frequency: 3,
        first_occurrence_index: 1,
        first_timestamp_ms: null,
        first_context_snippet: "La gran lechuza parda volaba.",
        cefr: "A1",
        global_rank: 16364,
        ipa: "/leˈt͡ʃuθa/",
      },
    ];

    const wasmDir = path.resolve(process.cwd(), "node_modules/sql.js/dist");
    const bytes = await buildApkgBytes(sample, {}, "Harry Potter", "tubelex_v2025", (f) => path.join(wasmDir, f));
    const zip = await JSZip.loadAsync(bytes);

    expect(Object.keys(zip.files).sort()).toEqual(["collection.anki2", "media"]);
    expect(await zip.file("media")?.async("string")).toBe("{}");
    expect(apkgFilename("Harry Potter", "abcdef1234")).toBe("harry-potter-abcdef12-anki.apkg");
  });
});
