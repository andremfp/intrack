import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Global options inherited by each project via `extends: true`.
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/**/*.test.{ts,tsx}"],
          // Hand the jsdom-only dirs to the jsdom project.
          exclude: [
            "tests/components/**/*.test.tsx",
            "tests/hooks/**/*.test.{ts,tsx}",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: [
            "tests/components/**/*.test.tsx",
            "tests/hooks/**/*.test.{ts,tsx}",
          ],
        },
      },
    ],
  },
});
