// This page now defers all logic to the client component
// to resolve a persistent build issue.
import BlogPostClientView from '@/components/features/blog/BlogPostClientView';

// By removing generateStaticParams, this page will be dynamically rendered
// at request time, which avoids the build-time error.
// import { sampleBlogPosts } from '@/lib/sample-data';
// export async function generateStaticParams() {
//   return sampleBlogPosts.map((post) => ({
//     slug: post.slug,
//   }));
// }

export default function BlogPostPage() {
  return <BlogPostClientView />;
}
