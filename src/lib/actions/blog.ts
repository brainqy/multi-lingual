
'use server';

import { db } from '@/lib/db';
import type { BlogPost, BlogGenerationSettings } from '@/types';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Fetches all blog posts from the database.
 * @returns A promise that resolves to an array of BlogPost objects.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await db.blogPost.findMany({
      orderBy: { date: 'desc' },
      include: {
        comments: {
          orderBy: {
            timestamp: 'asc',
          }
        }
      }
    });
    return posts as unknown as BlogPost[];
  } catch (error) {
    console.error('[BlogAction] Error fetching blog posts:', error);
    return [];
  }
}

/**
 * Fetches a single blog post by its slug.
 * @param slug The unique slug for the blog post.
 * @returns The BlogPost object or null.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: {
            timestamp: 'asc',
          }
        }
      }
    });
    return post as unknown as BlogPost | null;
  } catch (error) {
    console.error(`[BlogAction] Error fetching blog post by slug ${slug}:`, error);
    return null;
  }
}


/**
 * Creates a new blog post, ensuring the slug is unique.
 * @param postData The data for the new blog post.
 * @returns The newly created BlogPost object or null.
 */
export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'comments' | 'bookmarkedBy'>): Promise<BlogPost | null> {
  try {
    let slug = postData.slug;
    const existingPost = await db.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      // If slug exists, append a unique identifier (timestamp)
      slug = `${slug}-${Date.now()}`;
    }

    const newPost = await db.blogPost.create({
      data: {
        ...postData,
        slug, // Use the potentially modified, unique slug
        tags: postData.tags || [],
        bookmarkedBy: [],
      },
    });
    return newPost as unknown as BlogPost;
  } catch (error) {
    console.error('[BlogAction] Error creating blog post:', error);
    if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.error('This is a unique constraint violation, likely on the slug.');
        }
    }
    return null;
  }
}

/**
 * Fetches the blog generation settings.
 * @returns The settings object or a default if none exists.
 */
export async function getBlogGenerationSettings(): Promise<BlogGenerationSettings> {
  try {
    let settings = await db.blogGenerationSettings.findFirst();
    if (!settings) {
      // Create default settings if none exist
      settings = await db.blogGenerationSettings.create({
        data: {
          generationIntervalHours: 24,
          topics: ['Career Advice', 'Resume Writing Tips', 'Interview Skills', 'Networking Strategies', 'Industry Trends'],
          style: 'informative',
        },
      });
    }
    return settings as unknown as BlogGenerationSettings;
  } catch (error) {
    console.error('[BlogAction] Error fetching blog settings:', error);
    // Return a safe default in case of error
    return {
      id: 'default',
      generationIntervalHours: 24,
      topics: ['Career Advice'],
      style: 'informative',
    };
  }
}

/**
 * Updates the blog generation settings.
 * @param settingsData The settings data to update.
 * @returns The updated settings object or null.
 */
export async function updateBlogGenerationSettings(settingsData: Partial<Omit<BlogGenerationSettings, 'id'>>): Promise<BlogGenerationSettings | null> {
  try {
    const currentSettings = await getBlogGenerationSettings();
    const updatedSettings = await db.blogGenerationSettings.update({
      where: { id: currentSettings.id },
      data: settingsData,
    });
    return updatedSettings as unknown as BlogGenerationSettings;
  } catch (error) {
    console.error('[BlogAction] Error updating blog settings:', error);
    return null;
  }
}
