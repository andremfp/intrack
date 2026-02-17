import "@testing-library/jest-dom";

// Stub import.meta.env so src/* modules that read VITE_* vars at module-load
// time don't throw when imported in the node test environment.
// Individual tests can override specific keys via process.env (the readEnv()
// fallback path used by rate-limit.ts).
Object.assign(import.meta, {
  env: {
    DEV: false,
    VITE_SUPABASE_URL: undefined,
    VITE_LOCAL_SUPABASE_URL: undefined,
    VITE_SUPABASE_FUNCTIONS_URL: undefined,
  },
});
