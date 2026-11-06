import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const file = path.resolve(
  __dirname,
  "../../.github/workflows/dependabot-ready.yml",
);
const yml = existsSync(file) ? readFileSync(file, "utf8") : "";

describe("dependabot-ready workflow", () => {
  it("exists", () => {
    expect(existsSync(file)).toBe(true);
  });

  // Runs after CI from the default branch, so it can write to the PR.
  it("triggers on completed CI runs", () => {
    expect(yml).toMatch(/workflow_run:/);
    expect(yml).toMatch(/workflows:\s*\[CI\]/);
    expect(yml).toMatch(/types:\s*\[completed\]/);
  });

  it("only acts on Dependabot pull requests", () => {
    expect(yml).toMatch(/workflow_run\.event == 'pull_request'/);
    expect(yml).toMatch(/workflow_run\.actor\.login == 'dependabot\[bot\]'/);
  });

  // workflow_run has write access and secrets: it must never check out or run
  // the PR's code (the "pwn request" pattern).
  it("never checks out or executes PR code", () => {
    expect(yml).not.toMatch(/actions\/checkout/);
    expect(yml).not.toMatch(/npm (ci|install|run)/);
  });

  it("requests only the permissions it needs", () => {
    const perms = yml.match(/^permissions:\n((?: {2}.+\n)+)/m)?.[1] ?? "";
    expect(perms.trim().split("\n").map((l) => l.trim()).sort()).toEqual([
      "contents: read",
      "issues: write",
      "pull-requests: write",
    ]);
  });

  it("adds the label when green and removes it when no longer green", () => {
    expect(yml).toMatch(/--add-label/);
    expect(yml).toMatch(/--remove-label/);
  });
});
