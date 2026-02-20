import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import packageJson from "./package.json";

// Groups vendor libraries into stable, named chunks so browsers can cache them
// independently of frequently-changing app code. Only applied in production.
function manualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;

  if (/node_modules\/(react|react-dom|react-router-dom)\//.test(id)) {
    return "vendor-react";
  }
  if (/node_modules\/@tanstack\/(react-query|react-table)\//.test(id)) {
    return "vendor-query";
  }
  if (/node_modules\/recharts\//.test(id)) {
    return "vendor-charts";
  }
  if (/node_modules\/@tabler\/icons-react\//.test(id)) {
    return "vendor-icons";
  }
  if (/node_modules\/@radix-ui\//.test(id)) {
    return "vendor-radix";
  }
  if (/node_modules\/(motion|cobe|cmdk|vaul|sonner|next-themes)\//.test(id)) {
    return "vendor-ui";
  }
}

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
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  }),
}));
