import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    id: z.string(),
    title: z.string(),
    author: z.string(),
    publishDate: z.date(),
  }),
});

export const collections = {
  blog: blogCollection,
};
