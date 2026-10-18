import { createContentLoader } from 'vitepress';

export interface Post {
  title: string;
  url: string;
  date: string;
  description: string;
}

declare const data: Post[];
export { data };

function toIsoDate(d: unknown): string {
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
}

export default createContentLoader('blog/!(index).md', {
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter }) => {
        if (!frontmatter.title || !frontmatter.date) {
          throw new Error(`blog post ${url} needs "title" and "date" in its frontmatter`);
        }
        return {
          title: String(frontmatter.title),
          url,
          date: toIsoDate(frontmatter.date),
          description: String(frontmatter.description ?? ''),
        };
      })
      // newest first; same-day posts in title order, as in blog/index.md and the sidebar
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  },
});
