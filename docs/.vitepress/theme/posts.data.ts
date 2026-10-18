import { createContentLoader } from 'vitepress';
import { blogPosts } from '../blog.mjs';

export interface Post {
  title: string;
  url: string;
  date: string;
  description: string;
  tags: string[];
}

declare const data: Post[];
export { data };

// createContentLoader keeps the dev server watching blog/; the data itself comes from the
// same reader as the sidebar, RSS and social cards.
export default createContentLoader('blog/*.md', {
  transform(): Post[] {
    return blogPosts().map(({ slug, title, date, description, tags }) => ({
      title,
      url: `/blog/${slug}`,
      date,
      description,
      tags,
    }));
  },
});
