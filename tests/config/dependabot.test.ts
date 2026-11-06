import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const config = readFileSync(
  path.resolve(__dirname, "../../.github/dependabot.yml"),
  "utf8",
);

// Text-level checks (no YAML dependency), scoped to the npm entry so the
// github-actions entry cannot satisfy them by accident.
const npm = config.slice(
  config.indexOf('package-ecosystem: "npm"'),
  config.indexOf('package-ecosystem: "github-actions"'),
);

describe("Dependabot config (npm)", () => {
  // A compromised release is usually yanked within days; waiting keeps it out
  // of PRs. Cooldown never delays security updates.
  it("waits before adopting fresh releases, longer for majors", () => {
    expect(npm).toMatch(/cooldown:/);
    expect(npm).toMatch(/default-days:\s*3\b/);
    expect(npm).toMatch(/semver-major-days:\s*7\b/);
  });

  // Without a security group every advisory opens its own PR and CI run.
  it("batches security updates into one group", () => {
    expect(npm).toMatch(/applies-to:\s*"?security-updates"?/);
  });

  // @types/node's major must equal the runtime major; it moves only with a
  // deliberate Node upgrade, so the ignore must not need a hand-edited floor.
  it("ignores @types/node majors without a hardcoded version floor", () => {
    const entry = npm.slice(npm.indexOf('dependency-name: "@types/node"'));
    const block = entry.slice(0, entry.indexOf("labels:"));
    expect(block).toMatch(/update-types:\s*\["version-update:semver-major"\]/);
    expect(block).not.toMatch(/versions:/);
  });
});
