
'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { CommunityPost, CommunityComment } from '@/types';

/**
 * Fetches community posts visible to the current user (tenant-specific and platform-wide).
 * @param tenantId The current user's tenant ID.
 * @param currentUserId The current user's ID.
 * @returns A promise that resolves to an array of CommunityPost objects.
 */
export async function getCommunityPosts(tenantId: string | null, currentUserId: string): Promise<CommunityPost[]> {
  try {
    const posts = await db.communityPost.findMany({
      where: {
        OR: [
          { tenantId: tenantId },
          { tenantId: 'platform' }
        ],
      },
      include: {
        comments: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Limit to the latest 50 posts for performance
    });
    return posts as unknown as CommunityPost[];
  } catch (error) {
    console.error('[CommunityAction] Error fetching posts:', error);
    return [];
  }
}

/**
 * Creates a new community post.
 * @param postData The data for the new post.
 * @returns The newly created CommunityPost object or null if failed.
 */
export async function createCommunityPost(postData: Omit<CommunityPost, 'id' | 'timestamp' | 'comments'>): Promise<CommunityPost | null> {
  try {
    const newPost = await db.communityPost.create({
      data: {
        ...postData,
        timestamp: new Date(),
        pollOptions: postData.pollOptions || Prisma.JsonNull,
        tags: postData.tags || [],
      },
    });
    return newPost as unknown as CommunityPost;
  } catch (error) {
    console.error('[CommunityAction] Error creating post:', error);
    return null;
  }
}

/**
 * Adds a comment to a specific post.
 * @param postId The ID of the post to comment on.
 * @param commentData The data for the new comment.
 * @returns The newly created CommunityComment object or null if failed.
 */
export async function addCommentToPost(commentData: Omit<CommunityComment, 'id' | 'timestamp' | 'replies'>): Promise<CommunityComment | null> {
  try {
    const newComment = await db.communityComment.create({
      data: {
        ...commentData,
        timestamp: new Date(),
      },
    });
    return newComment as unknown as CommunityComment;
  } catch (error) {
    console.error('[CommunityAction] Error adding comment:', error);
    return null;
  }
}

/**
 * Updates a community post (e.g., content, status, likes).
 * @param postId The ID of the post to update.
 * @param updateData The data to update.
 * @returns The updated CommunityPost object or null if failed.
 */
export async function updateCommunityPost(postId: string, updateData: Partial<CommunityPost>): Promise<CommunityPost | null> {
    try {
        const cleanUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined)
        );

        const updatedPost = await db.communityPost.update({
            where: { id: postId },
            data: {
                ...cleanUpdateData,
                pollOptions: updateData.pollOptions ? updateData.pollOptions : (updateData.type !== 'poll' ? Prisma.JsonNull : undefined),
                tags: updateData.tags ? updateData.tags : undefined,
            },
            include: {
                comments: true,
            }
        });
        return updatedPost as unknown as CommunityPost;
    } catch (error) {
        console.error(`[CommunityAction] Error updating post ${postId}:`, error);
        return null;
    }
}
