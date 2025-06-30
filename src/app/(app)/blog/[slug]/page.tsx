
import { sampleBlogPosts } from '@/lib/sample-data';
import BlogPostClientView from '@/components/features/blog/BlogPostClientView';
import { notFound } from 'next/navigation';

// Define a complete props interface that matches Next.js expectations
interface BlogPostPageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// This function generates the static paths for each blog post at build time.
export function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// The page component itself is now a Server Component
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const slug = params.slug;
  const postIndex = sampleBlogPosts.findIndex(p => p.slug === slug);
  const post = postIndex !== -1 ? sampleBlogPosts[postIndex] : null;

  if (!post) {
    notFound();
  }

  // Render the Client Component and pass the post data as props
  return <BlogPostClientView post={post} postIndex={postIndex} />;
}
