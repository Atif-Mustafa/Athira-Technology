import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      skipFull: false,
      include: [
        "src/config/site.ts",
        "src/content/agents.ts",
        "src/components/agents/AgentIcon.tsx",
        "src/components/marketing/Navbar.tsx",
        "src/components/ui/Button.tsx",
      ],
    },
  },
});
