import { describe, expect, it, vi } from "vitest";

const totalRows = Array.from({ length: 2350 }, (_, i) => ({
  canonical_id: `cid-${i}`,
  status: i % 10 === 0 ? "learning" : "known",
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(() => ({
      range: vi.fn(async (from: number, to: number) => ({
        data: totalRows.slice(from, to + 1),
        error: null,
      })),
    })),
  },
}));

import { fetchAllUserVocabulary } from "@/api/vocabulary.api";

describe("fetchAllUserVocabulary", () => {
  it("paginates get_user_vocabulary_map beyond 1,000 rows", async () => {
    const map = await fetchAllUserVocabulary("user-1", "es");
    expect(Object.keys(map).length).toBe(2350);
    expect(map["cid-0"]).toBe("learning");
    expect(map["cid-2349"]).toBe("known");
  });
});
