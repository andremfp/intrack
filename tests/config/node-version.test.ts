import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("Node.js version pin", () => {
  const engine: string = JSON.parse(read("package.json")).engines.node;

  // Vercel prefers package.json `engines` over the dashboard setting, and an
  // open range (">=22") resolves to the newest runtime (e.g. 26.x).
  it("pins engines.node to a single major (e.g. 24.x)", () => {
    expect(engine).toMatch(/^\d+\.x$/);
  });

  it("matches the major in .nvmrc used by CI", () => {
    expect(read(".nvmrc").trim().split(".")[0]).toBe(engine.split(".")[0]);
  });

  // Types newer than the runtime would let code use APIs that don't exist at runtime.
  it("keeps the @types/node major equal to the runtime major", () => {
    const types: string = JSON.parse(read("package.json")).devDependencies[
      "@types/node"
    ];
    expect(types.replace(/^[^\d]*/, "").split(".")[0]).toBe(
      engine.split(".")[0],
    );
  });
});
