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
    include: ["tests/{unit,api}/**/*.test.{ts,tsx}"],
    testTimeout: 15_000,
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
        "src/config/security.ts",
        "src/content/contact.ts",
        "src/content/agents.ts",
        "src/content/blog.ts",
        "src/content/marketing.ts",
        "src/content/pricing.ts",
        "src/content/product.ts",
        "src/content/services.ts",
        "src/content/shared.ts",
        "src/lib/seo.ts",
        "src/lib/contact/schema.ts",
        "src/server/env.ts",
        "src/server/contact/*.ts",
        "src/components/agents/AgentIcon.tsx",
        "src/components/marketing/MarketingIcon.tsx",
        "src/components/marketing/Navbar.tsx",
        "src/components/ui/Button.tsx",
        "src/components/forms/ContactForm.tsx",
      ],
    },
  },
});
