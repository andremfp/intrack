import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devtools()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version),
  },
  ...(mode === "production" && {
    build: {
      // Let Rollup handle chunk splitting automatically. Manual chunks break
      // the initialization order guarantee: e.g. @radix-ui runs module-level
      // code that accesses React exports, so forcing them into separate chunks
      // causes a TDZ ReferenceError ("Cannot access 'X' before initialization")
      // at runtime when the chunks load in the wrong order.
      chunkSizeWarningLimit: 600,
    },
  }),
}));
