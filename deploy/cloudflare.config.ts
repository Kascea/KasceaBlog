import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "kasceablog",
    compatibilityDate: "2026-11-01",
    domains: ["kascea.dev"],
    assets: {
      notFoundHandling: "404-page",
    },
    observability: {
      enabled: true,
    },
  },
});
