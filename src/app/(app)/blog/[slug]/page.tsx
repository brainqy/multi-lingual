// This page now defers all logic to the client component
// to resolve a persistent build issue.
import BlogPostClientView from '@/components/features/blog/BlogPostClientView';
import { sampleBlogPosts } from '@/lib/sample-data';

// Generate static paths for each blog post at build time
export async function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage() {
  return <BlogPostClientView />;
}
