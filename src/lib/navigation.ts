import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { getCollection } from 'astro:content';

export function resolvePath(targetPath: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const cleanPath = targetPath.replace(/^\//, '');
  return cleanPath ? `${base}/${cleanPath}` : `${base}/`;
}

export interface FolderMeta {
  title?: string;
  description?: string;
  icon?: string;
  order?: number;
}

export interface NavNode {
  name: string;        // E.g., 'homelab' or 'traefik'
  path: string;        // E.g., '/portfolio/homelab' or '/portfolio/homelab/traefik'
  isFolder: boolean;
  title: string;       // Custom title or fallback
  description?: string;
  icon?: string;       // Icon name (for folders)
  order: number;       // Sort order
  tags?: string[];
  date?: Date | string;
  children?: NavNode[];
}

/**
 * Reads and parses _meta.yml for a given subfolder path inside content/
 */
export function getFolderMeta(folderPath: string): FolderMeta {
  const metaFilePath = path.join(process.cwd(), 'content', folderPath, '_meta.yml');
  let meta: FolderMeta = {};

  try {
    if (fs.existsSync(metaFilePath)) {
      const content = fs.readFileSync(metaFilePath, 'utf-8');
      meta = parse(content) || {};
    }
  } catch (e) {
    // Silently ignore if folder metadata doesn't exist
  }

  return meta;
}

/**
 * Builds the complete navigation hierarchy tree from content collection articles
 * and folder configurations.
 */
export async function getNavigationTree(): Promise<NavNode[]> {
  const articles = await getCollection('wiki');
  const rootNodes: NavNode[] = [];
  const nodeMap = new Map<string, NavNode>();

  // 1. Process all folder structures from article IDs
  articles.forEach((article) => {
    const parts = article.id.split('/');
    
    // For each folder level in the article path
    for (let i = 0; i < parts.length - 1; i++) {
      const folderParts = parts.slice(0, i + 1);
      const folderPath = folderParts.join('/');
      
      if (!nodeMap.has(folderPath)) {
        const folderName = parts[i];
        const meta = getFolderMeta(folderPath);
        
        // Build fallback title from folder name
        const fallbackTitle = folderName
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const node: NavNode = {
          name: folderName,
          path: resolvePath(folderPath),
          isFolder: true,
          title: meta.title || fallbackTitle,
          description: meta.description,
          icon: meta.icon || 'folder',
          order: meta.order !== undefined ? meta.order : 999,
          children: []
        };
        nodeMap.set(folderPath, node);
      }
    }
  });

  // 2. Link child folders to parent folders, or assign to root
  for (const [folderPath, node] of nodeMap.entries()) {
    const parts = folderPath.split('/');
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('/');
      const parentNode = nodeMap.get(parentPath);
      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  }

  // 3. Add articles as leaf nodes
  articles.forEach((article) => {
    const parts = article.id.split('/');
    const fileName = parts[parts.length - 1];
    
    // Build fallback title from filename
    const fallbackTitle = fileName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const title = article.data.title || fallbackTitle;
    const path = resolvePath(article.id);
    
    const node: NavNode = {
      name: fileName,
      path,
      isFolder: false,
      title,
      description: article.data.description,
      tags: article.data.tags,
      date: article.data.date,
      order: article.data.order !== undefined ? article.data.order : 100
    };

    if (parts.length > 1) {
      const folderPath = parts.slice(0, -1).join('/');
      const parentNode = nodeMap.get(folderPath);
      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  // 4. Sort folders first (by order then title), then files (by order then title)
  const sortNodes = (nodes: NavNode[]) => {
    nodes.sort((a, b) => {
      // Sort by order first
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      
      // Folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      
      // Sort by title
      return a.title.localeCompare(b.title);
    });
    
    // Sort child levels recursively
    nodes.forEach((node) => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);
  return rootNodes;
}

/**
 * Generates breadcrumb paths for a given URL path slug
 */
export async function getBreadcrumbs(currentPath: string): Promise<{ title: string; path: string }[]> {
  const cleanPath = currentPath.replace(/^\/|\/$/g, '');
  if (!cleanPath) return [];

  const parts = cleanPath.split('/');
  const breadcrumbs: { title: string; path: string }[] = [];

  // Add Dashboard root
  breadcrumbs.push({ title: 'Dashboard', path: resolvePath('') });

  const articles = await getCollection('wiki');
  
  for (let i = 0; i < parts.length; i++) {
    const partialPath = parts.slice(0, i + 1).join('/');
    const isLast = i === parts.length - 1;
    let title = parts[i];

    // Fallback title format
    title = title.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    if (isLast) {
      const article = articles.find((a) => a.id === partialPath);
      if (article && article.data.title) {
        title = article.data.title;
      } else {
        const meta = getFolderMeta(partialPath);
        if (meta.title) title = meta.title;
      }
    } else {
      const meta = getFolderMeta(partialPath);
      if (meta.title) title = meta.title;
    }

    breadcrumbs.push({
      title,
      path: resolvePath(partialPath)
    });
  }

  return breadcrumbs;
}

export interface SiteConfig {
  logoPrompt: string;
  logoMain: string;
  logoSecondary: string;
  titleSuffix: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  logoPrompt: '$_',
  logoMain: 'Wiki',
  logoSecondary: 'Knowledge Base',
  titleSuffix: 'Knowledge Base'
};

export function getSiteConfig(): SiteConfig {
  const configPath = path.join(process.cwd(), 'content', 'config.yml');
  let config: Partial<SiteConfig> = {};

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      config = parse(content) || {};
    }
  } catch (e) {
    // Fall back to default config if file reading fails
  }

  return {
    logoPrompt: config.logoPrompt || DEFAULT_CONFIG.logoPrompt,
    logoMain: config.logoMain || DEFAULT_CONFIG.logoMain,
    logoSecondary: config.logoSecondary || DEFAULT_CONFIG.logoSecondary,
    titleSuffix: config.titleSuffix || DEFAULT_CONFIG.titleSuffix
  };
}
