import { createContentLoader } from 'vitepress';
import { comparePosts, isoDate } from '../blog.mjs';

export interface Post {
  title: string;
  url: string;
  date: string;
  description: string;
  tags: string[];
}

declare const data: Post[];
export { data };

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
          date: isoDate(frontmatter.date),
          description: String(frontmatter.description ?? ''),
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
        };
      })
      .sort(comparePosts);
  },
});
