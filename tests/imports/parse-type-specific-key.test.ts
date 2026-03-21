import { describe, expect, it } from "vitest";

import { parseTypeSpecificKey } from "@/imports/constants";

// ---------------------------------------------------------------------------
// parseTypeSpecificKey
// ---------------------------------------------------------------------------

describe("parseTypeSpecificKey", () => {
  // --- null cases ---

  it("returns null for a plain field with no underscores", () => {
    expect(parseTypeSpecificKey("date")).toBeNull();
  });

  it("returns null when there are fewer than 3 underscore-delimited parts", () => {
    expect(parseTypeSpecificKey("hta_exams")).toBeNull();
  });

  it("returns null for an unknown type key", () => {
    expect(parseTypeSpecificKey("xx_exams_creatinina")).toBeNull();
  });

  it("returns null for an unknown section key within a valid type", () => {
    // "unknown" is not a section key on the hta type (only "exams" and "history" exist)
    expect(parseTypeSpecificKey("hta_unknown_creatinina")).toBeNull();
  });

  it("returns null for an unknown field within a valid type and section", () => {
    expect(parseTypeSpecificKey("hta_exams_nonexistent")).toBeNull();
  });

  it("returns null for a dm-prefixed key because dm section keys are prefixed ('dm_exams', not 'exams')", () => {
    // The dm type stores sections under full keys like "dm_exams" and "dm_history",
    // so parts[1] = "exams" does not match any section key.
    expect(parseTypeSpecificKey("dm_exams_creatinina")).toBeNull();
  });

  it("returns null for an sm multi-word key whose field uses a hyphen delimiter", () => {
    // The field key in constants is "plano-vigilancia" (hyphen), but joining the split
    // parts back with underscore produces "plano_vigilancia" — no match.
    expect(parseTypeSpecificKey("sm_history_plano_vigilancia")).toBeNull();
  });

  // --- valid cases ---

  it("parses a valid HTA exams key", () => {
    expect(parseTypeSpecificKey("hta_exams_creatinina")).toEqual({
      typeKey: "hta",
      sectionKey: "exams",
      fieldKey: "creatinina",
    });
  });

  it("parses a valid HTA exams key for a different field", () => {
    expect(parseTypeSpecificKey("hta_exams_tfg")).toEqual({
      typeKey: "hta",
      sectionKey: "exams",
      fieldKey: "tfg",
    });
  });

  it("parses a valid HTA history key", () => {
    expect(parseTypeSpecificKey("hta_history_medicamentos")).toEqual({
      typeKey: "hta",
      sectionKey: "history",
      fieldKey: "medicamentos",
    });
  });

  it("parses a valid SM history single-word field key", () => {
    expect(parseTypeSpecificKey("sm_history_trimestre")).toEqual({
      typeKey: "sm",
      sectionKey: "history",
      fieldKey: "trimestre",
    });
  });

  it("parses a valid SA exams key", () => {
    // "sa" shares the same section structure as "hta" (exams + history)
    expect(parseTypeSpecificKey("sa_exams_creatinina")).toEqual({
      typeKey: "sa",
      sectionKey: "exams",
      fieldKey: "creatinina",
    });
  });
});
