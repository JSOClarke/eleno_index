// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { CataloguePage } from "@/pages/CataloguePage";
import { buildPageSearchParams, parsePageParam } from "@/lib/cataloguePagination";
import type { MediaCatalogItem } from "@/types/media.types";

function makeBooks(count: number): MediaCatalogItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `book-${i + 1}`,
    title: `Book Title ${String(i + 1).padStart(2, "0")}`,
    creator: "Author",
    language: "es",
    type: "book",
    format: "epub",
    cover_image_url: null,
    release_year: 2020,
    metrics: { media_item_id: `book-${i + 1}`, total_tokens: 10000, content_tokens: 8000, unique_words_count: 1000, cefr_level: "B1", cefr_distribution: {}, lexical_density: 0.5, readability_score: 50 },
    comprehension: { media_item_id: `book-${i + 1}`, total_words: 1000, known_words: 950 - i, comprehension_percentage: 95 - i * 0.1, total_tokens: 10000, known_tokens: 9500 - i * 10, text_coverage_percentage: 95 - i * 0.1 },
    previewWords: [],
    sampleSnippet: null,
    sampleSourceLabel: "Excerpt",
  }));
}

function makeFilterState() {
  return {
    filters: { searchText: "", tags: [], levels: new Set(), types: new Set(), origins: new Set(), lengths: new Set(), profiles: new Set(), genres: new Set(), publishers: new Set(), years: new Set(), hasAudio: false, flowTier: "all" as const },
    searchText: "", setSearchText: vi.fn(), savedIds: new Set<string>(), historyIds: new Set<string>(),
    toggleLevel: vi.fn(), toggleType: vi.fn(), toggleLength: vi.fn(), toggleProfile: vi.fn(), toggleGenre: vi.fn(), togglePublisher: vi.fn(), toggleYear: vi.fn(),
    toggleHasAudio: vi.fn(), setFlowTier: vi.fn(), toggleSave: vi.fn(), recordHistory: vi.fn(), removeTag: vi.fn(), addTag: vi.fn(), clearAll: vi.fn(),
  };
}

const LocationDisplay: React.FC = () => {
  const loc = useLocation();
  return <div data-testid="loc-search">{loc.search}</div>;
};

describe("CataloguePage URL pagination", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    localStorage.clear();
  });

  it("changes page on click, updates ?page=2, and stays on page 2 on refresh", () => {
    const books = makeBooks(50);
    const props = { mode: "catalogue" as const, items: books, loading: false, filterState: makeFilterState() as any, statusMap: {}, isAuthenticated: true, onRequireAuth: vi.fn(), onToggleWord: vi.fn() };

    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LocationDisplay />
        <CataloguePage {...props} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Book Title 01" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Book Title 25" })).toBeNull();

    // Both top and bottom page selectors render; clicking top page 2 updates URL and slices
    const page2Buttons = screen.getAllByRole("button", { name: "2" });
    expect(page2Buttons.length).toBe(2);
    fireEvent.click(page2Buttons[0]);

    expect(screen.getByTestId("loc-search").textContent).toBe("?page=2");
    expect(screen.getByRole("link", { name: "Book Title 25" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Book Title 01" })).toBeNull();

    // Switching to Mosaic view must preserve ?page=2 and show the exact same items
    fireEvent.click(screen.getByRole("button", { name: "mosaic" }));
    expect(screen.getByTestId("loc-search").textContent).toBe("?page=2&view=mosaic");
    expect(screen.getByRole("heading", { name: "Book Title 25" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Book Title 01" })).toBeNull();
    unmount();

    // Simulate browser refresh on /?page=2&view=cards
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/?page=2"]}>
        <LocationDisplay />
        <CataloguePage {...props} />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Book Title 25" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Book Title 01" })).toBeNull();
  });

  it("handles invalid page params safely", () => {
    expect(parsePageParam(null)).toBe(1);
    expect(parsePageParam("-3")).toBe(1);
    expect(buildPageSearchParams(new URLSearchParams("view=table&page=2"), 1).toString()).toBe("view=table");
  });
});
