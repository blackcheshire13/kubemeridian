// One reader for blog frontmatter, shared by the config (sidebar, RSS, OG checks),
// the posts data loader and scripts/og-cards.mjs. Plain JS so the script can import it.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @param {string} relativePath path under docs/ @returns {Record<string, any>} */
export function readFrontmatter(relativePath) {
  return matter(readFileSync(join(DOCS, relativePath), 'utf8')).data;
}

/** @param {unknown} d a frontmatter date (YAML gives a Date) @returns {string} YYYY-MM-DD */
export function isoDate(d) {
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
}

// newest first; same-day posts in title order
/** @param {{ date: string, title: string }} a @param {{ date: string, title: string }} b */
export function comparePosts(a, b) {
  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
}

export function blogPosts() {
  return readdirSync(join(DOCS, 'blog'))
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => {
      const fm = readFrontmatter(`blog/${f}`);
      if (!fm.title || !fm.date) {
        throw new Error(`blog/${f} needs "title" and "date" in its frontmatter`);
      }
      return {
        slug: f.replace(/\.md$/, ''),
        file: `blog/${f}`,
        title: String(fm.title),
        sidebarTitle: String(fm.sidebarTitle || fm.title),
        date: isoDate(fm.date),
        description: String(fm.description ?? ''),
        tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      };
    })
    .sort(comparePosts);
}
