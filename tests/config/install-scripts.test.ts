import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const readJson = (file: string) =>
  JSON.parse(readFileSync(path.join(root, file), "utf8"));

// npm 11.20+ skips dependency install scripts unless `allowScripts` in
// package.json says otherwise. Every package that has one needs an explicit
// decision, so a new one shows up in review instead of as an install warning.
describe("dependency install scripts", () => {
  const allowScripts: Record<string, boolean> =
    readJson("package.json").allowScripts ?? {};
  const lock: { packages: Record<string, { hasInstallScript?: boolean }> } =
    readJson("package-lock.json");

  const names = [
    ...new Set(
      Object.entries(lock.packages)
        .filter(([, pkg]) => pkg.hasInstallScript)
        .map(([key]) => key.split("node_modules/").pop() as string),
    ),
  ];

  it.each(names)("has an explicit allowScripts decision for %s", (name) => {
    expect(allowScripts).toHaveProperty([name]);
  });
});
