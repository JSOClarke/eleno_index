import { describe, expect, it } from "vitest";
import { formatProficiencyLevel, getProficiencySystemLabel } from "@/lib/proficiencyScale";

describe("proficiencyScale", () => {
  it("maps Chinese A1-C2 levels to HSK 1-6", () => {
    expect(getProficiencySystemLabel("zh")).toBe("HSK");
    expect(formatProficiencyLevel("A1", "zh")).toBe("HSK 1");
    expect(formatProficiencyLevel("C2", "zh")).toBe("HSK 6");
  });

  it("maps Japanese A1-C2 levels to JLPT N5-N1+", () => {
    expect(getProficiencySystemLabel("ja")).toBe("JLPT");
    expect(formatProficiencyLevel("A1", "ja")).toBe("N5");
    expect(formatProficiencyLevel("C1", "ja")).toBe("N1");
  });

  it("keeps CEFR labels for Spanish and French", () => {
    expect(getProficiencySystemLabel("es")).toBe("CEFR");
    expect(getProficiencySystemLabel("fr")).toBe("CEFR");
    expect(formatProficiencyLevel("B2", "es")).toBe("B2");
  });
});
