import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  compressHTML: true,
  redirects: {
    "/work": "/about#experience",
    "/projects": "/about#projects",
    "/blog": "/posts",
    "/blog/[slug]": "/posts/[slug]",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    react(),
    sitemap(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [
          remarkCollapse,
          {
            test: "Table of contents",
          },
        ],
      ],
    }),
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
