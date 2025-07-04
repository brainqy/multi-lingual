// This will be a server component
import { sampleBlogPosts } from '@/lib/sample-data';
import { notFound } from 'next/navigation';
import BlogPostClientView from '@/components/features/blog/BlogPostClientView';

// Generate static paths for each blog post
export async function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Define the props inline to avoid build-time type conflicts
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const postIndex = sampleBlogPosts.findIndex(p => p.slug === slug);
  const post = sampleBlogPosts[postIndex];

  if (!post) {
    notFound();
  }

  // Pass the post and its index to the client component
  // The index is needed to update the sample data array on comment submission (for demo purposes)
  return <BlogPostClientView post={post} postIndex={postIndex} />;
}
