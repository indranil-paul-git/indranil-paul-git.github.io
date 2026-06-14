import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const wiki = defineCollection({
  // Load markdown and mdx files from the root-level 'content' directory
  loader: glob({ base: './content', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.date().or(z.string()).optional(),
    order: z.number().optional(),
    draft: z.boolean().optional()
  })
});

export const collections = { wiki };
