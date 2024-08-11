import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  vite: {
    build: {
      target: "esnext",
      minify: "esbuild",
    },
  },
  output: "static",
  experimental: { contentCollectionCache: true },
  integrations: [mdx(), tailwind()],
});
