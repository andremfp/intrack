import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(
    path.resolve(__dirname, `../../.github/workflows/${name}`),
    "utf8",
  );

const ci = read("ci.yml");
const staging = read("staging.yml");
const production = read("production.yml");

describe("CI workflow", () => {
  // AGENTS.md promises lint runs on every PR; it must be an explicit step
  // because neither `build` nor `test` invokes ESLint.
  it("runs lint before the build", () => {
    const lint = ci.indexOf("run: npm run lint");
    expect(lint).toBeGreaterThan(-1);
    expect(lint).toBeLessThan(ci.indexOf("run: npm run build"));
  });

  // The local-Supabase job is slow; a newer push to the same PR supersedes it.
  it("cancels superseded runs of the same ref", () => {
    expect(ci).toMatch(/concurrency:/);
    expect(ci).toMatch(/cancel-in-progress:\s*true/);
  });

  // `test` and `deploy-staging` are required status checks: renaming a job id
  // silently drops the gate.
  it("keeps the `test` job id used by branch protection", () => {
    expect(ci).toMatch(/^ {2}test:/m);
  });

  // Same-version or lower-version promotions must fail, not only a reused tag.
  it("requires the release version to be newer than main's", () => {
    expect(ci).toMatch(/origin\/main:package\.json/);
    expect(ci).toMatch(/sort -V/);
  });
});

describe("Deploy workflows", () => {
  // Two quick pushes must never run `supabase db push` in parallel, and a
  // running migration must never be cancelled midway.
  it.each([
    ["staging.yml", staging, "deploy-staging"],
    ["production.yml", production, "deploy-production"],
  ])("%s serializes deploys without cancelling", (_name, yml, group) => {
    expect(yml).toMatch(new RegExp(`concurrency:\\s*\\n\\s*group:\\s*${group}`));
    expect(yml).toMatch(/cancel-in-progress:\s*false/);
  });

  it("keeps the `deploy-staging` job id used by branch protection", () => {
    expect(staging).toMatch(/^ {2}deploy-staging:/m);
  });
});

describe("Job timeouts", () => {
  // A hung step must not burn the default 6-hour Actions limit.
  it.each([
    ["ci.yml", ci],
    ["staging.yml", staging],
    ["production.yml", production],
  ])("%s sets timeout-minutes on every job", (_name, yml) => {
    const jobs = yml.split(/^jobs:\s*$/m)[1];
    const jobCount = (jobs.match(/^ {2}[\w-]+:\s*$/gm) ?? []).length;
    const timeouts = (jobs.match(/^ {4}timeout-minutes:\s*\d+/gm) ?? []).length;
    expect(jobCount).toBeGreaterThan(0);
    expect(timeouts).toBe(jobCount);
  });
});

describe("Production release", () => {
  // The GitHub CLI pins the tag to the deployed commit and avoids a
  // third-party action in the job that holds `contents: write`.
  it("creates the release with gh at the deployed commit", () => {
    expect(production).not.toMatch(/softprops/);
    expect(production).toMatch(/gh release create/);
    expect(production).toMatch(/--target "\$GITHUB_SHA"/);
  });

  it("skips creation when the release already exists (safe re-runs)", () => {
    expect(production).toMatch(/gh release view/);
  });
});

describe("Supabase CLI and generated types", () => {
  const lock = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../package-lock.json"), "utf8"),
  ) as { packages: Record<string, { version: string }> };
  const pkg = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  // `npx supabase` in CI resolves the lockfile version, while setup-cli
  // installs the pinned one: they must be the same CLI.
  it.each([
    ["ci.yml", ci],
    ["staging.yml", staging],
    ["production.yml", production],
  ])("pins setup-cli in %s to the locked supabase version", (_name, wf) => {
    const pinned = wf.match(/setup-cli[\s\S]*?version:\s*"([^"]+)"/)?.[1];
    expect(pinned).toBe(lock.packages["node_modules/supabase"].version);
  });

  // The CLI emits unformatted TypeScript; CI's `git diff --exit-code
  // src/schema.ts` only passes if the script formats it deterministically.
  it("formats the generated schema with oxfmt", () => {
    expect(pkg.scripts["sb:local:generate:schema"]).toMatch(
      /gen types typescript --local > src\/schema\.ts && oxfmt src\/schema\.ts/,
    );
  });
});

describe("rate-limit edge function", () => {
  // Deno resolves `npm:` specifiers against node_modules when present, so an
  // exact pin that drifts from the lockfile fails the Deno tests in CI.
  it("imports the supabase-js version locked in package-lock.json", () => {
    const lock = JSON.parse(
      readFileSync(path.resolve(__dirname, "../../package-lock.json"), "utf8"),
    ) as { packages: Record<string, { version: string }> };
    const fn = readFileSync(
      path.resolve(__dirname, "../../supabase/functions/rate-limit/index.ts"),
      "utf8",
    );
    const pinned = fn.match(/npm:@supabase\/supabase-js@([\w.-]+)"/)?.[1];
    expect(pinned).toBe(lock.packages["node_modules/@supabase/supabase-js"].version);
  });
});
