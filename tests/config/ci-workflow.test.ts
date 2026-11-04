import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ci = readFileSync(
  path.resolve(__dirname, "../../.github/workflows/ci.yml"),
  "utf8",
);

describe("CI workflow", () => {
  // AGENTS.md promises lint runs on every PR; it must be an explicit step
  // because neither `build` nor `test` invokes ESLint.
  it("runs lint before the build", () => {
    const lint = ci.indexOf("run: npm run lint");
    expect(lint).toBeGreaterThan(-1);
    expect(lint).toBeLessThan(ci.indexOf("run: npm run build"));
  });
});
