
import { sampleBlogPosts } from '@/lib/sample-data';
import BlogPostClientView from '@/components/features/blog/BlogPostClientView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { BlogPost } from '@/types';

// This function generates the static paths for each blog post at build time.
// It MUST be exported from the page.tsx file.
export async function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Define explicit props type to help with type inference
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// The page component itself is now a Server Component
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const slug = params.slug;
  const postIndex = sampleBlogPosts.findIndex(p => p.slug === slug);
  const post = postIndex !== -1 ? sampleBlogPosts[postIndex] : null;

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-muted-foreground">The blog post you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-4">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blog</Link>
        </Button>
      </div>
    );
  }

  // Render the Client Component and pass the post data as props
  return <BlogPostClientView post={post} postIndex={postIndex} />;
}
