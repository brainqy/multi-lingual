
import { sampleBlogPosts } from '@/lib/sample-data';
import BlogPostClientView from '@/components/features/blog/BlogPostClientView';
import { notFound } from 'next/navigation';

// This function generates the static paths for each blog post at build time.
// It MUST be exported from the page.tsx file.
export async function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Props type for a dynamic page in Next.js App Router
interface BlogPostPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
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
