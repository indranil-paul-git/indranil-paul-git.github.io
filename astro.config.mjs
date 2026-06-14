import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkMermaid } from './src/lib/remark-mermaid';
import { remarkAdmonitions } from './src/lib/remark-admonitions';
import fs from 'fs';
import path from 'path';

// Dynamically read custom domain from public/CNAME if present
let siteUrl = 'http://localhost:4321';
try {
  const cnamePath = path.resolve('./public/CNAME');
  if (fs.existsSync(cnamePath)) {
    const domain = fs.readFileSync(cnamePath, 'utf-8').trim();
    if (domain) {
      siteUrl = `https://${domain}`;
    }
  }
} catch (e) {
  console.warn('Could not read CNAME file, defaulting site URL to localhost.');
}

export default defineConfig({
  site: siteUrl,
  base: '/',
  devToolbar: {
    enabled: false
  },
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMermaid, remarkAdmonitions],
    shikiConfig: {
      theme: 'one-dark-pro'
    }
  },
  output: 'static'
});
