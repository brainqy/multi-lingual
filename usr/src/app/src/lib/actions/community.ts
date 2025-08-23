
'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { CommunityPost, CommunityComment } from '@/types';
import { checkAndAwardBadges } from './gamification';

/**
 * Fetches community posts visible to the current user.
 * - Admins (tenantId is null or 'platform') see all posts.
 * - Regular users/managers see posts from their tenant and platform-wide posts.
 * @param tenantId The current user's tenant ID.
 * @param currentUserId The current user's ID.
 * @returns A promise that resolves to an array of CommunityPost objects.
 */
export async function getCommunityPosts(tenantId: string | null, currentUserId: string): Promise<CommunityPost[]> {
  try {
    // If tenantId is null or 'platform', it's an admin-like view that should see everything.
    // Otherwise, it's a tenant-scoped view.
    const whereClause: Prisma.CommunityPostWhereInput = (tenantId && tenantId !== 'platform')
      ? {
          OR: [
            { tenantId: tenantId },
            { tenantId: 'platform' },
          ],
        }
      : {}; // Empty where clause for admins fetches all posts.

    const posts = await db.communityPost.findMany({
      where: whereClause,
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
      take: 50,
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
export async function createCommunityPost(postData: Omit<CommunityPost, 'id' | 'timestamp' | 'comments' | 'bookmarkedBy' | 'likes' | 'votedBy' | 'registeredBy'>): Promise<CommunityPost | null> {
    console.log("[CommunityAction LOG] 1. createCommunityPost action initiated with data:", postData);
    try {
        console.log("[CommunityAction LOG] 2. Preparing data for database insertion.");
        const dataForDb: Prisma.CommunityPostCreateInput = {
            tenantId: postData.tenantId,
            userId: postData.userId,
            userName: postData.userName,
            userAvatar: postData.userAvatar,
            content: postData.content,
            type: postData.type,
            tags: postData.tags || [],
            moderationStatus: postData.moderationStatus,
            flagCount: postData.flagCount,
            timestamp: new Date(),
            
            // Type-specific fields are only added if they are relevant to the post type
            imageUrl: postData.type === 'text' && postData.imageUrl ? postData.imageUrl : undefined,
            pollOptions: postData.type === 'poll' && postData.pollOptions ? postData.pollOptions : Prisma.JsonNull,
            eventTitle: postData.type === 'event' ? postData.eventTitle : undefined,
            eventDate: postData.type === 'event' && postData.eventDate ? new Date(postData.eventDate) : undefined,
            eventLocation: postData.type === 'event' ? postData.eventLocation : undefined,
            attendees: postData.type === 'event' ? postData.attendees : undefined,
            capacity: postData.type === 'event' ? postData.capacity : undefined,
            assignedTo: postData.type === 'request' ? postData.assignedTo : undefined,
            status: postData.type === 'request' ? postData.status : undefined,
            votedBy: [],
            registeredBy: [],
        };
        console.log("[CommunityAction LOG] 3. Data ready for database:", dataForDb);
        
        console.log("[CommunityAction LOG] 4. Calling db.communityPost.create...");
        const newPost = await db.communityPost.create({
            data: dataForDb,
        });
        console.log("[CommunityAction LOG] 5. Database create operation successful. Result:", newPost);

        console.log("[CommunityAction LOG] 6. Triggering badge check for user:", postData.userId);
        await checkAndAwardBadges(postData.userId);
        console.log("[CommunityAction LOG] 7. Badge check complete.");

        console.log("[CommunityAction LOG] 8. Returning new post from function.");
        return newPost as unknown as CommunityPost;
    } catch (error) {
        console.error('[CommunityAction LOG] 9. Error during post creation:', error);
        return null;
    }
}


/**
 * Adds a comment to a specific post (either community or blog).
 * @param commentData The data for the new comment. Must include either postId or blogPostId.
 * @returns The newly created CommunityComment object or null if failed.
 */
export async function addCommentToPost(commentData: Omit<CommunityComment, 'id' | 'timestamp' | 'replies'>): Promise<CommunityComment | null> {
  try {
    if (!commentData.postId && !commentData.blogPostId) {
      throw new Error("Comment must be associated with either a postId or a blogPostId.");
    }

    const newComment = await db.communityComment.create({
      data: {
        userId: commentData.userId,
        userName: commentData.userName,
        userAvatar: commentData.userAvatar,
        comment: commentData.comment,
        parentId: commentData.parentId,
        timestamp: new Date(),
        // Conditionally connect to either post or blogPost
        ...(commentData.postId && { post: { connect: { id: commentData.postId } } }),
        ...(commentData.blogPostId && { blogPost: { connect: { id: commentData.blogPostId } } }),
      },
    });

    await checkAndAwardBadges(commentData.userId);

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
export async function updateCommunityPost(postId: string, updateData: Partial<Omit<CommunityPost, 'id'>>): Promise<CommunityPost | null> {
    try {
        const postToUpdate = await db.communityPost.findUnique({ where: { id: postId } });
        if (!postToUpdate) return null;

        const cleanUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined)
        );

        const updatedPost = await db.communityPost.update({
            where: { id: postId },
            data: {
                ...cleanUpdateData,
                pollOptions: updateData.pollOptions ? updateData.pollOptions : (updateData.type !== 'poll' ? Prisma.JsonNull : undefined),
                tags: updateData.tags ? updateData.tags : undefined,
                votedBy: updateData.votedBy || undefined,
                registeredBy: updateData.registeredBy || undefined,
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
