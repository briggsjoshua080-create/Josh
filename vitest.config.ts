import { defineConfig } from "vitest/config";
import path from "node:path";

// Standalone Vitest config: the pure-logic tests don't need the app's
// React/Tailwind/PWA plugins from vite.config.ts.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
